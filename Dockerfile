# Use Python image
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libssl-dev \
    python3-dev \
    libgl1-mesa-glx \
    libglib2.0-0 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip && \
    pip install ultralytics torch python-dotenv opencv-python matplotlib

# Copy the application code
COPY main.py .

# Copy the model file into the container
COPY yolov8x.pt .

# Expose port (if main.py serves anything)
EXPOSE 8000

# Run the main controller
CMD ["python", "main.py"]
