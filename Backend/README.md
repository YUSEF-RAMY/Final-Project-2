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

docker compose up -d --build

# 1. Install dependencies
docker exec healthify-backend-api composer install

# 2. Generate App Key
docker exec healthify-backend-api php artisan key:generate

# 3. Create Database Tables
docker exec healthify-backend-api php artisan migrate:fresh --seed

# 4. Create Storage Link
docker exec healthify-backend-api php artisan storage:link

```

---


## 📡 API Endpoints
The base URL for all API endpoints is:
`http://localhost:8000/api`

---

## 🐳 Docker Containers Info

| Container Name | Port | Task |
| :--- | :--- | :--- |
| `healthify-backend-api` | 9000 | Runs PHP & Laravel Code |
| `healthify-db` | 3306 | MySQL Database |

---

## 🛠 Useful Commands

* **Stop Project:** `docker compose stop`
* **Start Project:** `docker compose start`
* **Show Real-time Logs:** `docker logs -f healthify-backend-api`
* **Access Terminal inside Docker:** `docker exec -it healthify-backend-api bash`
* **Clear Laravel Cache:** `docker exec healthify-backend-api php artisan optimize:clear`

---

## 🔒 Permission Fix
If you see any "Permission Denied" errors in your logs or Postman, run this command to fix folder ownership:

```bash
docker exec healthify-backend-api chown -R www-data:www-data storage bootstrap/cache
docker exec healthify-backend-api chmod -R 775 storage bootstrap/cache
```

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