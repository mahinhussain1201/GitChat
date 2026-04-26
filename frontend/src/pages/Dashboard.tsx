import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import MobileHeader from '../components/layout/MobileHeader';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import EmptyState from '../components/chat/EmptyState';
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
  const [messages, setMessages]             = useState<Message[]>([]);
  const [input, setInput]                   = useState('');
  const [isChatting, setIsChatting]         = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [showHealth, setShowHealth]         = useState(false);
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 1024);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAction = async (action: string, label: string) => {
    setActiveAnalysis(label);
    setMessages(prev => [...prev, { role: 'assistant', content: `### ${label}\n\nAnalyzing…` }]);
    try {
      let response: any;
      if      (action === 'tech')                 response = await repoService.getTechSummary(repoUrl);
      else if (action === 'business')             response = await repoService.getNonTechSummary(repoUrl);
      else if (action === 'arch')                 response = await repoService.getArchitecture(repoUrl);
      else if (action === 'design')               response = await repoService.getSystemDesign(repoUrl);
      else if (action === 'security')             response = await repoService.getSecurityScan(repoUrl);
      else if (action === 'code')                 response = await repoService.getCodeAnalysis(repoUrl);
      else if (action === 'complexity-analysis')  response = await repoService.getComplexityAnalysis(repoUrl);

      const content =
        response?.data.summary       ||
        response?.data.architecture  ||
        response?.data.system_design ||
        response?.data.security_scan ||
        response?.data.code_analysis ||
        response?.data.complexity_analysis ||
        response?.data.response ||
        'No data returned.';

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1].content = `### ${label}\n\n${content}`;
        return next;
      });
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1].content = `Failed to generate **${label}**. Please try again.`;
        return next;
      });
    } finally {
      setActiveAnalysis(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '' }]);
    setIsChatting(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, message: userMsg }),
      });
      if (!response.ok) throw new Error();

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value);
          setMessages(prev => {
            const next = [...prev];
            if (next[next.length - 1].role === 'assistant') {
              next[next.length - 1] = { role: 'assistant', content: accumulated };
            }
            return next;
          });
        }
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <div className="bg-mesh" />

      <Sidebar
        repoUrl={repoUrl}
        complexityData={complexityData}
        activeAnalysis={activeAnalysis}
        showHealthBreakup={showHealth}
        onToggleHealth={() => setShowHealth(v => !v)}
        onAction={handleAction}
        onNewRepo={() => window.location.reload()}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        {isMobile && <MobileHeader onMenuOpen={() => setIsSidebarOpen(true)} />}

        {/* Scroll area */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: isMobile
            ? 'var(--space-6) var(--space-4) 160px'
            : 'var(--space-10) var(--space-8) 160px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ width: '100%', maxWidth: 'var(--chat-max-width)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {messages.length === 0 ? (
              <EmptyState
                repoUrl={repoUrl}
                isMobile={isMobile}
                complexityData={complexityData}
                onAction={handleAction}
                onSetInput={setInput}
              />
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isChatting && idx === messages.length - 1}
                />
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          isDisabled={isChatting}
        />
      </main>
    </div>
  );
};

export default Dashboard;
