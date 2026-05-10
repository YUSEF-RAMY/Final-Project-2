import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import styles from './SignUp.module.css'; 

const SignUpForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isNameValid = formData.fullName.trim().split(/\s+/).length >= 4;
  const isPassMatch = formData.confirmPassword === formData.password && formData.confirmPassword !== '';

  // دالة توليد بصمة الجهاز (بديل الفايربيز)
  const getManualDeviceToken = () => {
    let deviceToken = localStorage.getItem('manual_device_token');
    if (!deviceToken) {
      deviceToken = `web-${crypto.randomUUID()}-${Date.now()}`;
      localStorage.setItem('manual_device_token', deviceToken);
    }
    return deviceToken;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid || !isEmailValid || !isPassMatch) {
        Swal.fire({
            icon: "error",
            title: "Check Inputs",
            text: "Please make sure your name is 4 words and passwords match.",
        });
        return;
    }

    Swal.fire({ title: "Creating Account...", didOpen: () => Swal.showLoading() });

    const data = new FormData();
    data.append("name", formData.fullName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("password_confirmation", formData.confirmPassword);
    
    // التعديل المهم هنا: تغيير الاسم لـ profile_image بناءً على الصورة اللي بعتها
    if (profileImage) {
        data.append("profile_image", profileImage); 
    }

    try {
      const response = await fetch("https://katydid-champion-mutually.ngrok-free.app/api/register", {
        method: "POST",
        body: data,
        headers: { 
            "Accept": "application/json", 
            "ngrok-skip-browser-warning": "69420" 
        },
      });

      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        const userToken = result.data.token;
        localStorage.setItem("userToken", userToken);

        // --- ربط الجهاز فوراً بعد نجاح التسجيل ---
        const manualToken = getManualDeviceToken();
        const deviceFormData = new FormData();
        deviceFormData.append("fcm_token", manualToken);
        deviceFormData.append("device_type", "web");

        try {
          await fetch("https://katydid-champion-mutually.ngrok-free.app/api/devices/register", {
            method: "POST",
            body: deviceFormData,
            headers: { 
              "Authorization": `Bearer ${userToken}`,
              "Accept": "application/json",
              "ngrok-skip-browser-warning": "69420" 
            },
          });
          console.log("Device Registered Successfully");
        } catch (err) {
          console.error("Device registration skipped", err);
        }

        Swal.fire({ icon: "success", title: "Welcome!", text: result.message, timer: 2000, showConfirmButton: false })
          .then(() => navigate("/onboarding1"));
      } else {
        Swal.fire({ icon: "error", title: "Oops...", text: result.message || "Registration failed" });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Server is unreachable" });
    }
  };

  return (
    <div className={styles['right-side']}> 
      <div className={styles['login-box']}>
        <h2>Create Account</h2>
        <p className={styles.subtitle}>Begin your personalized nutrition journey today.</p>

        <form onSubmit={handleSubmit} id="signupForm">
          <div className={styles['profile-section']}>
            <div className={styles['profile-preview']} onClick={() => fileInputRef.current?.click()}>
              {!imagePreview ? <i className="fa-solid fa-camera-retro"></i> : <img src={imagePreview} alt="Preview" />}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'bold' }}>PROFILE PHOTO</p>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
          </div>

          <div className={styles['form-group']}>
            <label>Full Name</label>
            <div className={styles['input-wrapper']}>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                className={formData.fullName ? (isNameValid ? styles.valid : styles.invalid) : ''}
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>Email Address</label>
            <div className={styles['input-wrapper']}>
              <input 
                type="email" 
                placeholder="example@mail.com"
                className={formData.email ? (isEmailValid ? styles.valid : styles.invalid) : ''}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <i className="fa-regular fa-envelope"></i>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>Password</label>
            <div className={styles['input-wrapper']}>
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <i className={`fa-regular ${showPass ? 'fa-eye' : 'fa-eye-slash'}`} onClick={() => setShowPass(!showPass)} style={{cursor:'pointer'}}></i>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>Confirm Password</label>
            <div className={styles['input-wrapper']}>
              <input 
                type={showConfirm ? "text" : "password"} 
                placeholder="Confirm your password"
                className={formData.confirmPassword ? (isPassMatch ? styles.valid : styles.invalid) : ''}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
              <i className={`fa-regular ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`} onClick={() => setShowConfirm(!showConfirm)} style={{cursor:'pointer'}}></i>
            </div>
          </div>

          <button type="submit" className={styles['btn-signin']}>Create Account</button>
        </form>
        <p className={styles['signup-text']}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
};

export default SignUpForm;