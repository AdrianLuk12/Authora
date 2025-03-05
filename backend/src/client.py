import grpc
import auth_pb2
import auth_pb2_grpc

def run():
    channel = grpc.insecure_channel("localhost:50051")
    stub = auth_pb2_grpc.AuthServiceStub(channel)

    # Register a user
    register_response = stub.RegisterUser(
        auth_pb2.RegisterRequest(
            username="testuser",
            email="test@example.com",
            password="password123",
        )
    )
    print("Register Response:", register_response)

    # Login the user
    login_response = stub.LoginUser(
        auth_pb2.LoginRequest(
            username="testuser",
            password="password123",
        )
    )
    print("Login Response:", login_response)

if __name__ == "__main__":
    run()