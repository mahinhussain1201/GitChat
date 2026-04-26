import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const CodeBlock: React.FC<{ className?: string; children?: React.ReactNode; [key: string]: any }> = ({
  className, children, ...props
}) => {
  const match    = /language-(\w+)/.exec(className || '');
  const isInline = !match && !String(children).includes('\n');

  if (isInline) {
    return (
      <code
        className={className}
        {...props}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.87em',
          background: 'rgba(99,102,241,0.1)',
          color: '#a5b4fc',
          padding: '0.15em 0.4em',
          borderRadius: '4px',
          border: '1px solid rgba(99,102,241,0.18)',
        }}
      >
        {children}
      </code>
    );
  }

  return (
    <div style={{ position: 'relative', margin: 'var(--space-5) 0' }}>
      {match && (
        <div style={{
          position: 'absolute', top: '0', right: '0',
          background: 'var(--color-primary)',
          color: 'white',
          fontSize: '10px',
          padding: '3px 10px',
          borderRadius: '0 var(--radius-md) 0 var(--radius-sm)',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
        }}>
          {match[1]}
        </div>
      )}
      <div style={{
        background: '#060a12',
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-md)',
        overflowX: 'auto',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <code
          className={className}
          {...props}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', background: 'transparent', padding: 0 }}
        >
          {children}
        </code>
      </div>
    </div>
  );
};

/** Minimal animated "AI is thinking" dots */
const ThinkingDots = () => (
  <div style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-3) 0' }}>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        className="typing-dot"
        style={{
          display: 'inline-block',
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'var(--color-primary)',
          animationDelay: `${i * 0.18}s`,
        }}
      />
    ))}
  </div>
);

/** Minimal "AI" avatar — just initials in a box */
const AIAvatar = () => (
  <div style={{
    width: '28px', height: '28px',
    borderRadius: 'var(--radius-sm)',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(56,189,248,0.1))',
    border: '1px solid rgba(99,102,241,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  }}>
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="6" r="3" />
      <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" />
    </svg>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isStreaming }) => {
  if (role === 'user') {
    return (
      <div className="animate-in" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '76%',
          background: 'var(--color-primary)',
          color: 'white',
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) var(--space-1) var(--radius-lg)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.6,
          fontWeight: 400,
        }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
      <AIAvatar />
      <div style={{ flex: 1, minWidth: 0 }}>
        {isStreaming && content === '' ? (
          <ThinkingDots />
        ) : (
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock as any }}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
