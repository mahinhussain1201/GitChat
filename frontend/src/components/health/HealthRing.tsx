import React from 'react';

interface HealthRingProps {
  score: number;       // 0-100
  grade?: string;
  size?: number;
}

const getColor = (v: number) => {
  const hue = Math.min(130, Math.max(0, v * 1.3));
  return `hsl(${hue}, 65%, 52%)`;
};

const CIRCUMFERENCE = 2 * Math.PI * 16; // r=16

const HealthRing: React.FC<HealthRingProps> = ({ score, grade, size = 56 }) => {
  const isNA = grade === 'N/A';
  const dashOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color = getColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        viewBox="0 0 36 36"
        style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="18" cy="18" r="16"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="2.5"
        />
        {!isNA && (
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 4px ${color}80)` }}
          />
        )}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isNA ? '0.6rem' : '0.82rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        color: isNA ? 'var(--text-muted)' : color,
      }}>
        {isNA ? 'N/A' : score}
      </div>
    </div>
  );
};

export default HealthRing;
