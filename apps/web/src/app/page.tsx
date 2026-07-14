"use client";
import React, { useState } from 'react';
import { ViewKey, Party, Toast } from '@/types';
import { Logo, IconLogOut } from '@/components/ui/Icons';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ProcessRail } from '@/components/ui/ProcessRail';
import { LandingView } from '@/features/landing/LandingView';
import { LoginView } from '@/features/auth/LoginView';
import { UploadView } from '@/features/upload/UploadView';
import { AnalyzingView } from '@/features/analysis/AnalyzingView';
import { ChecklistView } from '@/features/checklist/ChecklistView';
import { ClientPortalView } from '@/features/portal/ClientPortalView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewKey>('landing');
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [partiesData, setPartiesData] = useState<Party[]>([]);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  const handleLogin = (email: string) => {
    setUser({ email, name: email.split('@')[0] });
    setCurrentView('upload');
    addToast('Acesso autorizado', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setPartiesData([]);
  };

  const handleUploadStart = async (file: File) => {
    setOriginalFile(file);
    setIsAnalyzing(true);
    setCurrentView('analyzing');
    addToast('Processando documento com IA…');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'original');

    try {
      const upRes = await fetch('/api/forms/upload', {
        method: 'POST',
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.detail || 'Erro no upload original');
      
      setFormId(upData.formId);

      const analyzeData = new FormData();
      analyzeData.append('file', file);
      const res = await fetch('/api/forms/analyze', {
        method: 'POST',
        body: analyzeData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro na análise da IA');
      
      if (!data.parties || data.parties.length === 0) {
        throw new Error('A IA não conseguiu identificar exigências neste documento. Verifique se o PDF contém texto legível.');
      }
      
      setPartiesData(data.parties);
    } catch (error: any) {
      addToast(error.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisComplete = () => {
    setCurrentView('checklist');
    addToast('Matriz de due diligence gerada', 'success');
  };

  const showHeader = user && currentView !== 'login' && currentView !== 'landing';
  const showRail   = currentView === 'upload' || currentView === 'analyzing' || currentView === 'checklist';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
      {/* Header */}
      {showHeader && (
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          height: 56,
          background: 'rgba(10,10,11,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Logo */}
          <button onClick={() => setCurrentView('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Logo size={24} />
            <span style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 400, color: 'var(--parchment)', letterSpacing: '-0.01em' }}>
              Forms<span style={{ color: 'var(--forest)', fontWeight: 500 }}>AI</span>
            </span>
          </button>

          {/* Rail central */}
          {showRail && <ProcessRail current={currentView} />}

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="font-mono-doc" style={{ fontSize: 11, color: 'var(--dust-2)', letterSpacing: '0.06em' }}>
              {user.name.toUpperCase()}
            </span>
            <button onClick={handleLogout} title="Sair" aria-label="Sair da conta" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)', padding: '6px 10px',
              color: 'var(--dust-2)', cursor: 'pointer', fontSize: 11, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--parchment)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dust-2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)'; }}
            >
              <IconLogOut size={13} />
            </button>
          </div>
        </header>
      )}

      {/* Views */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'landing'   && <LandingView   onGetStarted={() => setCurrentView('login')} />}
        {currentView === 'login'     && <LoginView     onLogin={handleLogin} onBack={() => setCurrentView('landing')} />}
        {currentView === 'upload'    && <UploadView    onUpload={handleUploadStart} />}
        {currentView === 'analyzing' && <AnalyzingView onComplete={handleAnalysisComplete} isAnalyzing={isAnalyzing} />}
        {currentView === 'checklist' && (
          <ChecklistView
            parties={partiesData}
            setParties={setPartiesData}
            formId={formId}
            addToast={addToast}
            originalFile={originalFile}
            onOpenClientPortal={() => setCurrentView('clientPortal')}
          />
        )}
        {currentView === 'clientPortal' && (
          <ClientPortalView 
            parties={partiesData} 
            setParties={setPartiesData}
            addToast={addToast}
            onBack={() => setCurrentView('checklist')}
            formId={formId}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
