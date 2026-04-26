import React from 'react';
import HealthRing from './HealthRing';
import MetricBar from './MetricBar';
import { IconChevronDown, IconChevronUp } from '../icons';

interface HealthBreakupProps {
  complexityData: any;
  expanded: boolean;
  onToggle: () => void;
}

const safeMetric = (val: any, formula: (v: number) => number): number => {
  if (typeof val !== 'number') return 0;
  return Math.round(Math.max(0, Math.min(100, formula(val))));
};

const HealthBreakup: React.FC<HealthBreakupProps> = ({ complexityData, expanded, onToggle }) => {
  const score    = complexityData?.final_score ?? 0;
  const grade    = complexityData?.grade       ?? 'N/A';
  const risk     = complexityData?.risk_level  ?? '—';
  const isNA     = grade === 'N/A';

  const riskColor =
    risk === 'Low'      ? 'var(--color-success)' :
    risk === 'Moderate' ? 'var(--color-warning)'  :
    risk === 'High'     ? 'var(--color-danger)'   :
    'var(--text-muted)';

  const metrics = [
    { label: 'Logic Flow',      value: safeMetric(complexityData?.metrics?.avg_cyclomatic, v => 110 - v * 10) },
    { label: 'Maintainability', value: safeMetric(complexityData?.metrics?.maintainability, v => v) },
    { label: 'Code Density',    value: safeMetric(complexityData?.metrics?.avg_loc, v => 110 - v / 5) },
  ];

  return (
    <div
      onClick={onToggle}
      style={{
        padding: 'var(--space-3) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        marginBottom: 'var(--space-4)',
        userSelect: 'none',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
    >
      {/* Summary row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <HealthRing score={score} grade={grade} size={44} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '3px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Health Score
            </span>
            {!isNA && (
              <span style={{
                fontSize: '10px', fontWeight: 700,
                padding: '1px 6px', borderRadius: '100px',
                background: 'rgba(99,102,241,0.12)',
                color: 'var(--color-primary)',
                letterSpacing: '0.03em',
              }}>
                {grade}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: riskColor, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {isNA ? 'Non-Python repo' : `${risk} risk`}
            </span>
          </div>
        </div>

        <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
          {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </div>

      {/* Expanded metrics */}
      {expanded && (
        <div
          style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ height: '1px', background: 'var(--border)' }} />
          {metrics.map(m => <MetricBar key={m.label} label={m.label} value={m.value} />)}
        </div>
      )}
    </div>
  );
};

export default HealthBreakup;
