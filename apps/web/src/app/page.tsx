"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingView } from '@/features/landing/LandingView';

export default function AppOrchestrator() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se estiver logado, joga pro dashboard, senão fica na landing
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
        <span className="spin" style={{ display: 'inline-block', width: 24, height: 24, border: '2px solid var(--border-3)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LandingView onLoginClick={() => router.push('/login')} />
      </main>
    </div>
  );
}
