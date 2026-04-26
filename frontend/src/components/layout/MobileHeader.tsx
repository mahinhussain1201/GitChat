import React from 'react';
import { IconMenu } from '../icons';

interface MobileHeaderProps {
  onMenuOpen: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuOpen }) => (
  <header style={{
    height: 'var(--header-height)',
    display: 'flex', alignItems: 'center',
    padding: '0 var(--space-4)', gap: 'var(--space-3)',
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
  }}>
    <button
      onClick={onMenuOpen}
      aria-label="Open menu"
      style={{
        width: '34px', height: '34px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
    >
      <IconMenu size={15} />
    </button>
    <span className="gradient-text" style={{ fontSize: 'var(--text-base)', fontWeight: 800, letterSpacing: '-0.03em' }}>
      RepoMind
    </span>
  </header>
);

export default MobileHeader;
