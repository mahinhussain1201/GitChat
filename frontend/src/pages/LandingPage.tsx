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
    <div className="landing-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <div className="bg-mesh" />
      
      <div className="animate-fade-in" style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ 
            background: 'var(--primary-glow)', 
            color: 'var(--primary)', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            display: 'inline-block'
          }}>
            AI-Powered Code Intelligence
          </span>
          <h1 style={{ 
            fontSize: isMobile ? '3.5rem' : '5.5rem', 
            margin: '0.5rem 0 1rem 0', 
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1
          }} className="gradient-text">
            RepoMind
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: isMobile ? '1.1rem' : '1.5rem', 
            marginBottom: '3rem', 
            fontWeight: 400,
            lineHeight: 1.5
          }}>
            The intelligence layer for your repository.<br/>
            Decode architecture, audit security, and chat with code instantly.
          </p>
        </div>
        
        {!isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <form onSubmit={handleSubmit} className="glass-morphism" style={{
              width: '100%',
              maxWidth: '650px',
              padding: '10px',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '10px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <input
                type="text"
                placeholder="Paste a GitHub repository URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '16px 20px',
                  fontSize: '1.1rem',
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
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: !url.trim() ? 0.5 : 1
                }}
              >
                Analyze Repo
              </button>
            </form>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '12px',
              opacity: 0.8 
            }}>
              {['Analyze clerk-js', 'Scan irc_mailer for flaws', 'Explain langgraph structure'].map((tip) => (
                <button 
                  key={tip}
                  onClick={() => setUrl(`https://github.com/${tip === 'Analyze clerk-js' ? 'clerkinc/clerk-js' : tip.includes('irc') ? 'mahinhussain1201/irc_mailer' : 'langchain-ai/langgraph'}`)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <LoadingState isMobile={isMobile} />
        )}
      </div>

      {!isLoading && (
        <div style={{ 
          marginTop: '6rem', 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '24px',
          width: '100%',
          maxWidth: '900px',
          padding: '0 20px'
        }}>
          {[
            { label: 'Token Chunks', value: '800+', desc: 'Context-aware indexing' },
            { label: 'Reasoning Engine', value: 'Llama 3.1', desc: 'Deep logic analysis' },
            { label: 'Vector Engine', value: 'ChromaDB', desc: 'Fast semantic retrieval' }
          ].map((stat) => (
            <div key={stat.label} className="glass-morphism stat-card" style={{ 
              padding: '32px 24px',
              borderRadius: '24px',
              textAlign: 'center',
              transition: 'transform 0.3s ease, background 0.3s ease',
              cursor: 'default'
            }}>
              <h3 style={{ fontSize: '2rem', color: 'white', fontWeight: 800, marginBottom: '4px' }}>{stat.value}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{stat.label}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.desc}</p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .stat-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
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
