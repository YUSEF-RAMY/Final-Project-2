# 🚀 Postman API Documentation & Automated Workflows

This folder contains the official **Postman Collection** and **Environment** for the **Healthify**. It is designed to provide a seamless testing experience for Frontend and Mobile developers.

---

## 📂 Contents
* `collection.json`: Full API suite including Auth, OTP flows, and User Management.
* `environment.json`: Dynamic variable storage for `{{url}}`, `{{token}}`, `{{reset_email}}`, `{{temp_reset_token}}` , `{{reset_email}}`.

## ⚙️ Setup & Installation
1. **Import:** Drag and drop both JSON files into your Postman app.
2. **Environment:** Select `Healthyfy` from the environment selector (top-right corner).
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
* **Body (form-data):** `email`(email), `password`(string)
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
* **Body (form-data):** `name`(string), `email`(email), `password`(string), `password_confirmation`(string)
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
* **Body (form-data):** `Only Brearer Token`
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
* **Body (form-data):** `current_password`(string), `password`(string), `password_confirmation`(string)
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
* **Body (form-data):** `email`(email)
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
* **Body (form-data):** `email`(email) , `code`(integer)
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
* **Method:** `POST` | **Endpoint:** `{{url}}/reset-password`,
* **Body (form-data):** `email`(email), `token`(string), `password`(string), `password_confirmation`(string),
* **Authoriztion Type:** `Brearer Token`, `{{token}}`,
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Password has been reset successfully. You can now login with your new password."
}
```

### 7. Get Info From InBody
* **Method:** `POST` | **Endpoint:** `{{url}}/inbody/analyze`
* **Body (form-data):** `image`(file || image)
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "processing",
    "status_code": 202,
    "message": "Your data is being analyzed; we will send you a notification as soon as it is finished."
}
```

### 8. Get Info From InBody
* **Method:** `GET` | **Endpoint:** `{{url}}/inbody/latest`
* **Body (form-data):** `Only Brearer Token`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Latest report retrieved successfully.",
    "data": {
        "height": "185.00",
        "weight": "72.80",
        "age": 18,
        "gender": "male",
        "muscle_mass": "38.80",
        "body_fat_percentage (pbf)": "100.00",
        "body_fat_mass": "72.80",
        "water": "50.50",
        "protein": "13.50",
        "minerals": "4.74",
        "bmi": "21.27",
        "measured_at": "2026-01-20 21:16",
        "created_at": "54 minutes ago",
        "inbody_image": "http://katydid.../inbody_reports/RJgw4pt....jpg"
    }
}
```

### 9. Get All Notifications
* **Method:** `GET` | **Endpoint:** `{{url}}/notifications`,
* **Body (form-data):** `Only Brearer Token`,
* **Authoriztion Type:** `Brearer Token`, `{{token}}`,
* **Response:**
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Notifications retrieved successfully.",
    "meta": {
        "total_count": 1,
        "unread_count": 1
    },
    "data": [
        {
            "notification_id": "e8b...",
            "title": "InBody analysis completed! 🎉",
            "body": "Your new numbers are ready, open the app to see your calories and macros.",
            "is_read": false,
            "payload": {
                "inbody_report_id": 123...
            },
            "created_at": "7 minutes ago",
            "full_date": "2026-04-19 22:42"
        }
    ]
}
```

### 10. Mark Notification as Read
* **Method:** `POST` | **Endpoint:** `{{url}}/notifications/read`,
* **Body (form-data):** `notification_id`(string & integer),
* **Authoriztion Type:** `Brearer Token`, `{{token}}`,
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Notifications retrieved successfully.",
    "meta": {
        "total_count": 1,
        "unread_count": 0
    },
    "data": [
        {
            "notification_id": "e8b4...",
            "title": "InBody analysis completed! 🎉",
            "body": "Your new numbers are ready, open the app to see your calories and macros.",
            "is_read": true,
            "payload": {
                "inbody_report_id": 123...
            },
            "created_at": "8 minutes ago",
            "full_date": "2026-04-19 22:42"
        }
    ]
}
```

### 11. Clear All Notifications
* **Method:** `DELETE` | **Endpoint:** `{{url}}/notifications/clear-all`,
* **Body (form-data):** `Only Brearer Token`,
* **Authoriztion Type:** `Brearer Token`, `{{token}}`,
```json
{
    "status": "success",
    "status_code": 200,
    "message": "All notifications cleared.",
    "meta": {
        "total_count": 0,
        "unread_count": 0
    },
    "data": []
}
```

### 12. Update FCM Token
* **Method:** `POST` | **Endpoint:** `{{url}}/profile/fcm-token`,
* **Body (form-data):** `fcm_token`(string), `device_type`(string => ( ios || android || web ))
* **Authoriztion Type:** `Brearer Token`, `{{token}}`,
```json
{
    "status": "success",
    "status_code": 200,
    "message": "FCM Token updated successfully."
}
```

### 13. Get User Target
* **Method:** `GET` | **Endpoint:** `{{url}}/daily-target`,
* **Body (form-data):** `Only Brearer Token`
* **Authoriztion Type:** `Brearer Token`, `{{token}}`,
```json
{
    "status": "success",
    "status_code": 200,
    "message": "Daily targets retrieved successfully.",
    "data": {
        "calories": 1973.97,
        "protein": 148.05,
        "carbs": 222.07,
        "fats": 54.83,
        "updated_at": "56 minutes ago"
    }
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


