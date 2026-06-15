FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

# App is located at api/app.py according to the README, 
# but we will run the main app instance from app.py
# CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]
CMD ["uvicorn", "app:app", "--app-dir", "api", "--host", "0.0.0.0", "--port", "8000"]