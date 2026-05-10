import React from 'react';
import type { InBodyData } from './types';
import styles from './InBody.module.css';

interface Props {
  data: InBodyData | null;
}

const InBodyStats: React.FC<Props> = ({ data }) => {
  // دالة عرض البيانات مع الوحدات والتعامل مع القيم الفارغة
  const display = (val: string | number | null | undefined, unit: string = ""): string => {
    if (val === null || val === undefined || val === "" || val === 0) return "--";
    return `${val}${unit}`;
  };

  // تنسيق التاريخ ليظهر بشكل مقروء
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.statsContainer}>
      {/* الهيدر المطور ليشمل تواريخ الـ API */}
      <header className={styles.headerSection}>
        <div className={styles.badge}>✦ AI ANALYSIS COMPLETE</div>
        <h1 className={styles.mainTitle}>Your Metabolic Profile</h1>
        <div className={styles.timeTracker}>
  <span className={styles.timeItem}>
    <i className="fa-solid fa-calendar-check"></i> 
    {/* نستخدم ?? undefined لتحويل الـ null لـ undefined بشكل آمن */}
    Measured: {formatDate(data?.measured_at ?? undefined)}
  </span>
  <span className={styles.timeDivider}>|</span>
  <span className={styles.timeItem}>
    <i className="fa-solid fa-clock-rotate-left"></i> 
    Recorded: {formatDate(data?.created_at ?? undefined)}
  </span>
</div>
      </header>

      {/* الجزء العلوي: BMI والوزن (كروت أساسية) */}
      <div className={styles.topGrid}>
        <div className={styles.statCard}>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Body Mass Index (BMI)</span>
            <h2 className={styles.cardValue}>{display(data?.bmi)}</h2>
            <div className={styles.innerBadge}>Healthy Range</div>
          </div>
          <div className={styles.iconBox}><i className="fa-solid fa-scale-balanced"></i></div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Current Weight</span>
            <h2 className={styles.cardValue}>{display(data?.weight, " kg")}</h2>
            <p className={styles.cardSubtext}>Total Body Mass</p>
          </div>
          <div className={styles.iconBox}><i className="fa-solid fa-weight-scale"></i></div>
        </div>
      </div>

      {/* قسم جديد للطول ومعدل الحرق (BMR) لملء الفراغ الجانبي */}
      <div className={styles.secondaryGrid}>
        <div className={styles.statCardSmall}>
          <div className={styles.smallInfo}>
            <span className={styles.cardLabel}>Height</span>
            <h3 className={styles.smallValue}>{display(data?.height, " cm")}</h3>
          </div>
          <i className="fa-solid fa-arrows-up-down" style={{color: '#8b5cf6'}}></i>
        </div>
        <div className={styles.statCardSmall}>
          <div className={styles.smallInfo}>
            <span className={styles.cardLabel}>Basal Metabolic Rate (BMR)</span>
            <h3 className={styles.smallValue}>{display(data?.bmr, " kcal")}</h3>
          </div>
          <i className="fa-solid fa-fire-flame-curved" style={{color: '#f59e0b'}}></i>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Body Composition Details</h3>
      
      {/* الصف الثلاثي: Muscle Mass, PBF, Water */}
      <div className={styles.compositionGrid}>
        <div className={styles.miniCard}>
          <span className={styles.miniLabel}>MUSCLE MASS</span>
          <div className={styles.miniValue}>{display(data?.muscle_mass, " kg")}</div>
        </div>
        <div className={styles.miniCard}>
          <span className={styles.miniLabel}>FAT PERCENTAGE (PBF)</span>
          <div className={styles.miniValue}>{display(data?.["body_fat_percentage (pbf)"], "%")}</div>
        </div>
        <div className={styles.miniCard}>
          <span className={styles.miniLabel}>BODY WATER</span>
          <div className={styles.miniValue}>{display(data?.water, " kg")}</div>
        </div>
      </div>

      {/* كارت Body Fat Mass العريض */}
      <div className={styles.wideInfoCard}>
        <div className={styles.infoText}>
          <strong>Body Fat Mass</strong>
          <p>Calculated adipose tissue weight</p>
        </div>
        <div className={styles.wideValue}>{display(data?.body_fat_mass, " kg")}</div>
      </div>

      <h3 className={styles.sectionTitle}>Structural Components</h3>

      {/* قسم الـ Progress bars للمكونات البنيوية */}
      <div className={styles.progressContainer}>
         <div className={styles.progressItem}>
            <div className={styles.progressLabel}>
                <span>Protein Content</span>
                <span>{display(data?.protein, " kg")}</span>
            </div>
            <div className={styles.progressTrack}>
                <div className={styles.fillProtein} style={{ width: `${Math.min((Number(data?.protein) || 0) * 8, 100)}%` }}></div>
            </div>
         </div>
         
         <div className={styles.progressItem}>
            <div className={styles.progressLabel}>
                <span>Mineral Balance</span>
                <span>{display(data?.minerals, " kg")}</span>
            </div>
            <div className={styles.progressTrack}>
                <div className={styles.fillMinerals} style={{ width: `${Math.min((Number(data?.minerals) || 0) * 15, 100)}%` }}></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default InBodyStats;