import React from 'react';

interface MetricBarProps {
  label: string;
  value: number;   // 0-100
}

const getColor = (v: number) => {
  const hue = Math.min(130, Math.max(0, v * 1.3));
  return `hsl(${hue}, 65%, 52%)`;
};

const MetricBar: React.FC<MetricBarProps> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: getColor(value), fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
        {value}%
      </span>
    </div>
    <div style={{
      height: '4px',
      background: 'var(--border-strong)',
      borderRadius: '100px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        background: getColor(value),
        borderRadius: '100px',
        transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: `0 0 6px ${getColor(value)}80`,
      }} />
    </div>
  </div>
);

export default MetricBar;
