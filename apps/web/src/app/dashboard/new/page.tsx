"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo, IconLogOut } from '@/components/ui/Icons';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { UploadView } from '@/features/upload/UploadView';
import { AnalyzingView } from '@/features/analysis/AnalyzingView';
import { ProcessRail } from '@/components/ui/ProcessRail';

export default function NewAnalysisPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'upload' | 'analyzing'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [formId, setFormId] = useState<string | null>(null);

  const addToast = (message: string, type = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  const handleUploadStart = async (file: File) => {
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
      
      const newFormId = upData.formId;
      setFormId(newFormId);

      const analyzeData = new FormData();
      analyzeData.append('file', file);
      analyzeData.append('formId', newFormId); // Passando formId para a IA persistir os itens

      const res = await fetch('/api/forms/analyze', {
        method: 'POST',
        body: analyzeData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro na análise da IA');
      
      if (!data.parties || data.parties.length === 0) {
        throw new Error('A IA não conseguiu identificar exigências neste documento.');
      }
      
      // Terminando análise, vamos redirecionar!
      setIsAnalyzing(false);
    } catch (error: any) {
      addToast(error.message, 'error');
      setIsAnalyzing(false);
      setCurrentView('upload');
    }
  };

  const handleAnalysisComplete = () => {
    if (formId) {
      router.push(`/dashboard/form/${formId}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
        background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={24} />
          <span style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 400, color: 'var(--parchment)' }}>
            Forms<span style={{ color: 'var(--forest)', fontWeight: 500 }}>AI</span>
          </span>
        </div>
        
        <ProcessRail current={currentView} />

        <button onClick={() => router.push('/dashboard')} style={{
          background: 'none', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '6px 12px',
          color: 'var(--dust-2)', cursor: 'pointer', fontSize: 11,
        }}>
          Cancelar
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'upload' && <UploadView onUpload={handleUploadStart} />}
        {currentView === 'analyzing' && <AnalyzingView onComplete={handleAnalysisComplete} isAnalyzing={isAnalyzing} />}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
