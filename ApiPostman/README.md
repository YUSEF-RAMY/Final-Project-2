# 🚀 Postman API Documentation & Automated Workflows

This folder contains the official **Postman Collection** and **Environment** for the **Healthify**. It is designed to provide a seamless testing experience for Frontend and Mobile developers.

---

## 📂 Contents
* `collection.json`: Full API suite including Auth, OTP flows, and User Management.
* `environment.json`: Dynamic variable storage for `{{url}}`, `{{token}}`, `{{reset_email}}`, `{{temp_reset_token}}` , `{{reset_email}}`.

## ⚙️ Setup & Installation
1. **Import:** Drag and drop both JSON files into your Postman app.
2. **Environment:** Select `Final_Project_2` from the environment selector (top-right corner).
3. **Base URL:** Ensure the `{{url}}` variable matches your current Ngrok or local server address.

---

## ⚡ Automated Features (Smart Scripts)
We have implemented **Post-response Scripts** to automate the workflow and eliminate manual copy-pasting:

* **Authentication:** `Login` and `Register` automatically update the `{{token}}` variable for future requests.
* **Forgot Password:** Automatically captures the email from the request body and stores it in `{{reset_email}}`.
* **OTP Verification:** Captures the secure temporary token from the response and saves it as `{{temp_reset_token}}` to be used automatically in the reset password step.
* **Logout:** Clears all active session tokens from the environment for security.

---

## 🛠 API Endpoints & Expected Responses

### 1. Login
* **Method:** `POST` | **Endpoint:** `{{url}}/login`
* **Body (form-data):** `email`, `password`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Logged in successfully",
    "data": {
        "user": {
            "name": "test",
            "email": "test@gmail.com",
            "created_at": "2026-04-06 00:53:33"
        },
        "token": "1|ybHGBzhZ...",
        "token_type": "Bearer"
    }
}
```

### 2. Register
* **Method:** `POST` | **Endpoint:** `{{url}}/register`
* **Body (form-data):** `name`, `email`, `password`, `password_confirmation`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 201,
    "message": "User registered successfully",
    "data": {
        "user": {
            "name": "test",
            "email": "test@gmail.com",
            "created_at": "2026-04-06 01:17:49"
        },
        "token": "1|ybHGBzhZ...",
        "token_type": "Bearer"
    }
}
```

### 3. Logout
* **Method:** `POST` | **Endpoint:** `{{url}}/Logout`
* **Body (form-data):** `null`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Logged out successfully"
}
```

### 4. Change Password
* **Method:** `POST` | **Endpoint:** `{{url}}/change-password`
* **Body (form-data):** `current_password`, `password`, `password_confirmation`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Password updated successfully"
}
```

### 5. Forgot Password (OTP)
* **Method:** `POST` | **Endpoint:** `{{url}}/forgot-password`
* **Body (form-data):** `email`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "OTP code sent to your email"
}
```

### 6. Verify Otp
* **Method:** `POST` | **Endpoint:** `{{url}}/verify-otp`
* **Body (form-data):** `email` , `code`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "OTP verified successfully. You can now reset your password.",
    "token": "1cf9ba05706489075d23e164e605395ae0d60ebf8acfca638dd9d196fe0f3616"
}
```

### 6. Reset Password
* **Method:** `POST` | **Endpoint:** `{{url}}/reset-password`
* **Body (form-data):** `email`, `token`, `password`, `password_confirmation`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Password has been reset successfully. You can now login with your new password."
}
```

---

## 🧪 Testing Guidelines & Notes

* **Content-Type:** All requests MUST include the header `Accept: application/json`.
* **Authentication:** * Requests that require authentication use the `Bearer Token` stored in `{{token}}`.
    * The `Reset Password` flow uses a unique temporary token received from the `Verify OTP` step, stored in `{{temp_reset_token}}`.
* **Rate Limiting:** Please avoid spamming the `Forgot Password` endpoint to prevent temporary email blocking.
* **Main:** During development, all OTP emails are intercepted by Gmail. Check the Mail for your 6-digit code.
* **Error Handling:** If you receive a `422 Unprocessable Entity`, check the `errors` object in the response for validation details.

---
*Maintained by **Yusef Ramy** - Backend & DevOps*
*Last Updated: April 2026*


