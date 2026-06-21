import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { InBodyRecord } from '../../../services/analyticsService';
import styles from './InBodyTable.module.css';

interface InBodyTableProps {
  history: InBodyRecord[];
}

const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(raw: string | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw.slice(0, 10);
  return `${MONTH[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}

/** Render a delta badge. `invertColor` means "down = good" (e.g. body fat). */
function DeltaBadge({ current, previous, unit, invertColor = false }: {
  current: number;
  previous: number;
  unit: string;
  invertColor?: boolean;
}) {
  const diff = +(current - previous).toFixed(1);
  if (diff === 0) {
    return <span className={`${styles.delta} ${styles.deltaNeutral}`}>— {unit}</span>;
  }
  const isUp = diff > 0;
  let cls: string;
  if (invertColor) {
    cls = isUp ? styles.deltaBadUp : styles.deltaGoodDown;
  } else {
    cls = isUp ? styles.deltaUp : styles.deltaDown;
  }
  const arrow = isUp ? '▲' : '▼';
  const sign = isUp ? '+' : '';
  return (
    <span className={`${styles.delta} ${cls}`}>
      {arrow} {sign}{diff} {unit}
    </span>
  );
}

function fatColor(pct: number): string {
  if (pct < 18) return '#16a34a';
  if (pct < 25) return '#f97316';
  return '#ef4444';
}

const InBodyTable: React.FC<InBodyTableProps> = ({ history }) => {
  const navigate = useNavigate();

  // Sort by newest first
  const sorted = [...history].sort((a, b) =>
    new Date(b.measured_at ?? b.created_at ?? '').getTime() -
    new Date(a.measured_at ?? a.created_at ?? '').getTime()
  );

  // Show up to 5 records
  const rows = sorted.slice(0, 5);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>InBody Assessments</h3>
        <button className={styles.viewAll} onClick={() => navigate('/analysis-inbody')}>
          View All <i className="fa-solid fa-arrow-right" />
        </button>
      </div>

      {rows.length === 0 ? (
        <div className={styles.empty}>
          <i className="fa-solid fa-file-circle-xmark" />
          <p>No assessments yet. Complete your first InBody scan.</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>Body Fat %</th>
              <th>Skeletal Muscle</th>
              <th>BMI</th>
              <th>Visceral Fat</th>
              {rows.length > 1 && <th>Change</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const prev = i < rows.length - 1 ? rows[i + 1] : null;
              return (
                <tr key={r.id ?? i}>
                  <td>
                    <span className={styles.reportDate}>
                      {formatDate(r.measured_at ?? r.created_at)}
                    </span>
                  </td>
                  <td className={styles.metricValue}>{r.weight.toFixed(1)} kg</td>
                  <td style={{ color: fatColor(r.body_fat_percentage), fontWeight: 600 }}>
                    {r.body_fat_percentage.toFixed(1)}%
                  </td>
                  <td className={styles.metricValue}>{r.muscle_mass.toFixed(1)} kg</td>
                  <td className={styles.metricValue}>{r.bmi.toFixed(1)}</td>
                  <td>{r.visceral_fat != null ? `Level ${r.visceral_fat}` : '—'}</td>
                  {rows.length > 1 && (
                    <td>
                      {prev ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <DeltaBadge current={r.weight} previous={prev.weight} unit="kg" invertColor />
                          <DeltaBadge current={r.muscle_mass} previous={prev.muscle_mass} unit="kg" />
                        </div>
                      ) : (
                        <span className={`${styles.delta} ${styles.deltaNeutral}`}>Baseline</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InBodyTable;
