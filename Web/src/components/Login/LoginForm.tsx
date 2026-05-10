import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './Login.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // 1.validation functions
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getManualDeviceToken = () => {
    let deviceToken = localStorage.getItem('manual_device_token');
    if (!deviceToken) {
      // generate a unique token 
      deviceToken = `web-${crypto.randomUUID()}-${Date.now()}`;
      localStorage.setItem('manual_device_token', deviceToken);
    }
    return deviceToken;
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email) || password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "خطأ في البيانات",
        text: "يرجى التأكد من كتابة الإيميل والباسورد بشكل صحيح قبل الإرسال.",
        confirmButtonColor: "#1a7a44",
      });
      return;
    }

    Swal.fire({
      title: "Logging in....",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // --- Stage 1: Login ---
      const loginFormData = new FormData();
      loginFormData.append("email", email);
      loginFormData.append("password", password);

      const loginResponse = await fetch(
        `${import.meta.env.API_BASE_URL}/login`,
        {
          method: "POST",
          body: loginFormData,
          headers: { 
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "69420" 
          },
        }
      );

      const loginResult = await loginResponse.json();

      if (loginResponse.ok && loginResult.status === "success") {
        const userToken = loginResult.data.token;
        localStorage.setItem("userToken", userToken);

        // --- Stage 2: Manually Register Device ---
        const manualToken = getManualDeviceToken();
        
        const deviceFormData = new FormData();
        deviceFormData.append("fcm_token", manualToken); // token manuell send 
        deviceFormData.append("device_type", "web");

        try {
          await fetch(
            `${import.meta.env.API_BASE_URL}/devices/register`,
            {
              method: "POST",
              body: deviceFormData,
              headers: { 
                "Authorization": `Bearer ${userToken}`,
                "Accept": "application/json",
                "ngrok-skip-browser-warning": "69420" 
              },
            }
          );
          console.log("Device registered manually:", manualToken);
        } catch (deviceError) {
          console.error("Manual device registration failed:", deviceError);
        }

        // success message and redirect
        Swal.fire({
          icon: "success",
          title: "Successfully completed",
          text: loginResult.message,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/dashboard"); 
        });

      } else {
        Swal.fire({
          icon: "error",
          title: "Login failed...",
          text: loginResult.message || "Incorrect email or password",
          confirmButtonColor: "#e74c3c",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      Swal.fire({
        icon: "error",
        title: "Sorry",
        text: "An error occurred while connecting to the server.",
        confirmButtonColor: "#e74c3c",
      });
    }
  };

  return (
    <div className={styles['login-box']}>
      <h2>Welcome back</h2>
      <p className={styles.subtitle}>
        Enter your details to access your curated dashboard.
      </p>

      <form id="loginForm" onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>Email Address</label>
          <div className={styles['input-wrapper']}>
            <input
              type="email"
              placeholder="name@example.com"
              className={`${email ? (validateEmail(email) ? styles.valid : styles.invalid) : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <i className="fa-regular fa-envelope"></i>
          </div>
        </div>

        <div className={styles['form-group']}>
          <label>Password</label>
          <div className={styles['input-wrapper']}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`${password ? (password.length >= 6 ? styles.valid : styles.invalid) : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
              style={{ cursor: "pointer" }}
              onClick={handleTogglePassword}
            ></i>
          </div>
          <Link to="/forget-password" style={{ float: 'right', color: '#1a7a44', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'none' }}>Forgot Password?</Link>
        </div>

        <button type="submit" className={styles['btn-signin']}>
          Sign In &nbsp; <i className="fa-solid fa-arrow-right"></i>
        </button>
      </form>

      <div className={styles.divider}>OR CONTINUE WITH</div>

      <div className={styles['social-btns']}>
        <button className={styles['social-btn']}>
          <i className="fa-brands fa-google" style={{ color: "#db4437" }}></i> Google
        </button>
        <button className={styles['social-btn']}>
          <i className="fa-brands fa-facebook" style={{ color: "#4267b2" }}></i> Facebook
        </button>
      </div>

      <p className={styles['signup-text']}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};
export default LoginForm;