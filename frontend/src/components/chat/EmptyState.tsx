import React from 'react';
import { IconLayers, IconShield, IconCode, IconChart } from '../icons';

interface EmptyStateProps {
  repoUrl: string;
  isMobile: boolean;
  complexityData: any;
  onAction: (id: string, label: string) => void;
  onSetInput: (val: string) => void;
}

const SUGGESTIONS = [
  {
    Icon: IconLayers,
    text: 'Explain the high-level architecture',
    sub: 'Understand how services and modules connect',
    action: 'arch',
    actionLabel: 'Architecture Review',
  },
  {
    Icon: IconShield,
    text: 'Scan for security vulnerabilities',
    sub: 'Identify potential attack surfaces',
    action: 'security',
    actionLabel: 'Security Scan',
  },
  {
    Icon: IconCode,
    text: 'How does data flow between services?',
    sub: 'Trace the path of data through the system',
  },
  {
    Icon: IconChart,
    text: 'Identify technical debt and code smells',
    sub: 'Surface quality issues and improvement areas',
  },
];

const EmptyState: React.FC<EmptyStateProps> = ({ isMobile, complexityData, onAction, onSetInput }) => (
  <div className="animate-in" style={{ textAlign: 'center', padding: 'var(--space-10) 0 var(--space-16)' }}>

    {/* Headline */}
    <h2 style={{
      fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-3xl)',
      fontWeight: 700,
      letterSpacing: '-0.03em',
      marginBottom: 'var(--space-2)',
    }}>
      What would you like to explore?
    </h2>
    <p style={{
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-sm)',
      marginBottom: 'var(--space-8)',
      fontWeight: 400,
      lineHeight: 1.6,
    }}>
      Ask anything about this codebase — or choose a starting point below.
    </p>

    {/* Heatmap */}
    {complexityData?.heatmap?.length > 0 && (
      <div style={{
        marginBottom: 'var(--space-8)',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Complexity Heatmap
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {complexityData.heatmap.length} files
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: 'var(--space-3)' }}>
          {complexityData.heatmap.map((item: any, i: number) => {
            const c = item.risk === 'High' ? 'var(--color-danger)' : item.risk === 'Moderate' ? 'var(--color-warning)' : 'var(--color-success)';
            return (
              <div
                key={i}
                title={`${item.file}  ·  ${item.risk} risk`}
                style={{
                  width: '10px', height: '10px', borderRadius: '2px',
                  background: c,
                  opacity: 0.4 + (item.score / 200),
                  transition: 'transform 0.12s, opacity 0.12s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.8)';
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.opacity = String(0.4 + (item.score / 200));
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
          {[['var(--color-danger)', 'High'], ['var(--color-warning)', 'Moderate'], ['var(--color-success)', 'Low']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: color }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Suggestion cards */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 'var(--space-3)',
      textAlign: 'left',
    }}>
      {SUGGESTIONS.map(({ Icon, text, sub, action, actionLabel }) => (
        <button
          key={text}
          onClick={() => action ? onAction(action, actionLabel!) : onSetInput(text)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            textAlign: 'left', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'var(--border-strong)';
            el.style.background  = 'var(--bg-raised)';
            el.style.color       = 'var(--text-primary)';
            el.style.transform   = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'var(--border)';
            el.style.background  = 'var(--bg-card)';
            el.style.color       = 'var(--text-secondary)';
            el.style.transform   = 'translateY(0)';
          }}
        >
          <span style={{
            width: '34px', height: '34px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            marginTop: '1px',
          }}>
            <Icon size={15} color="var(--color-primary)" />
          </span>
          <div>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: '3px', color: 'inherit' }}>
              {text}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {sub}
            </p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;
