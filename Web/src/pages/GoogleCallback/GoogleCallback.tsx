// ─── Google OAuth Callback ────────────────────────────────────────────────────
// This page handles the redirect back from the backend after Google OAuth.
// The backend MUST redirect here with `?token=xxx&name=xxx` on success.

import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { saveToken, registerDevice } from '../../services/authService';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasHandledRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasHandledRef.current) return;
    
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const name = searchParams.get('name') || 'مستخدم جديد';
      const error = searchParams.get('error');

      if (error) {
        hasHandledRef.current = true;
        Swal.fire({
          icon: 'error',
          title: 'فشل تسجيل الدخول',
          text: decodeURIComponent(error),
          confirmButtonColor: '#e74c3c',
        }).then(() => navigate('/login'));
        return;
      }

      if (!token) {
        hasHandledRef.current = true;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'لم يتم استلام التوكن من السيرفر. يرجى التأكد من إعدادات الباك إند.',
          confirmButtonColor: '#e74c3c',
        }).then(() => navigate('/login'));
        return;
      }

      hasHandledRef.current = true;
      // Save the token and register the device
      saveToken(token);
      await registerDevice(token);

      Swal.fire({
        icon: 'success',
        title: `مرحباً بك، ${name}!`,
        text: 'تم التسجيل الدخول باستخدام جوجل بنجاح.',
        timer: 3000,
        showConfirmButton: false,
      }).then(() => navigate('/onboarding1'));
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid #e5e7eb',
            borderTopColor: '#1a7a44',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: '#666', fontSize: '1rem' }}>جارٍ إكمال تسجيل الدخول...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default GoogleCallback;
