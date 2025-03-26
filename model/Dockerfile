# Use a base image with Deno installed
FROM denoland/deno:alpine-2.1.3

# Set the working directory
WORKDIR /app

# Copy your files to the working directory
COPY . .

# Pre-fetch dependencies based on the main entrypoint
RUN deno install

ARG PORT=8000
EXPOSE $PORT

CMD ["task", "start"]