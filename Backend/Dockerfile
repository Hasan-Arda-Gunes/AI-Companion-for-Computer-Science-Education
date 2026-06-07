FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies including Java
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Verify Java installation
RUN java -version

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
