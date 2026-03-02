# ContractScan AI — Dockerfile (ai-service)
# Used for Render.com deployment.

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for pdfminer
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render uses PORT env variable; fall back to 8001 locally
EXPOSE 8001

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8001}"]
