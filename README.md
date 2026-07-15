# 🚀 Healthify - Advanced Health & Fitness Ecosystem

A production-grade, distributed health platform built with **Laravel 12**, **React 19**, **FastAPI AI Microservices**, and a robust **Docker Secrets** architecture.

---

## 📋 Core Modules

### 🛠️ Backend Architecture (Laravel 12)
-   **Distributed Tracing**: Global `trace_id` propagation across HTTP, Queue Jobs, AI Services, and Notifications.
-   **Observability System**: Structured multi-channel JSON logging (`auth`, `jobs`, `ai`, `notifications`, `errors`) with system layer metadata.
-   **AI Resilience Engine**: Eventual consistency system with persistent retry queues (`ai_retry_queues`) and user-facing status tracking.
-   **Food & Nutrition Tracking**: Comprehensive food database with macro-nutrient analysis, daily summaries, and meal-specific goal tracking.
-   **Automated InBody Pipeline**: OCR-based extraction and analysis of body composition reports via asynchronous queue workers.
-   **Notifications**: Real-time delivery via Firebase Cloud Messaging (FCM) with delivery status tracking.
-   **Secure Secrets Management**: Fully integrated with Docker Secrets for production-grade credential security.

### 🧠 AI Vision Service (Python/FastAPI)
-   **PaddleOCR Integration**: High-precision text extraction from complex InBody report layouts.
-   **YOLO Object Detection**: Intelligent detection of body composition charts and markers.
-   **Resilient API**: Fast response times with built-in tracing header support (`X-Trace-Id`).

### 📊 Modern Frontend (React 19)
-   **Real-time Dashboard**: Dynamic health insights and progress visualization.
-   **Interactive Nutrition**: Meal logging with instant macro-nutrient feedback.
-   **InBody Visualization**: Graphical representation of body composition history.
-   **Professional Chat**: Real-time communication bridge between users and health pros.

---

## 📦 Infrastructure & Docker

The system is architected for high availability and security using Docker Compose.

### 🛡️ Production Security (Docker Secrets)
Sensitive credentials are never stored in `.env` files. The system reads directly from `/run/secrets/`:
- `db_password`: Secure MySQL credentials.
- `mail_password`: SMTP authentication.
- `firebase_credentials`: Encrypted service account JSON.

### 🌐 Service Mesh
-   **`backend-api`**: PHP 8.4-FPM + Nginx (Laravel Core).
-   **`ai-service`**: FastAPI Microservice for vision tasks.
-   **`mysql`**: Persistent data storage with automated health checks.
-   **`redis`**: High-performance caching and job orchestration.
-   **`frontend`**: React 19 SPA served via Nginx.

---

## 🛠️ Observability & Monitoring

Track a single request across the entire stack using the `trace_id`:

```bash
# Follow the lifecycle of an InBody analysis
tail -f storage/logs/ai.log | grep "trace_id_uuid"
tail -f storage/logs/jobs.log | grep "trace_id_uuid"
```

### Log Channels:
- `auth.log`: Security & lifecycle events.
- `jobs.log`: Queue performance and lifecycle metrics.
- `ai.log`: AI request/response observability.
- `notifications.log`: FCM delivery status tracking.
- `errors.log`: Consolidated exception tracking.

---

## 🚀 Getting Started

1. **Setup Secrets**: Create a `./secrets` directory and add required credential files.
2. **Environment**: Copy `.env.example` to `.env` (non-sensitive vars only).
3. **Build & Launch**:
   ```bash
   docker compose up -d --build
   ```
---
**https://y1xw85mrkrx0-d.space-z.ai/**
*Built for performance, scalability, and developer happiness.*
