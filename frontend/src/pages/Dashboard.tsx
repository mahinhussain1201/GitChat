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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="dashboard-container" style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      background: 'var(--border)',
      position: 'relative'
    }}>
      {/* Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{ 
        background: 'var(--bg-dark)', 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px', 
        height: '100vh', 
        overflowY: 'auto', 
        borderRight: '1px solid var(--border)',
        width: isMobile ? '280px' : '300px',
        position: isMobile ? 'absolute' : 'relative',
        left: isMobile && !isSidebarOpen ? '-280px' : '0',
        zIndex: 50,
        transition: 'left 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="gradient-text">RepoMind</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {complexityData && (
                    <div 
                        onClick={() => setShowBreakup(!showBreakup)}
                        style={{ 
                            position: 'relative',
                            width: '40px', 
                            height: '40px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <svg width="40" height="40" style={{ position: 'absolute', top: 0, left: 0 }}>
                            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                            <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke={getScoreColor(complexityData?.final_score || 0)}
                                strokeWidth="3"
                                strokeDasharray={`${((complexityData?.final_score || 0) / 100) * 100.5} 100.5`}
                                strokeLinecap="round"
                                transform="rotate(-90 20 20)"
                            />
                        </svg>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{complexityData?.final_score || 0}</span>
                    </div>
                )}
                {isMobile && (
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem' }}
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>

        {showBreakup && complexityData && complexityData.details && (
            <div className="animate-fade-in" style={{ 
                background: 'var(--bg-card)', 
                padding: '16px', 
                borderRadius: '12px', 
                fontSize: '0.75rem',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                <h4 style={{ margin: 0, color: 'var(--accent)', fontSize: '0.8rem' }}>Health Check</h4>
                {Object.entries(complexityData.details).map(([key, value]: [string, any]) => {
                    const normalizedValue = value || 0;
                    return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                                <span style={{ color: getScoreColor(100 - normalizedValue), fontWeight: '600' }}>{normalizedValue}/100</span>
                            </div>
                            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ width: `${normalizedValue}%`, height: '100%', background: getScoreColor(100 - normalizedValue) }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', wordBreak: 'break-all', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
          {repoUrl}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => { handleAction('tech', 'Technical Summary'); if(isMobile) setIsSidebarOpen(false); }} className="glass-morphism" style={{ padding: '10px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Technical Summary' ? 'Generating...' : '🛠️ Tech Summary'}
          </button>
          <button onClick={() => { handleAction('business', 'Business Summary'); if(isMobile) setIsSidebarOpen(false); }} className="glass-morphism" style={{ padding: '10px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Business Summary' ? 'Generating...' : '💼 Business Summary'}
          </button>
          <button onClick={() => { handleAction('arch', 'Architecture'); if(isMobile) setIsSidebarOpen(false); }} className="glass-morphism" style={{ padding: '10px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Architecture' ? 'Generating...' : '🏗️ Architecture'}
          </button>
          <button onClick={() => { handleAction('design', 'System Design'); if(isMobile) setIsSidebarOpen(false); }} className="glass-morphism" style={{ padding: '10px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'System Design' ? 'Generating...' : '📐 System Design'}
          </button>
          <button onClick={() => { handleAction('security', 'Security Scan'); if(isMobile) setIsSidebarOpen(false); }} className="glass-morphism" style={{ padding: '10px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Security Scan' ? 'Scanning...' : '🛡️ Security Scan'}
          </button>
          <button onClick={() => { handleAction('code', 'Code Quality'); if(isMobile) setIsSidebarOpen(false); }} className="glass-morphism" style={{ padding: '10px', borderRadius: '8px', color: 'white', textAlign: 'left' }}>
            {activeAnalysis === 'Code Quality' ? 'Analyzing...' : '💎 Code Quality'}
          </button>
        </div>
        
        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <button 
                onClick={() => window.location.reload()} 
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }}
            >
                Change Repository
            </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', flex: 1 }}>
        {/* Mobile Header */}
        {isMobile && (
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}
                >
                    ☰
                </button>
                <h3 className="gradient-text" style={{ fontSize: '1.1rem' }}>RepoMind</h3>
            </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px' }}>
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
        <div style={{ padding: isMobile ? '16px' : '24px', borderTop: '1px solid var(--border)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: isMobile ? '8px' : '12px' }}>
            <input
              type="text"
              placeholder="Ask about the codebase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isChatting}
              style={{
                flex: 1,
                padding: isMobile ? '12px 14px' : '16px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'white',
                outline: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            />
            <button
              type="submit"
              disabled={isChatting || !input.trim()}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: isMobile ? '0 16px' : '0 24px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
            >
              {isChatting ? '...' : (isMobile ? '→' : 'Send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
