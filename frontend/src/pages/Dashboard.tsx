import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { repoService } from '../services/api';

interface DashboardProps {
  repoUrl: string;
  complexityData?: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Dashboard: React.FC<DashboardProps> = ({ repoUrl, complexityData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [showBreakup, setShowBreakup] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAction = async (action: string, label: string) => {
    setActiveAnalysis(label);
    try {
      let response;
      if (action === 'tech') response = await repoService.getTechSummary(repoUrl);
      else if (action === 'business') response = await repoService.getNonTechSummary(repoUrl);
      else if (action === 'arch') response = await repoService.getArchitecture(repoUrl);
      else if (action === 'design') response = await repoService.getSystemDesign(repoUrl);
      else if (action === 'security') response = await repoService.getSecurityScan(repoUrl);
      else if (action === 'code') response = await repoService.getCodeAnalysis(repoUrl);
      
      const content = response?.data.summary || response?.data.architecture || response?.data.system_design || response?.data.security_scan || response?.data.code_analysis;
      setMessages(prev => [...prev, { role: 'assistant', content: `### ${label}\n\n${content}` }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to generate analysis.' }]);
    } finally {
      setActiveAnalysis(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return '#10b981'; // Green
    if (score < 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);

    try {
      const response = await repoService.chat(repoUrl, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Failed to get response.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--border)' }}>
      {/* Sidebar */}
      <div style={{ background: 'var(--bg-dark)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100vh', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="gradient-text">RepoMind</h2>
            {complexityData && (
                <div 
                    onClick={() => setShowBreakup(!showBreakup)}
                    style={{ 
                        position: 'relative',
                        width: '50px', 
                        height: '50px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                    title="Click to see complexity breakup"
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg width="50" height="50" style={{ position: 'absolute', top: 0, left: 0 }}>
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke="var(--border)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="25"
                            cy="25"
                            r="20"
                            fill="none"
                            stroke={getScoreColor(complexityData?.final_score || 0)}
                            strokeWidth="4"
                            strokeDasharray={`${((complexityData?.final_score || 0) / 100) * 125.6} 125.6`}
                            strokeLinecap="round"
                            transform="rotate(-90 25 25)"
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    </svg>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{complexityData?.final_score || 0}</span>
                </div>
            )}
        </div>

        {showBreakup && complexityData && complexityData.details && (
            <div className="animate-fade-in" style={{ 
                background: 'var(--bg-card)', 
                padding: '16px', 
                borderRadius: '12px', 
                fontSize: '0.8rem',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
                <h4 style={{ margin: 0, color: 'var(--accent)', fontSize: '0.9rem' }}>Technical Health Check</h4>
                {Object.entries(complexityData.details).map(([key, value]: [string, any]) => {
                    const normalizedValue = value || 0;
                    return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                                <span style={{ color: getScoreColor(100 - normalizedValue), fontWeight: '600' }}>{normalizedValue}/100</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${normalizedValue}%`, height: '100%', background: getScoreColor(100 - normalizedValue) }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', wordBreak: 'break-all', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px' }}>
          {repoUrl}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={() => handleAction('tech', 'Technical Summary')} className="glass-morphism" style={{ padding: '12px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Technical Summary' ? 'Generating...' : '🛠️ Tech Summary'}
          </button>
          <button onClick={() => handleAction('business', 'Business Summary')} className="glass-morphism" style={{ padding: '12px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Business Summary' ? 'Generating...' : '💼 Business Summary'}
          </button>
          <button onClick={() => handleAction('arch', 'Architecture')} className="glass-morphism" style={{ padding: '12px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Architecture' ? 'Generating...' : '🏗️ Architecture'}
          </button>
          <button onClick={() => handleAction('design', 'System Design')} className="glass-morphism" style={{ padding: '12px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'System Design' ? 'Generating...' : '📐 System Design'}
          </button>
          <button onClick={() => handleAction('security', 'Security Scan')} className="glass-morphism" style={{ padding: '12px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Security Scan' ? 'Scanning...' : '🛡️ Security Scan'}
          </button>
          <button onClick={() => handleAction('code', 'Code Quality')} className="glass-morphism" style={{ padding: '12px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Code Quality' ? 'Analyzing...' : '💎 Code Quality'}
          </button>
        </div>
        
        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <button 
                onClick={() => window.location.reload()} 
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', width: '100%' }}
            >
                Change Repository
            </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {messages.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Start a chat or select an analysis tool on the left.
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ 
                marginBottom: '24px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div className={msg.role === 'assistant' ? 'glass-morphism' : ''} style={{ 
                  padding: '16px 20px', 
                  borderRadius: '16px', 
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                  color: 'white'
                }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Ask anything about the codebase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isChatting}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'white',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isChatting || !input.trim()}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0 24px',
                borderRadius: '12px',
                fontWeight: '600'
              }}
            >
              {isChatting ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
