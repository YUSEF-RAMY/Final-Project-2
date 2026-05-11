import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';
import styles from './OnboardingSteps.module.css';

interface FormDataValues {
  age: string;
  gender: string;
  height: string;
  weight: string;
}

interface Step1MetricProps {
  mode: string;
  setMode: (mode: 'manual' | 'upload' | 'camera') => void;
  imageReady: boolean;

  previewImage: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  formData: FormDataValues;
  setFormData: React.Dispatch<React.SetStateAction<FormDataValues>>;
}

const Step1Metric: React.FC<Step1MetricProps> = ({
  mode,
  setMode,
  imageReady,
  previewImage,
  formData,
  setFormData
}) => {
  const webcamRef = useRef<Webcam>(null);


  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      previewImage(imageSrc);
      setMode('upload');
    }
  }, [webcamRef, previewImage, setMode]);


  const handleCameraError = useCallback(() => {
    Swal.fire({
      icon: 'error',
      title: 'Camera Access Denied',
      text: 'Please enable camera permissions or use a secure HTTPS connection.',
      confirmButtonColor: '#2ecc71'
    });
    setMode('upload');
  }, [setMode]);

  return (
    <div className={styles['step-card']}>
      <h3 style={{ margin: 0 }}>Metric Input</h3>
      <div className={styles['card-body']}>

        {/* Toggle Buttons */}
        <div className={styles['toggle-box']}>
          <button
            type="button"
            className={`${styles['toggle-btn']} ${mode === 'manual' ? styles.active : ''}`}
            onClick={() => setMode('manual')}
          >Manual</button>
          <button
            type="button"
            className={`${styles['toggle-btn']} ${mode === 'upload' ? styles.active : ''}`}
            onClick={() => setMode('upload')}
          >InBody</button>
          <button
            type="button"
            className={`${styles['toggle-btn']} ${mode === 'camera' ? styles.active : ''}`}
            onClick={() => setMode('camera')}
          >Camera</button>
        </div>


        {mode === 'manual' && (
          <div className={styles['input-grid']}>
            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
            <input
              type="number"
              placeholder="Height (cm)"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
        )}


        {mode === 'upload' && (
          <div
            className={styles['upload-box']}
            onClick={() => document.getElementById('file-in')?.click()}
            style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
            <input type="file" id="file-in" hidden accept="image/*" onChange={previewImage} />

            {imageReady ? (
              <div style={{ textAlign: 'center', color: '#2ecc71' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '3.5rem' }}></i>
                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Report Captured Successfully!</p>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Tap to replace file</span>
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.5rem', color: '#2ecc71' }}></i>
                <p>Upload InBody Image</p>
              </>
            )}
          </div>
        )}


        {mode === 'camera' && (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '500px',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#000',
            marginTop: '10px'
          }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              onUserMediaError={handleCameraError}
              videoConstraints={{
                facingMode: "environment",
                aspectRatio: 0.7
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />


            <div style={{
              position: 'absolute', top: '5%', left: '15%', width: '70%', height: '85%',
              border: '3px solid red', borderRadius: '12px', pointerEvents: 'none',
              boxShadow: '0 0 0 5000px rgba(0,0,0,0.4)', zIndex: 2
            }}>
              <span style={{
                position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
                color: 'red', background: 'white', padding: '2px 8px', fontSize: '10px',
                fontWeight: 'bold', borderRadius: '4px'
              }}>
                ALIGN INBODY PAPER HERE
              </span>
            </div>

            <button
              type="button"
              onClick={capture}
              style={{
                position: 'absolute', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
                background: '#2ecc71', color: 'white', border: 'none', padding: '12px 30px',
                borderRadius: '50px', fontWeight: 'bold', zIndex: 10, cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              <i className="fa-solid fa-camera" style={{ marginRight: '8px' }}></i> Capture
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1Metric;