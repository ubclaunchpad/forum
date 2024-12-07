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

# Copy the entire application first (we need pyproject.toml and the source code)
COPY . .

# Install all dependencies including the project itself
RUN uv venv /app/.venv && \
    . /app/.venv/bin/activate && \
    uv pip install --force-reinstall uvicorn && \
    uv pip install -e . && \
    uv sync

# Production stage
FROM python:3.11-slim-bookworm

# Copy UV binary from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

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
ENV PYTHONUNBUFFERED=1

# Create a non-root user and set up directory
RUN useradd -m -u 1000 app && \
    mkdir -p /app && \
    chown -R app:app /app && \
    chmod -R 755 /bin/uv

# Set working directory
WORKDIR /app

# Copy virtual environment and application files from builder
COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --from=builder --chown=app:app /app /app

# Set up permissions
RUN chmod -R 755 /app/.venv && \
    chmod -R 755 /app

# Set environment variables including PATH
ENV PATH="/app/.venv/bin:/bin:$PATH"
ENV PYTHONPATH="/app:${PYTHONPATH}"
ENV VIRTUAL_ENV="/app/.venv"

# Switch to non-root user
USER app

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f "http://localhost:${PORT:-8000}/health" || exit 1

# Command to run the application
CMD ["/bin/uv", "run", "-m", "main"]