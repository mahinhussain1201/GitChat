import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { repoService } from '../services/api';

interface DashboardProps {
  repoUrl: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Dashboard: React.FC<DashboardProps> = ({ repoUrl }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
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
        <h2 className="gradient-text">RepoMind</h2>
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
