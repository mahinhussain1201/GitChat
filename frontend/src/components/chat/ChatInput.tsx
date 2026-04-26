import React, { useRef, useEffect } from 'react';
import { IconArrowUp } from '../icons';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDisabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isDisabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled && value.trim()) onSubmit(e as any);
    }
  };

  const canSend = !isDisabled && !!value.trim();

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: 'var(--space-3) var(--space-5) var(--space-5)',
      background: 'linear-gradient(to top, var(--bg-base) 65%, transparent)',
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 20,
    }}>
      <form
        onSubmit={onSubmit}
        style={{ width: '100%', maxWidth: 'var(--chat-max-width)', pointerEvents: 'auto' }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)',
          padding: 'var(--space-2)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          transition: 'border-color 0.2s',
        }}>
          <textarea
            ref={textareaRef}
            placeholder="Ask anything about this codebase…"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            rows={1}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: 'var(--text-sm)',
              resize: 'none',
              lineHeight: 1.6,
              maxHeight: '160px',
              overflowY: 'auto',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            style={{
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              background: canSend ? 'var(--color-primary)' : 'var(--bg-raised)',
              border: 'none',
              color: canSend ? 'white' : 'var(--text-muted)',
              cursor: canSend ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {isDisabled ? (
              <span style={{
                width: '14px', height: '14px',
                border: '1.5px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <IconArrowUp size={14} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
