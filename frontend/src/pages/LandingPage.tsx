import React, { useState } from 'react';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      padding: isMobile ? '40px 20px' : '0 20px'
    }}>
      <div className={isLoading ? "animate-pulse" : ""} style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: isMobile ? '3rem' : '4.5rem', margin: 0 }} className="gradient-text">
          RepoMind
        </h1>
      </div>
      
      {!isLoading ? (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? '1rem' : '1.25rem', marginBottom: '2rem', maxWidth: '600px' }}>
            Unlock AI-powered insights from any GitHub repository. 
            Analyze codebases, chat with files, and understand complex architectures instantly.
          </p>
          
          <form onSubmit={handleSubmit} className="glass-morphism" style={{
            width: '100%',
            maxWidth: '600px',
            padding: '8px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
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
          padding: isMobile ? '24px' : '40px', 
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div className="animate-spin-slow" style={{ 
            fontSize: '3rem', 
            width: '60px', 
            height: '60px', 
            border: '4px solid var(--border)', 
            borderTopColor: 'var(--primary)', 
            borderRadius: '50%' 
          }} />
          <div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '8px' }}>Analyzing Repository</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cloning, Filtering, and Indexing code chunks...</p>
          </div>
          <div className="loading-bar" style={{ width: '100%' }} />
        </div>
      )}
      
      <div style={{ 
        marginTop: '4rem', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '24px' : '40px', 
        opacity: isLoading ? 0.3 : 1, 
        transition: 'opacity 0.5s' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>800</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Token Chunks</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>Llama 3.1</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reasoning Engine</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>ChromaDB</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vector Engine</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
