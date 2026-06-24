import React, { useState, useEffect } from 'react';
import styles from './OnboardingSteps.module.css';

interface Step4FinalProps {
  medical: string[];
  setMedical: (value: string[]) => void;
  selectedGoal: string;
}

const diseasesList = [
  { id: 'healthy', label: 'Healthy' },
  { id: 'overweight', label: 'Overweight' },
  { id: 'obesity', label: 'Obesity' },
  { id: 'underweight', label: 'Underweight' },
  { id: 'diabetes_type2', label: 'Diabetes Type 2' },
  { id: 'hypertension', label: 'Hypertension' },
  { id: 'insulin_resistance', label: 'Insulin Resistance' },
  { id: 'fatty_liver', label: 'Fatty Liver' },
  { id: 'heart_disease', label: 'Heart Disease' },
  { id: 'hypothyroidism', label: 'Hypothyroidism' },
  { id: 'kidney_disease', label: 'Kidney Disease' },
  { id: 'pcos', label: 'PCOS' }
];

export const forbiddenRules: Record<string, string[]> = {
  overweight: ['build_muscle'],
  obesity: ['maintain', 'build_muscle'],
  underweight: ['lose_weight'],
  fatty_liver: ['build_muscle'],
  kidney_disease: ['build_muscle']
};

const Step4Final: React.FC<Step4FinalProps> = ({ medical, setMedical, selectedGoal }) => {
  const [warnings, setWarnings] = useState<{disease: string, goal: string}[]>([]);

  useEffect(() => {
    // Check for forbidden combinations based on selected medical conditions and selected goal
    const newWarnings: {disease: string, goal: string}[] = [];
    medical.forEach(disease => {
      const forbiddenGoals = forbiddenRules[disease] || [];
      if (forbiddenGoals.includes(selectedGoal)) {
        newWarnings.push({
          disease: diseasesList.find(d => d.id === disease)?.label || disease,
          goal: selectedGoal.replace('_', ' ')
        });
      }
    });
    setWarnings(newWarnings);
  }, [medical, selectedGoal]);

  const toggleDisease = (id: string) => {
    if (id === 'healthy') {
      setMedical(['healthy']);
      return;
    }

    let newMedical = medical.filter(m => m !== 'healthy');
    if (newMedical.includes(id)) {
      newMedical = newMedical.filter(m => m !== id);
    } else {
      newMedical.push(id);
    }

    if (newMedical.length === 0) {
      newMedical = ['healthy'];
    }

    setMedical(newMedical);
  };

  const removeWarning = (indexToRemove: number) => {
    setWarnings(warnings.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={styles['step-card']}>
      <h3 style={{ margin: 0 }}>Final Details</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
        Select any applicable disease conditions (you can select multiple):
      </p>
      
      {warnings.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          {warnings.map((w, idx) => (
            <div key={idx} style={{ background: '#ffebee', color: '#c62828', padding: '10px 15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
              <span>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                <strong>Warning:</strong> The goal "{w.goal}" is forbidden for "{w.disease}". Please change your goal or medical condition.
              </span>
              <button 
                onClick={() => removeWarning(idx)} 
                style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles['card-body']} style={{ marginTop: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
          {diseasesList.map(d => (
            <label key={d.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: medical.includes(d.id) ? '#e3f2fd' : '#f9f9f9', border: medical.includes(d.id) ? '1px solid #90caf9' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
              <input
                type="checkbox"
                checked={medical.includes(d.id)}
                onChange={() => toggleDisease(d.id)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: medical.includes(d.id) ? '#1565c0' : '#333' }}>{d.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step4Final;