# 🚀 Postman API Documentation

This folder contains the official Postman collection and environment for the **Final Project API**.

## 📂 Contents
* `collection.json`: Contains all API endpoints (Auth, User, etc.) with pre-defined body structures.
* `environment.json`: Contains environment variables like `{{url}}` and `{{token}}`.

## 🛠️ How to Use
1. Open **Postman**.
2. Click on the **Import** button.
3. Drag and drop the `collection.json` and `environment.json` files.
4. Select the environment (Final_Project_2) from the top-right corner.
5. Make sure your server is running

## ⚡ Features Implemented
* **Auto-Token Update**: After a successful `Login` or `Register`, the `{{token}}` variable is updated automatically.
* **Auto-Token Cleanup**: After `Logout`, the `{{token}}` is automatically removed.
* **Pre-configured Headers**: All requests include `Accept: application/json`.
