# slim Python + ffmpeg (needed by some HLS/DASH cases)
FROM python:3.11-slim

# Install OS deps for ffmpeg and certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 8000
ENV PYTHONUNBUFFERED=1
CMD ["./start.sh"]
