# Multi-service Dockerfile for Streamlit UI + FastAPI backend
FROM python:3.10-slim

WORKDIR /app

# Install supervisord to manage multiple processes
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy only dependency list first for better cache behavior
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY . .

# Create supervisor config
RUN echo "[supervisord]\nnodaemon=true\n\n\
[program:streamlit]\ncommand=streamlit run public/app.py --server.port 8501 --server.address 0.0.0.0\n\n\
[program:fastapi]\ncommand=uvicorn api:app --host 0.0.0.0 --port 8000" > /etc/supervisor/conf.d/supervisord.conf

# Download model at startup if URL provided
ENV STREAMLIT_PORT=8501
ENV API_PORT=8000
EXPOSE 8501 8000

# Start both services via supervisord
CMD ["bash", "-c", "python scripts/download_model.py || true && supervisord -c /etc/supervisor/conf.d/supervisord.conf"]
