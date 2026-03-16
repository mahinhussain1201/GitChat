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
      <div className={isLoading ? "animate-pulse" : ""} style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '4.5rem', margin: 0 }} className="gradient-text">
          RepoMind
        </h1>
      </div>
      
      {!isLoading ? (
        <>
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
              placeholder="Paste GitHub Repository URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
              disabled={!url.trim()}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                opacity: !url.trim() ? 0.5 : 1
              }}
            >
              Analyze Repo
            </button>
          </form>
        </>
      ) : (
        <div className="glass-morphism" style={{ 
          width: '100%', 
          maxWidth: '500px', 
          padding: '40px', 
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div className="animate-spin-slow" style={{ 
            fontSize: '3rem', 
            width: '80px', 
            height: '80px', 
            border: '4px solid var(--border)', 
            borderTopColor: 'var(--primary)', 
            borderRadius: '50%' 
          }} />
          <div>
            <h2 style={{ marginBottom: '8px' }}>Analyzing Repository</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Cloning, Filtering, and Indexing code chunks...</p>
          </div>
          <div className="loading-bar" style={{ width: '100%' }} />
        </div>
      )}
      
      <div style={{ marginTop: '4rem', display: 'flex', gap: '40px', opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.5s' }}>
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
