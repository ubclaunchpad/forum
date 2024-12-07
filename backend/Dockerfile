# Build stage
FROM python:3.11-slim-bookworm AS builder

# Copy UV binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Railway environment variables needed at build time
ARG RAILWAY_ENVIRONMENT_NAME
ARG RAILWAY_ENVIRONMENT_ID
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_SERVICE_ID
ARG RAILWAY_PROJECT_ID
ARG RAILWAY_PROJECT_NAME
ARG RAILWAY_DEPLOYMENT_ID

# Set workdir
WORKDIR /app

# Set environment variables
ENV UV_LINK_MODE=copy
ENV PYTHONUNBUFFERED=1

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (without project install)
RUN --mount=type=cache,id=s/a7f9edc8-75a1-4cb9-8b8e-fe061cf20e14-/root/.cache/uv,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Copy the rest of the application
COPY . .

# Install project and compile bytecode
RUN --mount=type=cache,id=s/a7f9edc8-75a1-4cb9-8b8e-fe061cf20e14-/root/.cache/uv,target=/root/.cache/uv \
    uv sync --frozen --compile-bytecode

# Production stage
FROM python:3.11-slim-bookworm

# Railway runtime environment variables
ARG RAILWAY_PUBLIC_DOMAIN
ARG RAILWAY_PRIVATE_DOMAIN
ARG RAILWAY_ENVIRONMENT_NAME
ARG RAILWAY_SERVICE_NAME
ARG RAILWAY_PROJECT_NAME

# Make certain build ARGs available at runtime via ENV
ENV RAILWAY_ENVIRONMENT_NAME=${RAILWAY_ENVIRONMENT_NAME}
ENV RAILWAY_SERVICE_NAME=${RAILWAY_SERVICE_NAME}
ENV RAILWAY_PROJECT_NAME=${RAILWAY_PROJECT_NAME}
ENV RAILWAY_PUBLIC_DOMAIN=${RAILWAY_PUBLIC_DOMAIN}

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

# Add healthcheck using Railway's public domain if available
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f "http://localhost:${PORT:-8000}/health" || exit 1

# Command to run the application
# Railway automatically injects PORT at runtime
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}