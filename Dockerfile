# Use official Python runtime as a parent image
FROM python:3.10-slim

# Create a non-root user (Hugging Face Spaces requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory to backend
WORKDIR /app/backend

# Install dependencies first (for layer caching)
COPY --chown=user backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory into the container
COPY --chown=user backend/ .

# IMPORTANT: Configure our app to use the Persistent Storage volume mapped to /data
ENV CHROMA_DB_DIR="/data/chroma_db"
ENV REPO_STORAGE_DIR="/data/repos"

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Start FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
