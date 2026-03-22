import React, { useState, useEffect } from 'react';

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
        <LoadingState isMobile={isMobile} />
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

const LoadingState: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    "Cloning the repository...",
    "Scanning code structure...",
    "Filtering source files...",
    "Generating token chunks...",
    "Building vector embeddings...",
    "Calculating complexity metrics...",
    "Preparing your dashboard..."
  ];

  const tips = [
    "Tip: RepoMind works with public GitHub repositories.",
    "Tip: You can ask for architectural summaries later.",
    "Tip: Large repositories might take a few extra seconds.",
    "Tip: We use Llama 3 for deep code reasoning.",
    "Tip: Check out the Security Scan for vulnerability audits."
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 2;
      });
    }, 400);

    return () => {
      clearInterval(messageInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="glass-morphism" style={{ 
      width: '100%', 
      maxWidth: '500px', 
      padding: isMobile ? '32px 24px' : '48px', 
      borderRadius: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      alignItems: 'center',
      boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
    }}>
      <div className="pulse-loader" style={{ 
        position: 'relative',
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
          <div className="loader-inner" style={{
            width: '60px',
            height: '60px',
            border: '4px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div className="pulse-brain" style={{
            position: 'absolute',
            fontSize: '2rem'
          }}>
            🧠
          </div>
      </div>

      <div style={{ textAlign: 'center', width: '100%' }}>
        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', marginBottom: '16px', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {messages[messageIndex]}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
            flex: 1, 
            height: '8px', 
            background: 'var(--border)', 
            borderRadius: '4px', 
            overflow: 'hidden'
            }}>
            <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                transition: 'width 0.4s ease',
                boxShadow: '0 0 10px var(--primary)'
            }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '35px' }}>{Math.round(progress)}%</span>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', height: '1.2rem' }}>
          {tips[tipIndex]}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {messages.map((_, i) => (
          <div key={i} style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: i <= messageIndex ? 'var(--primary)' : 'var(--border)',
            transition: 'background 0.3s ease'
          }} />
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
