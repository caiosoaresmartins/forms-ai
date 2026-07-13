'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity,
  LogOut,
  ShieldAlert,
  Lock
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('admin_auth') === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credenciais solicitadas pelo Caio
    if (username.trim().toLowerCase() === 'caio felipe' && password === '@122191zX') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 font-sans p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/30 mb-4">
              <Lock className="w-6 h-6 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Acesso Restrito</h1>
            <p className="text-zinc-500 text-sm mt-1">Painel do Gestor Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="username">
                Usuário (Gestor)
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Caio felipe"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg py-3 text-sm transition-all duration-200 mt-2"
            >
              Autenticar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/60 bg-zinc-950 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">Forms <span className="text-teal-400">Admin</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Gestão</p>
          
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-teal-500/10 text-teal-400 font-medium text-sm transition-colors border border-teal-500/20">
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral
          </Link>
          
          <Link href="/admin/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium text-sm transition-colors">
            <Users className="w-4 h-4" />
            Clientes (Tenants)
          </Link>
          
          <Link href="/admin/billing" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium text-sm transition-colors">
            <CreditCard className="w-4 h-4" />
            Assinaturas
          </Link>

          <Link href="/admin/usage" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 font-medium text-sm transition-colors">
            <Activity className="w-4 h-4" />
            Log de IA (Groq)
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800/60">
          <button 
            onClick={() => {
              localStorage.removeItem('admin_auth');
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 font-medium text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-zinc-950 overflow-y-auto">
        <div className="h-16 border-b border-zinc-800/60 flex items-center justify-between px-8 bg-zinc-950/50 sticky top-0 backdrop-blur-md z-10">
          <h1 className="text-sm font-medium text-zinc-400">Dashboard Executivo</h1>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Acesso Seguro
            </span>
            <div className="w-8 h-8 rounded-full bg-teal-600 border border-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              CF
            </div>
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
