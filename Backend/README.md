# 🍏 Healthify Backend API

This is the Backend API for the **Healthify** system. It is built with **Laravel 11** and runs completely on **Docker**.

---

## 🛠 Tech Stack

* **Language:** PHP 8.4
* **Framework:** Laravel 11
* **Database:** MySQL 8.0
* **Web Server:** Nginx
* **Containers:** Docker & Docker Compose

---

## 🚀 How to Run the Project

Follow these steps to start the project on your local machine:

### 1. Prepare the Environment
Create your environment file from the example:
```bash
cp .env.example .env
```

### 2. Start the Application
Build and start the Docker containers. The setup is fully automated! 
Dependencies will be installed, the app key will be generated, migrations will run, and permissions will be fixed—all automatically.

```bash
docker compose up -d --build
```

That's it! The application will be available at `http://localhost:8000/api` once the startup is complete.

---

## 📡 API Endpoints
The base URL for all API endpoints is:
`http://localhost:8000/api`

---

## 🐳 Docker Containers Info

| Container Name | Port | Task |
| :--- | :--- | :--- |
| `healthify-nginx` | 8000 | Web server handling HTTP requests |
| `healthify-backend-api` | 9000 | Runs PHP & Laravel Code (FastCGI) |
| `healthify-db` | 3306 | MySQL Database |

---

## 🛠 Useful Commands

* **Stop Project:** `docker compose down`
* **Stop Project & Clear Data (Reset Database):** `docker compose down -v`
* **Start Project:** `docker compose up -d`
* **Show Real-time Logs:** `docker compose logs -f`
* **Access Terminal inside Docker:** `docker exec -it healthify-backend-api bash`
* **Clear Laravel Cache:** `docker exec healthify-backend-api php artisan optimize:clear`
* **Run Tinker:** `docker exec -it healthify-backend-api php artisan tinker`

---

## 🌟 Key Features

* **Advanced Auth:** Secure login and registration using Laravel Sanctum.
* **InBody AI Analysis:** Smart analysis for body composition data.
* **Nutrition Tracking:** Manage and track daily meals and health goals.
* **Automated Reports:** Generate health reports based on user progress.

---

## 📂 Project Structure (Quick Look)

* `app/Models` - Database Structure.
* `app/Http/Controllers` - API Logic.
* `app/Services` - AI & Business Logic.
* `routes/api.php` - All API Endpoints.

---

## 🤝 Contributing
This project is developed and maintained by the **Healthify Team**. 
For support or bug reports, please open a GitHub Issue.

---

<p align="center">
  <b>Healthify: Your Journey to Better Health Starts Here 🍏</b><br>
  <i>Built with Passion & Clean Code.</i>
</p>