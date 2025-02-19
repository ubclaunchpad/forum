FROM python:3.12-slim

# Install system dependencies including Tesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY pyproject.toml .
RUN pip install uv && \
    uv pip install -e .

# Copy application code
COPY . .

# Run the application
CMD ["python", "-m", "main"] 