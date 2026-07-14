"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ClientPortalView } from '@/features/portal/ClientPortalView';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { Party } from '@/types';

export default function PublicPortalPage() {
  const params = useParams();
  const formId = params.id as string;

  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);
  const [isDone, setIsDone] = useState(false);

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
      const { data: docsData, error: docsError } = await supabase
        .from('documentos')
        .select('*')
        .eq('form_id', formId);

      if (docsError) throw docsError;

      if (docsData && docsData.length > 0) {
        // Agrupar por party_name e role
        const partiesMap = new Map<string, Party>();
        let allUploaded = true;
        
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
          
          if (doc.status !== 'uploaded') {
            allUploaded = false;
          }
        });

        setParties(Array.from(partiesMap.values()));
        setIsDone(allUploaded);
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Erro ao carregar os documentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (docId: string, file: File) => {
    // Na fase real faríamos o upload para o Storage e atualizaríamos o DB.
    // Aqui apenas atualizamos o state para simular.
    addToast('Enviando documento...', 'default');
    
    // Atualizar no banco Supabase
    try {
      const { error } = await supabase
        .from('documentos')
        .update({ status: 'uploaded' }) // Na vida real: path: storageUrl
        .eq('id', docId);
        
      if (error) throw error;
      
      addToast('Documento recebido com sucesso!', 'success');
      // Rebuscar para garantir
      await fetchFormDetails();
    } catch (err: any) {
      addToast('Erro ao salvar documento: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="spin" style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--border-3)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
          </div>
        ) : parties.length > 0 ? (
          <ClientPortalView 
            parties={parties} 
            isDone={isDone} 
            onUpload={handleDocumentUpload} 
            addToast={addToast} 
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dust-2)' }}>
            <p>Link expirado ou inválido.</p>
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
