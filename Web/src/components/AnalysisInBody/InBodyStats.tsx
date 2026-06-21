import React from 'react';
import type { InBodyData } from './types';
import styles from './InBody.module.css';

interface Props {
  data: InBodyData | null;
}

const InBodyStats: React.FC<Props> = ({ data }) => {

  const display = (val: string | number | null | undefined, unit: string = ""): string => {
    if (val === null || val === undefined || val === "" || val === 0) return "--";
    return `${val}${unit}`;
  };


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

      <header className={styles.headerSection}>
        <div className={styles.badge}>✦ AI ANALYSIS COMPLETE</div>
        <h1 className={styles.mainTitle}>Your Metabolic Profile</h1>
        <div className={styles.timeTracker}>
          <span className={styles.timeItem}>
            <i className="fa-solid fa-calendar-check"></i>

            Measured: {formatDate(data?.measured_at ?? undefined)}
          </span>
          <span className={styles.timeDivider}>|</span>
          <span className={styles.timeItem}>
            <i className="fa-solid fa-clock-rotate-left"></i>
            Recorded: {formatDate(data?.created_at ?? undefined)}
          </span>
        </div>
      </header>


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


      <div className={styles.secondaryGrid}>
        <div className={styles.statCardSmall}>
          <div className={styles.smallInfo}>
            <span className={styles.cardLabel}>Height</span>
            <h3 className={styles.smallValue}>{display(data?.height, " cm")}</h3>
          </div>
          <i className="fa-solid fa-arrows-up-down" style={{ color: '#8b5cf6' }}></i>
        </div>
        <div className={styles.statCardSmall}>
          <div className={styles.smallInfo}>
            <span className={styles.cardLabel}>Basal Metabolic Rate (BMR)</span>
            <h3 className={styles.smallValue}>{display(data?.bmr, " kcal")}</h3>
          </div>
          <i className="fa-solid fa-fire-flame-curved" style={{ color: '#f59e0b' }}></i>
        </div>
      </div>

      <div className={styles.secondaryGrid} style={{ marginTop: '16px' }}>
        <div className={styles.statCardSmall}>
          <div className={styles.smallInfo}>
            <span className={styles.cardLabel}>Total Daily Energy Exp. (TDEE)</span>
            <h3 className={styles.smallValue}>{display(data?.tdee, " kcal")}</h3>
          </div>
          <i className="fa-solid fa-bolt" style={{ color: '#ef4444' }}></i>
        </div>
        <div className={styles.statCardSmall}>
          <div className={styles.smallInfo}>
            <span className={styles.cardLabel}>InBody Score</span>
            <h3 className={styles.smallValue}>{display(data?.inbody_score, " / 100")}</h3>
          </div>
          <i className="fa-solid fa-award" style={{ color: '#10b981' }}></i>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Body Composition Details</h3>

      <div className={styles.compositionGrid}>
        <div className={styles.miniCard}>
          <span className={styles.miniLabel}>MUSCLE MASS</span>
          <div className={styles.miniValue}>{display(data?.muscle_mass, " kg")}</div>
        </div>
        <div className={styles.miniCard}>
          <span className={styles.miniLabel}>FAT PERCENTAGE (PBF)</span>
          <div className={styles.miniValue}>
            {display(data?.body_fat_percentage ?? data?.["body_fat_percentage (pbf)"], "%")}
          </div>
        </div>
        <div className={styles.miniCard}>
          <span className={styles.miniLabel}>BODY WATER</span>
          <div className={styles.miniValue}>{display(data?.water, " kg")}</div>
        </div>
      </div>

      <div className={styles.wideInfoCard}>
        <div className={styles.infoText}>
          <strong>Body Fat Mass</strong>
          <p>Calculated adipose tissue weight</p>
        </div>
        <div className={styles.wideValue}>{display(data?.body_fat_mass, " kg")}</div>
      </div>

      <div className={styles.wideInfoCard} style={{ marginTop: '12px', borderLeftColor: '#f97316' }}>
        <div className={styles.infoText}>
          <strong>Visceral Fat Level</strong>
          <p>Fat surrounding internal organs</p>
        </div>
        <div className={styles.wideValue}>{display(data?.visceral_fat, " Level")}</div>
      </div>

      <div className={styles.wideInfoCard} style={{ marginTop: '12px', borderLeftColor: '#8b5cf6' }}>
        <div className={styles.infoText}>
          <strong>Lean Body Mass (LBM)</strong>
          <p>Total weight minus fat mass</p>
        </div>
        <div className={styles.wideValue}>{display(data?.lbm, " kg")}</div>
      </div>

      <h3 className={styles.sectionTitle}>Structural Components</h3>

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

      <h3 className={styles.sectionTitle}>Calculated Macro Targets</h3>
      
      <div className={styles.compositionGrid}>
        <div className={styles.miniCard} style={{ borderBottom: '3px solid #f59e0b' }}>
          <span className={styles.miniLabel}>PROTEIN</span>
          <div className={styles.miniValue}>{display(data?.target_protein, " g")}</div>
        </div>
        <div className={styles.miniCard} style={{ borderBottom: '3px solid #3b82f6' }}>
          <span className={styles.miniLabel}>CARBS</span>
          <div className={styles.miniValue}>{display(data?.target_carbs, " g")}</div>
        </div>
        <div className={styles.miniCard} style={{ borderBottom: '3px solid #ef4444' }}>
          <span className={styles.miniLabel}>FATS</span>
          <div className={styles.miniValue}>{display(data?.target_fats, " g")}</div>
        </div>
      </div>
      
    </div>
  );
};

export default InBodyStats;