import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import type { SweetAlertIcon } from 'sweetalert2';
import Step1Metric from '../components/OnboardingSteps/Step1Metric';
import Step2Activity from '../components/OnboardingSteps/Step2Activity';
import Step3Goal from '../components/OnboardingSteps/Step3Goal';
import Step4Final from '../components/OnboardingSteps/Step4Final';
import styles from '../components/OnboardingSteps/OnboardingSteps.module.css';

// Removed CustomWindow and declare global for window since we use Context now


interface FormDataValues {
  age: string;
  gender: string;
  height: string;
  weight: string;
}

import { useNotification } from '../context/NotificationContext';

type OnboardingMode = 'manual' | 'upload' | 'camera';

const OnboardingSteps: React.FC = () => {
  const navigate = useNavigate();
  const { uploadAnalysis } = useNotification();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mode, setMode] = useState<OnboardingMode>('manual');
  const [imageReady, setImageReady] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>(localStorage.getItem('user_selected_goal') || '');
  const [activity, setActivity] = useState<string>('');
  const [medical, setMedical] = useState<string>('');
  const [formData, setFormData] = useState<FormDataValues>({ age: '', gender: '', height: '', weight: '' });

  const API_URL = import.meta.env.API_BASE_URL;

  // Converts Base64 string from camera capture to a File object
  const base64ToFile = (base64String: string, fileName: string): File => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  const handlePreviewImage = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    if (typeof e === 'string') {
      const file = base64ToFile(e, "camera_capture.jpg");
      setSelectedFile(file);
      setImageReady(true);
    } else {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setImageReady(true);
      }
    }
  };

  const selectGoal = (goal: string) => {
    setSelectedGoal(goal);
    localStorage.setItem("user_selected_goal", goal);
  };

  const showAlert = (title: string, text: string, icon: SweetAlertIcon) => {
    Swal.fire(title, text, icon);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if ((mode === 'upload' || mode === 'camera') && !imageReady) {
        return showAlert("Required", "Please provide an InBody image", "error");
      }
      if (mode === 'manual' && (!formData.age || !formData.gender || !formData.height || !formData.weight)) {
        return showAlert("Missing Data", "Fill all fields", "error");
      }
    }
    if (currentStep === 3 && !selectedGoal) {
      return showAlert("Warning", "Select your objective", "warning");
    }

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitData();
    }
  };
  const submitData = async () => {
    const token = localStorage.getItem("userToken");
    const isImageMode = mode === 'upload' || mode === 'camera';
    const endpoint = isImageMode ? `${API_URL}/inbody/analyze` : `${API_URL}/inbody/manual`;

    const data = new FormData();
    if (isImageMode && selectedFile) {
      data.append("image", selectedFile);
    } else {
      data.append("age", formData.age);
      data.append("height", formData.height);
      data.append("weight", formData.weight);
      data.append("gender", formData.gender === 'm' ? 'male' : 'female');
    }
    data.append("activity_level", activity);
    data.append("primary_objective", selectedGoal);
    data.append("medical_conditions", medical || "None");

    if (isImageMode) {
      // Start background upload and immediately navigate to dashboard
      if (token) {
        uploadAnalysis(data, endpoint, token, true);
        navigate("/dashboard");
      } else {
        showAlert("Error", "Authentication token missing.", "error");
      }
    } else {
      // Manual mode: block with loading, wait for response
      Swal.fire({
        title: "Uploading Data...",
        didOpen: () => Swal.showLoading()
      });

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "true"
          },
          body: data
        });

        if (response.ok) {
          localStorage.removeItem("analysis_notified");
          Swal.fire({
            icon: "success",
            title: "Submission Successful",
            text: "Redirecting to your results...",
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            navigate("/analysis-inbody");
          });
        } else {
          const err = await response.json();
          showAlert("Server Error", err.message || "Endpoint not found (404)", "error");
        }
      } catch (error) {
        console.error("Submission error:", error);
        showAlert("Connection Error", "Check if the API server (ngrok) is online.", "error");
      }
    }
  };

  return (
    <div className={styles['onboarding-page-wrapper']} style={{ display: 'flex', height: '100vh' }}>
      <div className={styles['left-side']}>
        <div className={styles['step-badge']}>
          STEP <span>{currentStep}</span> OF 4
        </div>
        <h1 className={styles['hero-title']}>Calibrate your<br />biology.</h1>
        <span className={styles['hero-description']}>
          To build a truly personalized AI nutrition engine, we
          need accurate baseline metrics. Every data point
          helps sculpt a plan designed exclusively for your
          metabolic profile.
        </span>
        <img
          src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=500"
          className={styles['main-img']}
          alt="Hero"
        />
      </div>

      <div className={styles['right-side']}>
        <div className={styles['fixed-header']}>
          <h2>Health Profile</h2>
        </div>

        <div className={styles['scrollable-content']}>
          <div className={styles['stack-wrapper']}>

            <div className={`${styles['step-item']} ${currentStep === 1 ? styles.active : (currentStep > 1 ? styles.completed : styles.waiting)}`}>
              <div className={styles['status-marker']}>1</div>
              <Step1Metric
                mode={mode}
                setMode={setMode}
                imageReady={imageReady}
                previewImage={handlePreviewImage}
                formData={formData}
                setFormData={setFormData}
              />
            </div>

            <div className={`${styles['step-item']} ${currentStep === 2 ? styles.active : (currentStep > 2 ? styles.completed : styles.waiting)}`}>
              <div className={styles['status-marker']}>2</div>
              <Step2Activity activity={activity} setActivity={setActivity} />
            </div>

            <div className={`${styles['step-item']} ${currentStep === 3 ? styles.active : (currentStep > 3 ? styles.completed : styles.waiting)}`}>
              <div className={styles['status-marker']}>3</div>
              <Step3Goal selectGoal={selectGoal} selectedGoal={selectedGoal} />
            </div>

            <div className={`${styles['step-item']} ${currentStep === 4 ? styles.active : styles.waiting}`}>
              <div className={styles['status-marker']}>4</div>
              <Step4Final medical={medical} setMedical={setMedical} />
            </div>

          </div>
        </div>

        <div className={styles['fixed-footer']}>
          <button className={styles['main-btn']} onClick={handleNext}>
            <span>{currentStep === 4 ? "Submit Analysis" : "Continue"}</span>
            <i className="fa-solid fa-arrow-right" style={{ marginLeft: '10px' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;