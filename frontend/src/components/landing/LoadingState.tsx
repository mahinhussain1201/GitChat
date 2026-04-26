import React, { useState, useEffect } from 'react';

interface LoadingStateProps {
  isMobile: boolean;
}

const STEPS = [
  'Cloning repository',
  'Scanning code structure',
  'Generating vector chunks',
  'Building embeddings',
  'Calculating complexity',
  'Preparing your dashboard',
];

const LoadingState: React.FC<LoadingStateProps> = ({ isMobile }) => {
  const [step, setStep]         = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() =>
      setStep(s => Math.min(s + 1, STEPS.length - 1)), 3500);
    const progTimer = setInterval(() =>
      setProgress(p => p >= 93 ? p : p + Math.random() * 2.5), 380);

    return () => { clearInterval(stepTimer); clearInterval(progTimer); };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : '380px',
        padding: 'var(--space-8)',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 'var(--space-6)',
      }}
    >
      {/* Spinner */}
      <div style={{ position: 'relative', width: '52px', height: '52px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid var(--border-strong)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        {/* Center dot */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            boxShadow: '0 0 10px var(--color-primary)',
            animation: 'pulse-scale 1.6s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Status text */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p style={{
          fontSize: 'var(--text-sm)', fontWeight: 500,
          color: 'var(--text-primary)', marginBottom: 'var(--space-4)',
          minHeight: '1.4em',
        }}>
          {STEPS[step]}
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{
            flex: 1, height: '3px',
            background: 'var(--border-strong)',
            borderRadius: '100px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              borderRadius: '100px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right',
          }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Step track */}
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            height: '3px',
            width: i === step ? '18px' : '6px',
            borderRadius: '100px',
            background: i <= step ? 'var(--color-primary)' : 'var(--border-strong)',
            transition: 'all 0.35s ease',
          }} />
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
