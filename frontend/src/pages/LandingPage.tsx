import React, { useState, useEffect } from 'react';
import UrlForm from '../components/landing/UrlForm';
import LoadingState from '../components/landing/LoadingState';
import StatCards from '../components/landing/StatCards';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, isLoading }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: isMobile ? 'var(--space-8) var(--space-5)' : 'var(--space-12) var(--space-6)',
      gap: 'var(--space-12)',
      position: 'relative',
      overflowY: 'auto',
    }}>
      <div className="bg-mesh" />

      {/* Hero */}
      <div
        className="animate-in"
        style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)' }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h1
            className="gradient-text"
            style={{
              fontSize: isMobile ? 'var(--text-4xl)' : 'var(--text-5xl)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
            }}
          >
            RepoMind
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-base)',
            maxWidth: '440px',
            lineHeight: 1.7,
          }}>
            Understand any repository instantly. Explore architecture,
            audit security, and chat with code through natural language.
          </p>
        </div>

        {/* Input or loading */}
        {isLoading ? (
          <LoadingState isMobile={isMobile} />
        ) : (
          <UrlForm onAnalyze={onAnalyze} isMobile={isMobile} />
        )}
      </div>

      {/* Stats */}
      {!isLoading && <StatCards />}
    </div>
  );
};

export default LandingPage;
