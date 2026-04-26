import React from 'react';

const STATS = [
  { value: '800+',      label: 'Token Chunks',     desc: 'Context-aware code indexing' },
  { value: 'Llama 3.1', label: 'Reasoning Engine',  desc: 'Deep logic analysis' },
  { value: 'ChromaDB',  label: 'Vector Store',      desc: 'Semantic search at speed' },
];

const StatCards: React.FC = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 'var(--space-3)',
    width: '100%',
    maxWidth: '680px',
  }}>
    {STATS.map(stat => (
      <div
        key={stat.label}
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          transition: 'border-color 0.15s ease, transform 0.15s ease',
          cursor: 'default',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
          (e.currentTarget as HTMLElement).style.transform   = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.transform   = 'translateY(0)';
        }}
      >
        <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.02em' }}>
          {stat.value}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {stat.label}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {stat.desc}
        </p>
      </div>
    ))}
  </div>
);

export default StatCards;
