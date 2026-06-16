import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './Login.module.css';
import {
  loginWithEmail,
  saveToken,
  registerDevice,
  initiateGoogleLogin,
} from '../../services/authService';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  // ─── Email / Password login ──────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email) || password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'خطأ في البيانات',
        text: 'يرجى التأكد من كتابة الإيميل والباسورد بشكل صحيح قبل الإرسال.',
        confirmButtonColor: '#1a7a44',
      });
      return;
    }

    Swal.fire({ title: 'Logging in....', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const result = await loginWithEmail(email, password);
      const token = result.data.token;

      saveToken(token);
      await registerDevice(token);

      Swal.fire({
        icon: 'success',
        title: 'Successfully completed',
        text: result.message,
        timer: 2000,
        showConfirmButton: false,
      }).then(() => navigate('/dashboard'));
    } catch (error) {
      console.error('Login Error:', error);
      const message = error instanceof Error ? error.message : 'An error occurred while connecting to the server.';
      Swal.fire({
        icon: 'error',
        title: 'Login failed...',
        text: message,
        confirmButtonColor: '#e74c3c',
      });
    }
  };

  // ─── Google OAuth ────────────────────────────────────────────────────────

  const handleGoogleLogin = async () => {
    Swal.fire({ title: 'Redirecting to Google...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      await initiateGoogleLogin();
      // Swall will be closed by navigation to the Google page
    } catch (error) {
      console.error('Google Login Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Google Login failed',
        text: 'Could not connect to Google login. Please try again.',
        confirmButtonColor: '#e74c3c',
      });
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

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
              className={`${email ? (validateEmail(email) ? styles.valid : styles.invalid) : ''}`}
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
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${password ? (password.length >= 6 ? styles.valid : styles.invalid) : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className={`fa-regular ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
              style={{ cursor: 'pointer' }}
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
        <button type="button" className={styles['social-btn']} onClick={handleGoogleLogin}>
          <i className="fa-brands fa-google" style={{ color: '#db4437' }}></i> Google
        </button>
      </div>

      <p className={styles['signup-text']}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginForm;