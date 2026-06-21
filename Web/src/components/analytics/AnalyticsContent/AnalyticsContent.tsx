import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import WeightChart    from '../WeightChart/WeightChart';
import styles from './AnalyticsContent.module.css';
import type { InBodyRecord } from '../../../services/analyticsService';

/* ── Helpers ────────────────────────────────────────────────────────────── */

function fmtDate(raw: string | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function delta(current: number, previous: number | undefined, unit: string, invert = false) {
  if (previous == null) return null;
  const diff = +(current - previous).toFixed(1);
  if (Math.abs(diff) < 0.05) return <span className={styles.deltaNeutral}>—</span>;
  const isUp = diff > 0;
  const color = invert ? (isUp ? '#ef4444' : '#10b981') : (isUp ? '#10b981' : '#ef4444');
  const arrow = isUp ? '▲' : '▼';
  const sign = isUp ? '+' : '';
  return <span style={{ color, fontWeight: 600, fontSize: '12px' }}>{arrow} {sign}{diff}{unit}</span>;
}

/* ── Sub-component: stat card ──────────────────────────────────────────── */

function StatCard({ icon, label, value, unit, change }: {
  icon: string; label: string; value: string | number; unit: string;
  change?: React.ReactNode;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}><i className={icon} /></div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statValueRow}>
          <span className={styles.statValue}>{value}</span>
          <span className={styles.statUnit}>{unit}</span>
        </div>
        {change && <div className={styles.statChange}>{change}</div>}
      </div>
    </div>
  );
}

/* ── Sub-component: InBody detail modal ────────────────────────────────── */

function InBodyDetailPanel({ record, prev, onClose }: {
  record: InBodyRecord; prev?: InBodyRecord; onClose: () => void;
}) {
  const rows: { label: string; key: keyof InBodyRecord; unit: string; invert?: boolean }[] = [
    { label: 'Weight',         key: 'weight',              unit: 'kg', invert: true },
    { label: 'Muscle Mass',    key: 'muscle_mass',         unit: 'kg' },
    { label: 'Body Fat %',     key: 'body_fat_percentage', unit: '%', invert: true },
    { label: 'Body Fat Mass',  key: 'body_fat_mass',       unit: 'kg', invert: true },
    { label: 'BMI',            key: 'bmi',                 unit: '', invert: true },
    { label: 'Water',          key: 'water',               unit: 'L' },
    { label: 'Protein',        key: 'protein',             unit: 'kg' },
    { label: 'Minerals',       key: 'minerals',            unit: 'kg' },
    { label: 'BMR',            key: 'bmr',                 unit: 'kcal' },
    { label: 'Visceral Fat',   key: 'visceral_fat',        unit: '', invert: true },
    { label: 'InBody Score',   key: 'inbody_score',        unit: '/100' },
  ];

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <h3><i className="fa-solid fa-clipboard-list" /> InBody Details</h3>
        <button className={styles.closeBtn} onClick={onClose}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className={styles.detailDate}>
        <i className="fa-solid fa-calendar" /> {fmtDate(record.measured_at ?? record.created_at)}
      </div>
      <div className={styles.detailGrid}>
        {rows.map(({ label, key, unit, invert }) => {
          const val = record[key];
          if (val == null || val === '') return null;
          const prevVal = prev ? Number(prev[key]) : undefined;
          return (
            <div key={key} className={styles.detailRow}>
              <span className={styles.detailLabel}>{label}</span>
              <div className={styles.detailValueGroup}>
                <span className={styles.detailValue}>{Number(val).toFixed(1)}{unit ? ` ${unit}` : ''}</span>
                {delta(Number(val), prevVal, unit, invert)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */

const AnalyticsContent: React.FC = () => {
  const { data, loading, error, refetch } = useAnalytics();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div className={`${styles.skel} ${styles.skelTitle}`} />
          <div className={`${styles.skel} ${styles.skelSub}`} />
        </div>
        <div className={styles.skelGrid}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className={`${styles.skel} ${styles.skelCard}`} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className={styles.errorState}>
        <i className="fa-solid fa-triangle-exclamation" />
        <h3>Couldn't load analytics</h3>
        <p>{error || 'No data available.'}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  const { history, averages } = data;

  // Sort newest first
  const sorted = useMemo(() =>
    [...history].sort((a, b) =>
      new Date(b.measured_at ?? b.created_at ?? '').getTime() -
      new Date(a.measured_at ?? a.created_at ?? '').getTime()
    ), [history]);

  const current = sorted[selectedIdx] || null;
  const previous = sorted[selectedIdx + 1] || null;

  if (!current) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyState}>
          <i className="fa-solid fa-file-circle-xmark" />
          <h3>No InBody Data Yet</h3>
          <p>Complete your first InBody scan to see analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Body Analytics</h1>
        <p className={styles.pageSub}>Track your progress across InBody assessments.</p>
      </div>

      {/* ── History selector + actions ──────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.historySelector}>
          <i className="fa-solid fa-clock-rotate-left" />
          <select
            className={styles.historySelect}
            value={selectedIdx}
            onChange={e => { setSelectedIdx(Number(e.target.value)); setShowDetail(false); }}
          >
            {sorted.map((r, i) => (
              <option key={r.id ?? i} value={i}>
                {fmtDate(r.measured_at ?? r.created_at)}
                {i === 0 ? ' (Latest)' : ''}
              </option>
            ))}
          </select>
        </div>
        <button className={styles.detailToggle} onClick={() => setShowDetail(!showDetail)}>
          <i className={`fa-solid ${showDetail ? 'fa-chart-simple' : 'fa-table-list'}`} />
          {showDetail ? 'Summary' : 'InBody Data'}
        </button>
      </div>

      {/* ── Detail panel or summary cards ───────────────── */}
      {showDetail ? (
        <InBodyDetailPanel record={current} prev={previous} onClose={() => setShowDetail(false)} />
      ) : (
        <>
          {/* Key metrics */}
          <div className={styles.statsGrid}>
            <StatCard
              icon="fa-solid fa-weight-scale"
              label="Weight"
              value={current.weight.toFixed(1)}
              unit="kg"
              change={delta(current.weight, previous?.weight, 'kg', true)}
            />
            <StatCard
              icon="fa-solid fa-dumbbell"
              label="Muscle Mass"
              value={current.muscle_mass.toFixed(1)}
              unit="kg"
              change={delta(current.muscle_mass, previous?.muscle_mass, 'kg')}
            />
            <StatCard
              icon="fa-solid fa-droplet"
              label="Body Fat"
              value={current.body_fat_percentage.toFixed(1)}
              unit="%"
              change={delta(current.body_fat_percentage, previous?.body_fat_percentage, '%', true)}
            />
            <StatCard
              icon="fa-solid fa-scale-balanced"
              label="BMI"
              value={current.bmi.toFixed(1)}
              unit=""
              change={delta(current.bmi, previous?.bmi, '', true)}
            />
          </div>

          {/* Chart */}
          <WeightChart history={history} />

          {/* 7-day averages */}
          <div className={styles.avgCard}>
            <h3 className={styles.avgTitle}>
              <i className="fa-solid fa-chart-bar" /> 7-Day Averages
            </h3>
            <div className={styles.avgGrid}>
              <div className={styles.avgItem}>
                <span className={styles.avgLabel}>Calories</span>
                <span className={styles.avgValue}>{averages.calories.toFixed(0)} kcal</span>
              </div>
              <div className={styles.avgItem}>
                <span className={styles.avgLabel}>Protein</span>
                <span className={styles.avgValue}>{averages.protein.toFixed(0)} g</span>
              </div>
              <div className={styles.avgItem}>
                <span className={styles.avgLabel}>Days Tracked</span>
                <span className={styles.avgValue}>{averages.daysWithData} / 7</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsContent;
