import React from 'react';
import {
  IconDoc, IconBriefcase, IconArch, IconShield, IconCode,
  IconChart, IconArrowLeft, IconX,
} from '../icons';
import HealthBreakup from '../health/HealthBreakup';

interface Tool {
  id: string;
  label: string;
  Icon: React.FC<any>;
}

interface SidebarProps {
  repoUrl: string;
  complexityData: any;
  activeAnalysis: string | null;
  showHealthBreakup: boolean;
  onToggleHealth: () => void;
  onAction: (id: string, label: string) => void;
  onNewRepo: () => void;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const TOOLS: Tool[] = [
  { id: 'tech',                label: 'Technical Summary',   Icon: IconDoc },
  { id: 'business',            label: 'Executive Summary',   Icon: IconBriefcase },
  { id: 'arch',                label: 'Architecture Review', Icon: IconArch },
  { id: 'security',            label: 'Security Scan',       Icon: IconShield },
  { id: 'code',                label: 'Code Analysis',       Icon: IconCode },
  { id: 'complexity-analysis', label: 'Complexity Report',   Icon: IconChart },
];

const Sidebar: React.FC<SidebarProps> = ({
  repoUrl, complexityData, activeAnalysis, showHealthBreakup,
  onToggleHealth, onAction, onNewRepo,
  isMobile, isOpen, onClose,
}) => {
  const repoName = repoUrl.split('/').filter(Boolean).pop() ?? repoUrl;

  return (
    <>
      {/* Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          position: isMobile ? 'fixed' : 'relative',
          top: 0, bottom: 0,
          left: isMobile ? (isOpen ? '0' : 'calc(-1 * var(--sidebar-width))') : '0',
          zIndex: 50,
          transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--space-5)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="gradient-text" style={{ fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              RepoMind
            </span>
            {isMobile && (
              <button
                onClick={onClose}
                aria-label="Close menu"
                style={{
                  width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <IconX size={13} />
              </button>
            )}
          </div>

          {/* Repo indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--color-success)',
              boxShadow: '0 0 5px var(--color-success)',
            }} />
            <span style={{
              fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono)',
            }}>
              {repoName}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>

          {/* Health card */}
          <HealthBreakup
            complexityData={complexityData}
            expanded={showHealthBreakup}
            onToggle={onToggleHealth}
          />

          {/* Section label */}
          <p style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            paddingLeft: 'var(--space-2)',
            marginBottom: 'var(--space-2)',
          }}>
            Analysis
          </p>

          {/* Tool buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {TOOLS.map(({ id, label, Icon }) => {
              const isActive = activeAnalysis === label;
              const isDisabled = !!activeAnalysis && !isActive;
              return (
                <button
                  key={id}
                  onClick={() => onAction(id, label)}
                  disabled={isDisabled}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.4 : 1,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isDisabled && !isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{
                    width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    flexShrink: 0,
                  }}>
                    <Icon size={13} color={isActive ? 'var(--color-primary)' : 'currentColor'} />
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: isActive ? 600 : 400 }}>
                    {label}
                  </span>
                  {isActive && (
                    <span style={{ marginLeft: 'auto' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '12px', height: '12px',
                        border: '1.5px solid var(--color-primary)',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onNewRepo}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
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
            <IconArrowLeft size={14} />
            New Repository
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
