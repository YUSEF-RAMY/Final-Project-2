import { useState, useEffect } from 'react';
import styles from '../components/ForgetPassword/ForgotPassword.module.css'; // تأكدي من المسار الصحيح هنا
import Step1 from '../components/ForgetPassword/Step1';
import Step2 from '../components/ForgetPassword/Step2';
import Step3 from '../components/ForgetPassword/Step3';
import Swal from 'sweetalert2';

const ForgotPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ p1: '', p2: '' });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState('05:00');

  const API_URL = import.meta.env.API_BASE_URL;

  // الهيدرز المشتركة لحل مشاكل الـ CORS و ngrok
  const commonHeaders = {
    "ngrok-skip-browser-warning": "69420",
    "Accept": "application/json",
  };

  useEffect(() => {
    let countdown: number | undefined; 
    
    if (currentStep === 2) {
      let totalSeconds = 300;
      countdown = window.setInterval(() => {
        if (totalSeconds <= 0) {
          window.clearInterval(countdown);
          return;
        }
        totalSeconds--;
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        setTimer(`${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`);
      }, 1000);
    }
    
    return () => {
      if (countdown) window.clearInterval(countdown);
    };
  }, [currentStep]);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        if (!/\S+@\S+\.\S+/.test(email)) {
          setLoading(false);
          return Swal.fire("Error", "Please enter a valid email", "error");
        }
        const fd = new FormData();
        fd.append("email", email);
        
        // التعديل هنا بإضافة Headers
        const res = await fetch(`${API_URL}/forgot-password`, { 
            method: "POST", 
            body: fd,
            headers: commonHeaders 
        });

        if (res.ok) {
            setCurrentStep(2);
        } else {
          const data = await res.json();
          Swal.fire("Error", data.message || "Failed to send code", "error");
        }
      } 
      else if (currentStep === 2) {
        const code = otp.join('');
        if (code.length !== 6) {
          setLoading(false);
          return Swal.fire("Error", "Enter 6-digit code", "error");
        }
        const fd = new FormData();
        fd.append("email", email);
        fd.append("code", code);

        // التعديل هنا بإضافة Headers
        const res = await fetch(`${API_URL}/verify-otp`, { 
            method: "POST", 
            body: fd,
            headers: commonHeaders
        });

        const data = await res.json();
        if (res.ok) {
          sessionStorage.setItem("RESET_TOKEN", data.token);
          setCurrentStep(3);
        } else {
          Swal.fire("Error", data.message || "Invalid code", "error");
        }
      }
      else if (currentStep === 3) {
        if (passwords.p1.length < 8 || passwords.p1 !== passwords.p2) {
          setLoading(false);
          return Swal.fire("Error", "Passwords must match and be 8+ characters", "error");
        }
        const fd = new FormData();
        fd.append("email", email);
        fd.append("token", sessionStorage.getItem("RESET_TOKEN") || "");
        fd.append("password", passwords.p1);
        fd.append("password_confirmation", passwords.p2);

        // التعديل هنا بإضافة Headers
        const res = await fetch(`${API_URL}/reset-password`, { 
            method: "POST", 
            body: fd,
            headers: commonHeaders
        });

        if (res.ok) {
          sessionStorage.removeItem("RESET_TOKEN");
          await Swal.fire("Success", "Password updated successfully!", "success");
          window.location.href = "/login";
        } else {
            const data = await res.json();
            Swal.fire("Error", data.message || "Update failed", "error");
        }
      }
    } catch (err) {
      console.error("Forgot Password Error:", err); 
      Swal.fire("Error", "Connection error. Check your server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.leftSide}>
        <div className={styles.leftLogo}>
          <i className="fa-solid fa-leaf"></i> Healthyfy
        </div>
        <div className={styles.heroText}>
          <h1>Restore your<br />connection.</h1>
          <p style={{ opacity: 0.8, maxWidth: '400px', marginTop: '10px' }}>
             Securely regain access to your personalized AI nutrition insights.
          </p>
        </div>
      </div>

      <div className={styles.rightSide}> 
        <div className={styles.recoveryContainer}>
          <div className={styles.headerStatic}>
            <h2>Account Recovery</h2>
            <p>Follow the steps below to reset your password.</p>
          </div>

          <div className={styles.stepsStack}>
            <Step1 
              email={email} 
              setEmail={setEmail} 
              status={currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'waiting'} 
              onEdit={() => setCurrentStep(1)} 
            />
            <Step2 
              otp={otp} 
              setOtp={setOtp} 
              timer={timer} 
              status={currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'waiting'} 
            />
            <Step3 
              passwords={passwords} 
              setPasswords={setPasswords} 
              status={currentStep === 3 ? 'active' : 'waiting'} 
            />
          </div>

          <div className={styles.footerAction}>
            <button className={styles.btnBottom} onClick={handleAction} disabled={loading}>
              <span>
                {loading ? 'Processing...' : 
                 currentStep === 1 ? 'Send Code' : 
                 currentStep === 2 ? 'Verify Code' : 
                 'Update Password'}
              </span>
              {!loading && <i className="fa-solid fa-arrow-right"></i>}
            </button>
            <p className={styles.returnLogin} onClick={() => window.location.href = '/login'}>
              <i className="fa-solid fa-arrow-left"></i> Return to Login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;