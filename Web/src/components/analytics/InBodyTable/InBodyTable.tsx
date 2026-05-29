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
  return `${MONTH[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function fatColor(pct: number): string {
  if (pct < 18) return '#16a34a';
  if (pct < 25) return '#f97316';
  return '#ef4444';
}

const InBodyTable: React.FC<InBodyTableProps> = ({ history }) => {
  const navigate = useNavigate();

  // Show the 3 most-recent records
  const rows = [...history]
    .sort((a, b) =>
      new Date(b.measured_at ?? b.created_at ?? '').getTime() -
      new Date(a.measured_at ?? a.created_at ?? '').getTime()
    )
    .slice(0, 3);

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
              <th>Body Fat %</th>
              <th>Skeletal Muscle</th>
              <th>Visceral Fat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{formatDate(r.measured_at ?? r.created_at)}</td>
                <td style={{ color: fatColor(r.body_fat_percentage), fontWeight: 600 }}>
                  {r.body_fat_percentage.toFixed(1)}%
                </td>
                <td>{r.muscle_mass.toFixed(1)} kg</td>
                <td>{r.visceral_fat != null ? `Level ${r.visceral_fat}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InBodyTable;
