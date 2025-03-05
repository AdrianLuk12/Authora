# backend/Dockerfile
FROM python:3.13.2-bookworm

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose gRPC port
EXPOSE 50051

# Run the gRPC server
CMD ["python", "src/server.py"]