"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo, IconLogOut, IconFile, IconCheck } from '@/components/ui/Icons';
import { supabase } from '@/lib/supabase';
import { UploadView } from '@/features/upload/UploadView';

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setForms(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    router.push('/');
  };

  const handleUploadStart = async (file: File) => {
    // Para simplificar: redirecionar para a página principal que fará o upload, 
    // ou redirecionar para uma rota /dashboard/new
    // Na arquitetura atual, vamos voltar para o app/page.tsx passando state 
    // Ou melhor: podemos apenas redirecionar para /dashboard/new
    router.push('/dashboard/new');
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
            Forms<span style={{ color: 'var(--forest)', fontWeight: 500 }}>AI</span> <span style={{ color: 'var(--dust)', fontWeight: 300 }}>/ Dashboard</span>
          </span>
        </div>
        <button onClick={handleLogout} title="Sair" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '6px 10px',
          color: 'var(--dust-2)', cursor: 'pointer', fontSize: 11,
        }}>
          <IconLogOut size={13} /> Sair
        </button>
      </header>

      <main style={{ flex: 1, padding: '48px 32px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <h1 className="display-heading" style={{ fontSize: 28, color: 'var(--parchment)' }}>Meus Formulários</h1>
            <p style={{ fontSize: 14, color: 'var(--dust-2)', marginTop: 4 }}>Histórico de due diligence e status de clientes</p>
          </div>
          <Link href="/dashboard/new" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
              + Nova Análise
            </button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--dust)' }}>
            <span className="spin" style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--border-3)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
          </div>
        ) : forms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--ink-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--dust-2)', fontSize: 14, marginBottom: 16 }}>Nenhum formulário analisado ainda.</p>
            <Link href="/dashboard/new" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary">Fazer primeiro upload</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {forms.map(form => (
              <Link href={`/dashboard/form/${form.id}`} key={form.id} style={{ textDecoration: 'none' }}>
                <div className="card-doc" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ color: 'var(--forest)' }}><IconFile size={20} /></div>
                    <div>
                      <p style={{ fontSize: 14, color: 'var(--parchment)', fontWeight: 400 }}>{form.nome_do_cliente}</p>
                      <p className="font-mono-doc" style={{ fontSize: 11, color: 'var(--dust)', marginTop: 4 }}>{new Date(form.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ 
                      fontSize: 11, padding: '4px 10px', borderRadius: 2,
                      background: form.status === 'concluido' ? 'rgba(26,107,85,0.1)' : 'var(--ink-3)',
                      color: form.status === 'concluido' ? 'var(--forest)' : 'var(--dust-2)',
                      border: `1px solid ${form.status === 'concluido' ? 'var(--forest)' : 'var(--border-2)'}`
                    }}>
                      {form.status.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--dust)' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
