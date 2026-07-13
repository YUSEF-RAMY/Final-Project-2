import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts';
import type { InBodyRecord } from '../../../services/analyticsService';
import type { ChartPeriod } from '../../../hooks/useAnalytics';
import { buildChartData } from '../../../hooks/useAnalytics';
import styles from './WeightChart.module.css';

interface WeightChartProps {
  history: InBodyRecord[];
}

const PERIODS: ChartPeriod[] = ['1M', '3M', 'ALL'];

interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

// Custom tooltip for mouse hover
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const weight = payload.find((p) => p.dataKey === 'weight');
  if (!weight) return null;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipWeight}>{weight.value} kg</span>
      <span className={styles.tooltipDate}>{label}</span>
    </div>
  );
};

// Custom SVG Label for the highlighted persistent pill matching the mockup exactly
const HighlightPill = (props: any) => {
  const { cx, cy, weight, label } = props;
  if (!cx || !cy) return null;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Black circle highlight dot */}
      <circle cx={cx} cy={cy} r={8} fill="#111827" />
      <circle cx={cx} cy={cy} r={4} fill="#ffffff" />
      
      {/* Connector line down to the pill */}
      <line x1={cx} y1={cy + 8} x2={cx} y2={cy + 25} stroke="#111827" strokeWidth={1.5} />
      
      {/* Dark rounded pill */}
      <rect
        x={cx - 36}
        y={cy + 25}
        width={72}
        height={44}
        rx={22}
        fill="#111827"
      />
      {/* Text inside the pill */}
      <text
        x={cx}
        y={cy + 42}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12px"
        fontWeight="700"
        fontFamily="inherit"
      >
        {weight} kg
      </text>
      <text
        x={cx}
        y={cy + 55}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize="9px"
        fontWeight="600"
        fontFamily="inherit"
      >
        {label}
      </text>
    </g>
  );
};

const WeightChart: React.FC<WeightChartProps> = ({ history }) => {
  const [period, setPeriod] = useState<ChartPeriod>('ALL');

  const chartData = useMemo(() => buildChartData(history, period), [history, period]);

  // Compute stat chips
  const { totalChange, muscleChange } = useMemo(() => {
    if (chartData.length < 2) return { totalChange: 0, muscleChange: 0 };
    const first = chartData[0];
    const last  = chartData[chartData.length - 1];
    return {
      totalChange:  +(last.weight - first.weight).toFixed(1),
      muscleChange: +(last.muscle - first.muscle).toFixed(1),
    };
  }, [chartData]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [60, 80];
    const weights = chartData.map((d) => d.weight).filter(w => !isNaN(w));
    if (!weights.length) return [60, 80];
    const min = Math.floor(Math.min(...weights) - 3);
    const max = Math.ceil(Math.max(...weights) + 3);
    if (isNaN(min) || isNaN(max)) return [60, 80];
    return [min, max];
  }, [chartData]);

  // Highlight the latest point dynamically
  const lastPoint = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

  const isEmpty = chartData.length === 0;
  const isSinglePoint = chartData.length === 1;

  return (
    <div className={styles.card}>
      <div className={styles.chartHeader}>
        <div className={styles.statsRow}>
          {isSinglePoint ? (
            <>
              <span className={`${styles.chip} ${styles.chipGreen}`}>
                <i className="fa-solid fa-weight-scale" />
                {chartData[0].weight} kg
                <span className={styles.chipSub}>(Current)</span>
              </span>
              <span className={`${styles.chip} ${styles.chipOrange}`}>
                <i className="fa-solid fa-dumbbell" />
                {chartData[0].muscle} kg
                <span className={styles.chipSub}>(Muscle)</span>
              </span>
            </>
          ) : (
            <>
              <span className={`${styles.chip} ${styles.chipGreen}`}>
                <i className="fa-solid fa-arrow-trend-down" />
                {totalChange < 0 ? '' : '-'}{Math.abs(totalChange)} kg
                <span className={styles.chipSub}>(Total)</span>
              </span>
              <span className={`${styles.chip} ${styles.chipOrange}`}>
                <i className="fa-solid fa-arrows-up-down-left-right" style={{ transform: 'rotate(45deg)', fontSize: '11px' }} />
                {muscleChange >= 0 ? '+' : '-'}{Math.abs(muscleChange)} kg
                <span className={styles.chipSub}>(Muscle)</span>
              </span>
            </>
          )}
        </div>
        <div className={styles.periodTabs}>
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`${styles.tab} ${period === p ? styles.tabActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <h3 className={styles.chartTitle}>
        {isSinglePoint ? 'Your Starting Point' : 'Weight, Muscle & Fat Trajectory'}
      </h3>

      {isEmpty ? (
        <div className={styles.emptyState}>
          <i className="fa-solid fa-chart-line" />
          <p>No InBody data for this period. Complete an InBody assessment to see your trajectory.</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 230, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#047857" stopOpacity={0.06} />
                  <stop offset="95%" stopColor="#047857" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v} kg`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Solid Weight Trajectory in Forest Green */}
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#047857"
                strokeWidth={2.5}
                fill="url(#weightGrad)"
                dot={isSinglePoint ? { r: 6, fill: '#047857', strokeWidth: 2, stroke: '#fff' } : false}
                activeDot={{ r: 5, fill: '#047857', strokeWidth: 2, stroke: '#fff' }}
              />
              
              {/* Dashed Muscle/Lean Mass Trajectory in Warm Orange */}
              <Line
                type="monotone"
                dataKey="muscle"
                stroke="#d97706"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={isSinglePoint ? { r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#fff' } : false}
              />

              {/* Dashed Fat Mass Trajectory in Red */}
              <Line
                type="monotone"
                dataKey="fatMass"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={isSinglePoint ? { r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' } : false}
              />

              {/* Persistent mockup highlighted pill inside Recharts matching design exactly */}
              {lastPoint && (
                <ReferenceDot
                  x={lastPoint.label}
                  y={lastPoint.weight}
                  shape={<HighlightPill weight={lastPoint.weight} label={lastPoint.label} />}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WeightChart;

