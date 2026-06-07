import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, logout } from '../../services/profileService';
import type { UserProfile } from '../../services/profileService';
import styles from './ProfileContent.module.css';
import { resolveImageUrl } from '../../services/api';



function formatLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal Weight';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

// ── sub-components ────────────────────────────────────────────────────────────

interface StatTileProps { value: number | string; unit: string; label: string; }
const StatTile: React.FC<StatTileProps> = ({ value, unit, label }) => (
  <div className={styles.statTile}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statUnit}>{unit}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

interface MacroPillProps { label: string; value: number; unit: string; colorClass: string; }
const MacroPill: React.FC<MacroPillProps> = ({ label, value, unit, colorClass }) => (
  <div className={`${styles.macroPill} ${colorClass}`}>
    <span className={styles.macroLabel}>{label}</span>
    <div className={styles.macroValueRow}>
      <span className={styles.macroNum}>{Math.round(value)}</span>
      <span className={styles.macroUnit}>{unit}</span>
    </div>
  </div>
);

interface BodyChipProps { label: string; value: number | string; unit: string; }
const BodyChip: React.FC<BodyChipProps> = ({ label, value, unit }) => (
  <div className={styles.bodyStatChip}>
    <div className={styles.bodyStatChipLabel}>{label}</div>
    <div>
      <span className={styles.bodyStatChipValue}>{value}</span>
      <span className={styles.bodyStatChipUnit}> {unit}</span>
    </div>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

const ProfileContent: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // fetch
  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProfile();
      setProfile(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        navigate('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } finally { navigate('/login'); }
  };

  // ── skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <div className={`${styles.skeleton} ${styles.skeletonHero}`} />
        <div className={styles.skeletonGrid}>
          {[300, 260, 280, 320, 240].map((h, i) => (
            <div key={i} className={styles.skeleton} style={{ height: h }} />
          ))}
        </div>
      </>
    );
  }

  // ── error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.errorState}>
        <i className="fa-solid fa-triangle-exclamation" />
        <h3>Couldn't load your profile</h3>
        <p>{error}</p>
        <button onClick={loadProfile}>Try Again</button>
      </div>
    );
  }

  if (!profile) return null;

  const {
    name, email, profile_image,
    physical_profile: pp,
    nutritional_targets: nt,
    latest_body_report: lbr,
  } = profile;

  const avatarUrl   = resolveImageUrl(profile_image);
  const inbodyImgUrl = lbr?.image ? resolveImageUrl(lbr.image) : null;

  // ── render ────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hero banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>
              <i className="fa-solid fa-user" />
            </div>
          )}
        </div>

        <div className={styles.heroInfo}>
          <h2>{name}</h2>
          <p className={styles.heroEmail}>{email}</p>
          <div className={styles.heroBadges}>
            <span className={styles.heroBadge}>
              <i className="fa-solid fa-dumbbell" />
              {formatLabel(pp.primary_objective)}
            </span>
            <span className={`${styles.heroBadge} ${styles.heroBadgeSecondary}`}>
              <i className="fa-solid fa-bolt" />
              {formatLabel(pp.activity_level)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Card grid ── */}
      <div className={styles.cardsGrid}>

        {/* 1 ─ Personal Info */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <i className={`fa-solid fa-id-card ${styles.iconGreen}`} />
            Personal Information
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}><i className="fa-solid fa-user" />Full Name</span>
            <span className={styles.infoValue}>{name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}><i className="fa-solid fa-envelope" />Email</span>
            <span className={styles.infoValue}>{email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}><i className="fa-solid fa-venus-mars" />Gender</span>
            <span className={styles.infoValue}>{formatLabel(pp.gender)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}><i className="fa-solid fa-person-running" />Activity Level</span>
            <span className={styles.infoValue}>{formatLabel(pp.activity_level)}</span>
          </div>
        </div>

        {/* 2 ─ Physical Profile */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <i className={`fa-solid fa-person ${styles.iconBlue}`} />
            Physical Profile
          </div>
          <div className={styles.statsGrid}>
            <StatTile value={pp.age}    unit="yrs" label="Age"    />
            <StatTile value={pp.height} unit="cm"  label="Height" />
            <StatTile value={pp.weight} unit="kg"  label="Weight" />
          </div>

          {/* Diseases */}
          {pp.medical_conditions && pp.medical_conditions !== 'healthy' && (
            <div className={styles.diseasesSection} style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-notes-medical" /> Medical Conditions
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {pp.medical_conditions.split(',').map(disease => (
                  <span key={disease} style={{ background: '#fca5a5', color: '#7f1d1d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                    {formatLabel(disease)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3 ─ Goals & Targets */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <i className={`fa-solid fa-bullseye ${styles.iconPurple}`} />
            Goals &amp; Targets
          </div>

          <div className={styles.objectiveBadge}>
            <i className="fa-solid fa-trophy" />
            {formatLabel(pp.primary_objective)}
          </div>

          <div className={styles.macroGrid}>
            <MacroPill label="Calories" value={nt.calories} unit="kcal" colorClass={styles.macroPillCal}  />
            <MacroPill label="Protein"  value={nt.protein}  unit="g"    colorClass={styles.macroPillProt} />
            <MacroPill label="Carbs"    value={nt.carbs}    unit="g"    colorClass={styles.macroPillCarb} />
            <MacroPill label="Fats"     value={nt.fats}     unit="g"    colorClass={styles.macroPillFat}  />
          </div>
        </div>

        {/* 4 ─ Latest Body Report */}
        {lbr && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <i className={`fa-solid fa-chart-column ${styles.iconOrange}`} />
              Latest Body Report
            </div>

            {/* BMI hero row */}
            <div className={styles.bmiRow}>
              <div className={styles.bmiCircle}>
                <span className={styles.bmiNum}>{lbr.bmi}</span>
                <span className={styles.bmiText}>BMI</span>
              </div>
              <div className={styles.bmiMeta}>
                <p>Body Mass Index</p>
                <strong>{bmiCategory(lbr.bmi)}</strong>
                {lbr.measured_at && (
                  <p className={styles.measuredAt}>
                    Measured {new Date(lbr.measured_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* AI Classification */}
            {lbr.classification && (
              <div className={styles.classificationBox}>
                <div className={styles.classificationTitle}>
                  <i className="fa-solid fa-robot" />
                  Body Type: {lbr.classification.category}
                </div>
                <p className={styles.classificationReason}>
                  {lbr.classification.reasoning}
                </p>
              </div>
            )}

            {/* Body stat chips — all fields */}
            <div className={styles.bodyStatsGrid}>
              <BodyChip label="Muscle Mass"  value={lbr.muscle_mass}          unit="kg" />
              <BodyChip label="Body Fat %"   value={lbr.body_fat_percentage}  unit="%"  />
              <BodyChip label="Body Fat Mass" value={lbr.body_fat_mass}       unit="kg" />
              <BodyChip label="Water"         value={lbr.water}               unit="L"  />
              <BodyChip label="Protein"       value={lbr.protein}             unit="kg" />
              <BodyChip label="Minerals"      value={lbr.minerals}            unit="kg" />
            </div>

            {/* InBody scan image */}
            {inbodyImgUrl && (
              <div className={styles.inbodyImgWrapper}>
                <p className={styles.inbodyImgLabel}>
                  <i className="fa-solid fa-image" /> InBody Scan
                </p>
                <img
                  src={inbodyImgUrl}
                  alt="InBody scan report"
                  className={styles.inbodyImg}
                />
              </div>
            )}
          </div>
        )}

        {/* 5 ─ Actions */}
        <div className={styles.actionsCard}>
          <button
            id="update-body-data-btn"
            className={styles.updateBtn}
            onClick={() => navigate('/onboarding2')}
          >
            <i className="fa-solid fa-rotate" />
            Update Body Data
          </button>

          <button
            id="logout-btn"
            className={styles.logoutBtn}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <><i className="fa-solid fa-circle-notch fa-spin" /> Logging out…</>
            ) : (
              <><i className="fa-solid fa-right-from-bracket" /> Log Out</>
            )}
          </button>
        </div>

      </div>
    </>
  );
};

export default ProfileContent;
