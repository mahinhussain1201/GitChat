import React, { useState } from 'react';
import { IconArrowUp } from '../icons';

interface UrlFormProps {
  onAnalyze: (url: string) => void;
  isMobile: boolean;
}

const EXAMPLES = [
  { label: 'langchain-ai/langgraph', url: 'https://github.com/langchain-ai/langgraph' },
  { label: 'clerkinc/clerk-js',      url: 'https://github.com/clerkinc/clerk-js' },
];

const UrlForm: React.FC<UrlFormProps> = ({ onAnalyze, isMobile }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let trimmed = url.trim();
    if (trimmed) {
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = `https://${trimmed}`;
      }
      onAnalyze(trimmed);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', width: '100%' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 'var(--space-2)',
          boxShadow: 'var(--shadow-md)',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.5)'}
        onBlur={e  => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
      >
        <input
          type="text"
          placeholder="https://github.com/owner/repository"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            minWidth: 0,
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button
          type="submit"
          disabled={!url.trim()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            background: url.trim() ? 'var(--color-primary)' : 'var(--bg-raised)',
            border: 'none',
            color: url.trim() ? 'white' : 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: url.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <IconArrowUp size={14} color="currentColor" />
          Analyze
        </button>
      </form>

      {/* Example repos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Examples:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setUrl(ex.url)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.15s',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: '3px',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UrlForm;
