import React from 'react';
import styles from './OnboardingSteps.module.css';

// تعريف الـ Types الخاصة بالـ Props لخطوة النشاط
interface Step2ActivityProps {
  activity: string;
  setActivity: (value: string) => void;
}

const Step2Activity: React.FC<Step2ActivityProps> = ({ activity, setActivity }) => (
  // تعديل الاستدعاء هنا ليقرأ من ملف الموديول
  <div className={styles['step-card']}>
    <h3 style={{ margin: 0 }}>Activity Level</h3>
    <div className={styles['card-body']}>
      <select 
        id="activity" 
        style={{ marginTop: '10px' }} 
        value={activity} 
        onChange={(e) => setActivity(e.target.value)}
        // تأكدي أن الـ select نفسه ليس له كلاس خاص في الـ CSS، 
        // إذا كان له كلاس (مثل input أو select) أضيفيه هنا بنفس الطريقة
      >
        <option value="">Select Level</option>
        <option value="sedentary">sedentary</option>
        <option value="lightly_active">lightly active</option>
        <option value="moderately_active">moderately active</option>
        <option value="very_active">very active</option>
      </select>
    </div>
  </div>
);

export default Step2Activity;