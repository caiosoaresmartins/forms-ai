'use client';

import React, { useEffect } from 'react';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Adicionar a classe admin-theme ao body para isolar o CSS
    document.body.classList.add('admin-theme');
    return () => {
      document.body.classList.remove('admin-theme');
    };
  }, []);

  return (
    <div className="admin-theme w-full min-h-screen">
      {/* Fundo Espacial Animado */}
      <div id="stars-bg">
        <div className="nebula-blob" style={{width: '600px', height: '400px', top: '-10%', left: '-10%', background: 'radial-gradient(ellipse, rgba(124,109,250,0.15) 0%, transparent 70%)', animationDuration: '15s'}}></div>
        <div className="nebula-blob" style={{width: '500px', height: '350px', bottom: '-10%', right: '-10%', background: 'radial-gradient(ellipse, rgba(34,211,238,0.1) 0%, transparent 70%)', animationDuration: '18s', animationDirection: 'alternate-reverse'}}></div>
        <div className="nebula-blob" style={{width: '400px', height: '300px', top: '40%', left: '50%', background: 'radial-gradient(ellipse, rgba(251,191,36,0.06) 0%, transparent 70%)', animationDuration: '20s'}}></div>
      </div>
      <div className="grid-lines"></div>

      {children}
    </div>
  );
}
