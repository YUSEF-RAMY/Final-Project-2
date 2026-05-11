import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/home/sidebar/Sidebar';
import Header from '../../components/home/header/Header';
import { fetchProfile, logout } from '../../services/profileService';
import type { UserProfile } from '../../services/profileService';
import styles from './Profile.module.css';

// ── helpers ──────────────────────────────────────────────────────────────────

function resolveImageUrl(rawUrl: string | null): string | null {
  if (!rawUrl) return null;
  const apiBase = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
  if (!rawUrl.startsWith('http')) return `${apiBase}/${rawUrl.replace(/^\//, '')}`;
  if (rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1')) {
    try {
      const u = new URL(rawUrl);
      return `${apiBase}${u.pathname}${u.search}`;
    } catch {
      return rawUrl;
    }
  }
  return rawUrl;
}

function formatObjective(raw: string): string {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── component ─────────────────────────────────────────────────────────────────

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── fetch profile ──────────────────────────────────────────────
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── logout ─────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  // ── skeleton ───────────────────────────────────────────────────
  const renderSkeleton = () => (
    <>
      <div className={`${styles.skeleton} ${styles.skeletonHero}`} />
      <div className={styles.skeletonGrid}>
        {[320, 280, 260, 280].map((h, i) => (
          <div key={i} className={styles.skeleton} style={{ height: h }} />
        ))}
      </div>
    </>
  );

  // ── error ──────────────────────────────────────────────────────
  const renderError = () => (
    <div className={styles.errorState}>
      <i className="fa-solid fa-triangle-exclamation" />
      <h3>Couldn't load your profile</h3>
      <p>{error}</p>
      <button onClick={loadProfile}>Try Again</button>
    </div>
  );

  // ── main render ────────────────────────────────────────────────
  const renderContent = () => {
    if (!profile) return null;

    const { name, email, profile_image, physical_profile: pp, nutritional_targets: nt, latest_body_report: lbr } = profile;
    const avatarUrl = resolveImageUrl(profile_image);

    return (
      <>
        {/* ── Hero banner ── */}
        <div className={styles.heroBanner}>
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatar}>
                <i className="fa-solid fa-user" />
              </div>
            )}
          </div>

          <div className={styles.heroInfo}>
            <h2>{name}</h2>
            <p>{email}</p>
            <span className={styles.heroBadge}>
              <i className="fa-solid fa-dumbbell" />
              {formatObjective(pp.primary_objective)}
            </span>
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div className={styles.cardsGrid}>

          {/* 1. Personal Info */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <i className={`fa-solid fa-id-card ${styles.iconGreen}`} />
              Personal Information
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <i className="fa-solid fa-user" />
                Full Name
              </span>
              <span className={styles.infoValue}>{name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>
                <i className="fa-solid fa-envelope" />
                Email
              </span>
              <span className={styles.infoValue}>{email}</span>
            </div>
          </div>

          {/* 2. Physical Profile */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <i className={`fa-solid fa-person ${styles.iconBlue}`} />
              Physical Profile
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statTile}>
                <div className={styles.statValue}>{pp.age}</div>
                <div className={styles.statUnit}>yrs</div>
                <div className={styles.statLabel}>Age</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statValue}>{pp.height}</div>
                <div className={styles.statUnit}>cm</div>
                <div className={styles.statLabel}>Height</div>
              </div>
              <div className={styles.statTile}>
                <div className={styles.statValue}>{pp.weight}</div>
                <div className={styles.statUnit}>kg</div>
                <div className={styles.statLabel}>Weight</div>
              </div>
            </div>
          </div>

          {/* 3. Goals & Targets */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <i className={`fa-solid fa-bullseye ${styles.iconPurple}`} />
              Goals &amp; Targets
            </div>

            {/* Primary objective badge */}
            <div className={styles.objectiveBadge}>
              <i className="fa-solid fa-trophy" />
              {formatObjective(pp.primary_objective)}
            </div>

            {/* Nutritional targets */}
            <div className={styles.macroGrid}>
              <div className={`${styles.macroPill} ${styles.macroPillCal}`}>
                <span className={styles.macroLabel}>Calories</span>
                <div className={styles.macroValueRow}>
                  <span className={styles.macroNum}>{Math.round(nt.calories)}</span>
                  <span className={styles.macroUnit}>kcal</span>
                </div>
              </div>
              <div className={`${styles.macroPill} ${styles.macroPillProt}`}>
                <span className={styles.macroLabel}>Protein</span>
                <div className={styles.macroValueRow}>
                  <span className={styles.macroNum}>{Math.round(nt.protein)}</span>
                  <span className={styles.macroUnit}>g</span>
                </div>
              </div>
              <div className={`${styles.macroPill} ${styles.macroPillCarb}`}>
                <span className={styles.macroLabel}>Carbs</span>
                <div className={styles.macroValueRow}>
                  <span className={styles.macroNum}>{Math.round(nt.carbs)}</span>
                  <span className={styles.macroUnit}>g</span>
                </div>
              </div>
              <div className={`${styles.macroPill} ${styles.macroPillFat}`}>
                <span className={styles.macroLabel}>Fats</span>
                <div className={styles.macroValueRow}>
                  <span className={styles.macroNum}>{Math.round(nt.fats)}</span>
                  <span className={styles.macroUnit}>g</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Latest Body Report (conditional) */}
          {lbr && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <i className={`fa-solid fa-chart-column ${styles.iconOrange}`} />
                Latest Body Report
              </div>

              <div className={styles.bmiRow}>
                <div className={styles.bmiCircle}>
                  <span className={styles.bmiNum}>{lbr.bmi}</span>
                  <span className={styles.bmiText}>BMI</span>
                </div>
                <div className={styles.bmiMeta}>
                  <p>Body Mass Index</p>
                  <strong>
                    {lbr.bmi < 18.5
                      ? 'Underweight'
                      : lbr.bmi < 25
                        ? 'Normal Weight'
                        : lbr.bmi < 30
                          ? 'Overweight'
                          : 'Obese'}
                  </strong>
                  {lbr.measured_at && (
                    <p style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>
                      Measured {new Date(lbr.measured_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.bodyStatsGrid}>
                <div className={styles.bodyStatChip}>
                  <div className={styles.bodyStatChipLabel}>Muscle Mass</div>
                  <div>
                    <span className={styles.bodyStatChipValue}>{lbr.muscle_mass}</span>
                    <span className={styles.bodyStatChipUnit}> kg</span>
                  </div>
                </div>
                <div className={styles.bodyStatChip}>
                  <div className={styles.bodyStatChipLabel}>Body Fat %</div>
                  <div>
                    <span className={styles.bodyStatChipValue}>{lbr.body_fat_percentage}</span>
                    <span className={styles.bodyStatChipUnit}> %</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Actions */}
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
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" />
                  Logging out…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-from-bracket" />
                  Log Out
                </>
              )}
            </button>
          </div>

        </div>
      </>
    );
  };

  // ── page shell ─────────────────────────────────────────────────
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.scrollableContent}>
          <div className={styles.pageHeader}>
            <h1>Your Profile</h1>
            <p>Manage your personal data, goals, and app preferences.</p>
          </div>

          {loading
            ? renderSkeleton()
            : error
              ? renderError()
              : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
