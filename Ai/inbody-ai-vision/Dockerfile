FROM python:3.10-slim

# Install system dependencies required for OpenCV and PaddleOCR
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# 1. Fix pip caching: Remove --no-cache-dir and use BuildKit cache mount correctly
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# 2. Pre-create directories for models to avoid permission issues at runtime
# PaddleOCR and Ultralytics use these by default
RUN mkdir -p /root/.paddleocr /root/.config/Ultralytics /root/.cache/huggingface

# Copy the rest of the application
# Use .dockerignore to avoid copying models/ if they are large
COPY . .

# Expose the port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Command to run the application with limited workers (1 worker to save memory)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
