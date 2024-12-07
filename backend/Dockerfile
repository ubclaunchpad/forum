# Build stage
FROM ubuntu:22.04 AS builder

# Railway environment variables
ARG RAILWAY_ENVIRONMENT
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_SERVICE_ID

# Prevent apt from prompting for input
ENV DEBIAN_FRONTEND=noninteractive

# Install Python and build dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add UV to PATH
ENV PATH="/root/.cargo/bin:$PATH"

# Set working directory
WORKDIR /app

# Set environment variables
ENV UV_LINK_MODE=copy
ENV PYTHONUNBUFFERED=1

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (without project install)
RUN --mount=type=cache,id=s/${RAILWAY_SERVICE_ID}-/root/.cache/uv,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Copy the rest of the application
COPY . .

# Install project and compile bytecode
RUN --mount=type=cache,id=s/${RAILWAY_SERVICE_ID}-/root/.cache/uv,target=/root/.cache/uv \
    uv sync --frozen --compile-bytecode

# Production stage
FROM ubuntu:22.04

# Railway environment variables
ARG RAILWAY_ENVIRONMENT

# Install Python runtime
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -u 1000 app

# Set working directory
WORKDIR /app

# Copy virtual environment and application files from builder
COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --chown=app:app . .

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Switch to non-root user
USER app

# Expose the port that Railway will use
EXPOSE 8000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]