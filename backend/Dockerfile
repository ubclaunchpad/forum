# Build stage
FROM python:3.11-slim-bookworm AS builder

# Copy UV binary from official image (pinned version)
COPY --from=ghcr.io/astral-sh/uv:0.5.7 /uv /uvx /bin/

# Set workdir
WORKDIR /app

# Copy project files
COPY pyproject.toml uv.lock ./

# Copy the rest of the application
COPY . .

# Create venv and install dependencies
RUN uv sync --frozen

# Production stage
FROM python:3.11-slim-bookworm

# Copy UV from official image (pinned version)
COPY --from=ghcr.io/astral-sh/uv:0.5.7 /uv /uvx /bin/

# Create a non-root user
RUN useradd -m -u 1000 app

# Set workdir
WORKDIR /app

# Copy virtual environment and application files from builder
COPY --from=builder --chown=app:app /app/.venv /app/.venv
COPY --from=builder --chown=app:app /app /app

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Switch to non-root user
USER app

# Command to run the application
CMD ["uv", "run", "-m", "main"]