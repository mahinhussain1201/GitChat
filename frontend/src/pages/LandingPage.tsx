import React, { useState } from 'react';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  return (
    <div className="landing-container animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }} className="gradient-text">
        RepoMind
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '600px' }}>
        Unlock AI-powered insights from any GitHub repository. 
        Analyze codebases, chat with files, and understand complex architectures instantly.
      </p>
      
      <form onSubmit={handleSubmit} className="glass-morphism" style={{
        width: '100%',
        maxWidth: '600px',
        padding: '8px',
        borderRadius: '16px',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          placeholder="Paste GitHub Repository URL (e.g., https://github.com/user/repo)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '12px 16px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            opacity: isLoading || !url.trim() ? 0.5 : 1
          }}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Repo'}
        </button>
      </form>
      
      <div style={{ marginTop: '3rem', display: 'flex', gap: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>800</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Token Chunks</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>Llama 3.1</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Reasoning Engine</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>ChromaDB</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vector Engine</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
