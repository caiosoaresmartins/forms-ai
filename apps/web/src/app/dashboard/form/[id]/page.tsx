"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChecklistView } from '@/features/checklist/ChecklistView';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { Party } from '@/types';
import { Logo } from '@/components/ui/Icons';
import Link from 'next/link';

export default function FormDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (message: string, type = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  useEffect(() => {
    if (formId) fetchFormDetails();
  }, [formId]);

  const fetchFormDetails = async () => {
    setLoading(true);
    try {
      // Para simular caso a tabela documentos não exista ainda,
      // usaremos um mock ou tentaremos buscar.
      const { data: docsData, error: docsError } = await supabase
        .from('documentos')
        .select('*')
        .eq('form_id', formId);

      if (docsError) {
        throw docsError;
      }

      if (docsData && docsData.length > 0) {
        // Agrupar por party_name e role
        const partiesMap = new Map<string, Party>();
        
        docsData.forEach((doc) => {
          const key = `${doc.party_name}|${doc.role}`;
          if (!partiesMap.has(key)) {
            partiesMap.set(key, {
              id: `party-${key}`,
              partyName: doc.party_name,
              role: doc.role,
              documents: []
            });
          }
          partiesMap.get(key)!.documents.push({
            id: doc.id,
            name: doc.name,
            status: doc.status as any,
            reason: doc.reason
          });
        });

        setParties(Array.from(partiesMap.values()));
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPortal = () => {
    const portalUrl = `${window.location.origin}/portal/${formId}`;
    navigator.clipboard.writeText(portalUrl);
    addToast('Link do portal copiado para a área de transferência!', 'success');
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
            <span style={{ color: 'var(--dust)', fontWeight: 300 }}> / </span>
            <Link href="/dashboard" style={{ color: 'var(--dust-2)', textDecoration: 'none' }}>Dashboard</Link>
          </span>
        </div>
        
        <button onClick={() => router.push('/dashboard')} style={{
          background: 'none', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius)', padding: '6px 12px',
          color: 'var(--dust-2)', cursor: 'pointer', fontSize: 11,
        }}>
          Voltar
        </button>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--dust)' }}>
            <span className="spin" style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--border-3)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
          </div>
        ) : parties.length > 0 ? (
          <ChecklistView 
            parties={parties} 
            setParties={setParties} 
            formId={formId} 
            addToast={addToast}
            originalFile={null} // Não temos o arquivo aqui ainda, seria necessário baixar do Supabase Storage se quiséssemos
            onOpenClientPortal={handleOpenPortal}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--dust-2)' }}>
            <p>Nenhuma exigência encontrada ou banco de dados indisponível.</p>
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
