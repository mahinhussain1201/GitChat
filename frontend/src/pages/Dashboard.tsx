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
  const [showHealthBreakup, setShowHealthBreakup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
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
    const placeholderMsg = `### ${label}\n\nGenerating intelligence...`;
    setMessages(prev => [...prev, { role: 'assistant', content: placeholderMsg }]);
    
    try {
      let response;
      if (action === 'tech') response = await repoService.getTechSummary(repoUrl);
      else if (action === 'business') response = await repoService.getNonTechSummary(repoUrl);
      else if (action === 'arch') response = await repoService.getArchitecture(repoUrl);
      else if (action === 'design') response = await repoService.getSystemDesign(repoUrl);
      else if (action === 'security') response = await repoService.getSecurityScan(repoUrl);
      else if (action === 'code') response = await repoService.getCodeAnalysis(repoUrl);
      else if (action === 'complexity-analysis') response = await repoService.getComplexityAnalysis(repoUrl);
      
      const content = response?.data.summary || response?.data.architecture || response?.data.system_design || response?.data.security_scan || response?.data.code_analysis || response?.data.complexity_analysis || response?.data.response;
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = `### ${label}\n\n${content}`;
        return newMessages;
      });
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = `❌ Failed to generate ${label}. Please try again.`;
        return newMessages;
      });
    } finally {
      setActiveAnalysis(null);
    }
  };

  const getScoreColor = (score: number) => {
    const hue = Math.min(120, Math.max(0, score * 1.2));
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatting(true);

    // Placeholder for assistant message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, message: userMsg })
      });

      if (!response.ok) throw new Error('Stream request failed');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          assistantResponse += chunk;
          
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: assistantResponse }];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-dark)', position: 'relative' }}>
      <div className="bg-mesh" />

      {/* Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <div className="glass-morphism" style={{ 
        width: 'var(--sidebar-width)',
        display: 'flex', 
        flexDirection: 'column',
        position: isMobile ? 'absolute' : 'relative',
        left: isMobile && !isSidebarOpen ? `calc(-1 * var(--sidebar-width))` : '0',
        height: '100%',
        zIndex: 50,
        transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRight: '1px solid var(--border)'
      }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>RepoMind</h1>
            {isMobile && <button onClick={() => setIsSidebarOpen(false)} style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '1.2rem' }}>✕</button>}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {repoUrl.split('/').pop()}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Complexity Card */}
          <div 
            className="glass-morphism"
            onClick={() => setShowHealthBreakup(!showHealthBreakup)}
            style={{
              padding: '20px',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'all 0.2s ease',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    stroke={getScoreColor(complexityData?.final_score || 0)} 
                    strokeWidth="3"
                    strokeDasharray={`${(complexityData?.final_score || 0)}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                  {complexityData?.final_score || 0}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '2px' }}>Repo Health</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click for details</p>
              </div>
            </div>

            {showHealthBreakup && (
               <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {[
                   { 
                     label: 'Logic Flow', 
                     value: complexityData?.metrics?.avg_cyclomatic ? Math.max(0, Math.min(100, 110 - (complexityData.metrics.avg_cyclomatic * 10))) : 0,
                     display: `${Math.round(Math.max(0, Math.min(100, 110 - (complexityData.metrics.avg_cyclomatic * 10))))}%`
                   },
                   { 
                     label: 'Structural', 
                     value: complexityData?.metrics?.maintainability || 0,
                     display: `${complexityData?.metrics?.maintainability || 0}%`
                   },
                   { 
                     label: 'Density', 
                     value: complexityData?.metrics?.avg_loc ? Math.max(0, Math.min(100, 110 - (complexityData.metrics.avg_loc / 5))) : 0,
                     display: `${Math.round(Math.max(0, Math.min(100, 110 - (complexityData.metrics.avg_loc / 5))))}%`
                   }
                 ].map(item => (
                   <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span>{item.label}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{item.display}</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                        <div style={{ width: `${item.value || 0}%`, height: '100%', background: getScoreColor(item.value || 0), borderRadius: '2px' }} />
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>Analysis Tools</p>
            {[
              { id: 'tech', label: 'Technical Summary', icon: '📝' },
              { id: 'arch', label: 'Architecture Review', icon: '🏢' },
              { id: 'security', label: 'Security Scan', icon: '🛡️' },
              { id: 'code', label: 'Code Analysis', icon: '🔍' },
              { id: 'complexity-analysis', label: 'In-Depth Complexity', icon: '📊' }
            ].map(tool => {
              const isActive = activeAnalysis === tool.label;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleAction(tool.id, tool.label)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: activeAnalysis && !isActive ? 0.5 : 1
                  }}
                  className="sidebar-tool-btn"
                >
                  <span style={{ fontSize: '1.1rem', filter: isActive ? 'none' : 'grayscale(100%)' }}>{tool.icon}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              Analyze New Repo
            </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Mobile Header */}
        {isMobile && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '1.5rem' }}>☰</button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>RepoMind</h3>
          </div>
        )}

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: isMobile ? '24px 16px 140px' : '60px 20px 160px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{ width: '100%', maxWidth: 'var(--chat-max-width)', display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '8vh' }} className="animate-fade-in">
                 <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    How can I help you?
                 </h2>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '4rem', fontWeight: 400 }}>
                    Deep-dive into architecture, security, or data flow.
                 </p>
                 
                 {/* Heatmap Visualization */}
                 {complexityData?.heatmap && (
                   <div className="glass-morphism" style={{ 
                     marginBottom: '4rem', 
                     padding: '32px', 
                     borderRadius: '32px',
                     textAlign: 'left',
                     background: 'rgba(255,255,255,0.02)'
                   }}>
                     <h4 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span>📊</span> Repository Heatmap
                     </h4>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {complexityData.heatmap.map((item: any, i: number) => (
                           <div 
                             key={i} 
                             title={`${item.file}: Score ${item.score} (${item.risk})`}
                             style={{ 
                               width: '12px', 
                               height: '12px', 
                               borderRadius: '3px', 
                               background: item.risk === 'High' ? 'var(--danger)' : item.risk === 'Moderate' ? '#fbbf24' : '#10b981',
                               opacity: 0.5 + (item.score / 200),
                               cursor: 'pointer',
                               transition: 'all 0.2s ease'
                             }}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.transform = 'scale(1.5)';
                               e.currentTarget.style.zIndex = '10';
                               e.currentTarget.style.boxShadow = '0 0 10px rgba(255,255,255,0.3)';
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.transform = 'scale(1)';
                               e.currentTarget.style.zIndex = '1';
                               e.currentTarget.style.boxShadow = 'none';
                             }}
                            />
                        ))}
                     </div>
                     <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                       Hover over blocks to see file risk levels. Red indicates high complexity / maintenance risk.
                     </p>
                   </div>
                 )}

                 <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                    {[
                      { icon: '🗺️', text: 'Explain the high-level architecture', action: 'arch' },
                      { icon: '🔒', text: 'Analyze potential security vulnerabilities', action: 'security' },
                      { icon: '🔄', text: 'How does the data flow between services?', q: 'How does the data flow between services?' },
                      { icon: '💎', text: 'Identify technical debt and code smells', q: 'Identify technical debt and code smells' }
                    ].map(card => (
                      <button 
                        key={card.text}
                        onClick={() => { 
                            if (card.action) handleAction(card.action, card.text);
                            else { setInput(card.q || card.text); }
                        }}
                        className="suggestion-card"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          padding: '24px',
                          borderRadius: '24px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.05)', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>{card.icon}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 500, color: '#e2e8f0' }}>{card.text}</span>
                      </button>
                    ))}
                 </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
                className="animate-fade-in"
              >
                <div style={{ 
                  maxWidth: msg.role === 'user' ? '80%' : '100%',
                  padding: msg.role === 'user' ? '14px 24px' : '0',
                  borderRadius: '24px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                  color: 'white',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  boxShadow: msg.role === 'user' ? '0 10px 30px rgba(79, 70, 229, 0.3)' : 'none'
                }}>
                  {msg.role === 'assistant' && (
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div className="pulse-brain" style={{ 
                        width: '36px', 
                        height: '36px', 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid var(--border)',
                        fontSize: '1.2rem'
                      }}>
                        🧠
                      </div>
                      <div style={{ flex: 1, color: '#f1f5f9' }} className="prose">
                        {msg.content === '' && isChatting ? (
                          <div style={{ display: 'flex', gap: '6px', paddingTop: '12px' }}>
                             <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animationDelay: '0s' }} />
                             <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animationDelay: '0.2s' }} />
                             <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animationDelay: '0.4s' }} />
                          </div>
                        ) : (
                          <ReactMarkdown
                            components={{
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return (
                                  <div style={{ position: 'relative', margin: '2rem 0' }}>
                                    <div style={{ 
                                      background: '#0b0f1a', 
                                      padding: '1.5rem', 
                                      borderRadius: '16px', 
                                      overflowX: 'auto',
                                      fontSize: '0.9rem',
                                      border: '1px solid rgba(255,255,255,0.06)',
                                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                    }}>
                                      <code className={className} {...props} style={{ background: 'transparent', padding: 0 }}>
                                        {children}
                                      </code>
                                    </div>
                                    {match && (
                                       <div style={{ position: 'absolute', top: '-12px', right: '16px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                                         {match[1]}
                                       </div>
                                    )}
                                  </div>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  )}
                  {msg.role === 'user' && msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: isMobile ? '20px' : '40px',
          background: 'linear-gradient(to top, var(--bg-dark) 40%, transparent)',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 20
        }}>
          <form 
            onSubmit={handleSend} 
            className="glass-morphism input-container"
            style={{ 
              width: '100%', 
              maxWidth: 'var(--chat-max-width)', 
              borderRadius: '24px', 
              padding: '10px', 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '10px',
              pointerEvents: 'auto',
              background: 'rgba(23, 28, 45, 0.7)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <textarea
              placeholder="Ask RepoMind anything about this codebase..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              disabled={isChatting}
              rows={1}
              style={{
                flex: 1,
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                outline: 'none',
                fontSize: '1.05rem',
                resize: 'none',
                maxHeight: '200px',
                lineHeight: 1.5
              }}
              onFocus={(e) => {
                  const parent = e.target.closest('.input-container') as HTMLElement;
                  if (parent) {
                      parent.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                      parent.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.15), var(--premium-shadow)';
                  }
              }}
              onBlur={(e) => {
                  const parent = e.target.closest('.input-container') as HTMLElement;
                  if (parent) {
                      parent.style.borderColor = 'rgba(255,255,255,0.1)';
                      parent.style.boxShadow = 'var(--premium-shadow)';
                  }
              }}
            />
            <button
              type="submit"
              disabled={isChatting || !input.trim()}
              className="send-btn"
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {isChatting ? (
                  <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : '→'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .sidebar-tool-btn:hover {
          background: rgba(255,255,255,0.06) !important;
          color: white !important;
          transform: translateX(4px);
        }
        .suggestion-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(99, 102, 241, 0.3) !important;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          background: var(--primary-hover);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }
        .send-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        @keyframes typing-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          animation: typing-dot 1s ease-in-out infinite;
        }
        pre {
          background: transparent !important;
          margin: 0 !important;
        }
        blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 1.25rem;
          margin: 1.5rem 0;
          color: var(--text-secondary);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
