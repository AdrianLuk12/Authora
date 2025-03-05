import grpc
from concurrent import futures
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import auth_pb2
import auth_pb2_grpc
import os

# load env variables
from dotenv import load_dotenv
load_dotenv()

# Import the User model
from models.user import User, Base

# Database setup
IN_DOCKER = os.environ.get("IN_DOCKER")

DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME")
DB_URL = ""

if IN_DOCKER == "true":
    DB_URL=f"postgresql://{DB_USER}:{DB_PASSWORD}@postgres:5432/{DB_NAME}"
else:
    DB_URL=f"postgresql://{DB_USER}:{DB_PASSWORD}@0.0.0.0:5432/{DB_NAME}"

engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create tables (run this once)
Base.metadata.create_all(bind=engine)

# Helper functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# gRPC service implementation
class AuthService(auth_pb2_grpc.AuthServiceServicer):
    def RegisterUser(self, request, context):
        db = SessionLocal()
        try:
            hashed_password = get_password_hash(request.password)
            db_user = User(
                username=request.username,
                email=request.email,
                hashed_password=hashed_password,
                is_active=True,  # Set is_active to True by default
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return auth_pb2.RegisterResponse(success=True, message="User registered successfully")
        except IntegrityError:
            db.rollback()
            return auth_pb2.RegisterResponse(success=False, message="Username or email already exists")
        finally:
            db.close()

    def LoginUser(self, request, context):
        db = SessionLocal()
        try:
            db_user = db.query(User).filter(User.username == request.username).first()
            # Check if user exists, password is correct, and account is active
            if not db_user or not verify_password(request.password, db_user.hashed_password) or not db_user.is_active:
                return auth_pb2.LoginResponse(success=False, token="")
            
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": db_user.username}, expires_delta=access_token_expires
            )
            return auth_pb2.LoginResponse(success=True, token=access_token)
        finally:
            db.close()

# Start the gRPC server
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    auth_pb2_grpc.add_AuthServiceServicer_to_server(AuthService(), server)
    server.add_insecure_port("[::]:50051")
    print("gRPC server running on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.info("Starting gRPC server...")
    serve()