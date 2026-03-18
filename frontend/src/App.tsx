import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { repoService } from './services/api';

const App: React.FC = () => {
  const [analyzedRepo, setAnalyzedRepo] = useState<string | null>(null);
  const [complexityData, setComplexityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await repoService.analyzeRepo(url);
      setComplexityData(response.data.complexity || response.data.data?.complexity);
      setAnalyzedRepo(url);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze repository. Please check the URL and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--danger)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: '12px', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {!analyzedRepo ? (
        <LandingPage onAnalyze={handleAnalyze} isLoading={isLoading} />
      ) : (
        <Dashboard repoUrl={analyzedRepo} complexityData={complexityData} />
      )}
    </div>
  );
};

export default App;
