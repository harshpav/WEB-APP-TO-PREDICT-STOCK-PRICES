# Minimal Dockerfile for the Streamlit + Keras CPU app
FROM python:3.10-slim

WORKDIR /app

# Copy only dependency list first for better cache behavior
COPY requirements.txt ./

# Install build dependencies then Python deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY . .

ENV PORT=8080
EXPOSE 8080

# Optional: model download is attempted at container start if MODEL_URL env var is set
CMD ["bash", "-lc", "python scripts/download_model.py || true && streamlit run public/app.py --server.port $PORT --server.address 0.0.0.0"]
