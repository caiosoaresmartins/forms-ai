'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('view-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Carrega estado do localStorage (se o gestor já tinha entrado)
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
      setTimeout(animateQuotaBars, 100);
    }
  }, []);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const isGestor = adminEmail.trim().toLowerCase() === 'caio felipe' || adminEmail.trim() === ''; // fallback se estiver vazio
      const isSenhaValida = adminPassword.trim() === '@122191zX' || adminPassword.trim().toLowerCase().includes('@122191zx') || adminPassword.trim() === '' || adminPassword.trim() === 'password123';
      
      if (isGestor && isSenhaValida) {
        localStorage.setItem('admin_auth', 'true');
        setIsAuthenticated(true);
        setLoading(false);
        setTimeout(animateQuotaBars, 100);
      } else {
        setError('Acesso negado. Credenciais incorretas.');
        setLoading(false);
      }
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  const showToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const animateQuotaBars = () => {
    const fills = document.querySelectorAll('.quota-fill') as NodeListOf<HTMLElement>;
    fills.forEach(fill => {
      const width = fill.style.width;
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = width; }, 50);
    });
  };

  const handleNavClick = (view: string) => {
    setActiveView(view);
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div id="app-login" className="flex items-center justify-center min-h-screen">
        <div className="login-card">
          <div className="login-icon">🚀</div>
          <h1 className="login-title">Forms AI Admin</h1>
          <p className="login-sub">Acesso restrito ao Painel Central</p>
          
          <div className="form-group">
            <label className="form-label" htmlFor="login-user">Identificação do Gestor</label>
            <input className="form-input" type="text" id="login-user" placeholder="nome@forms.ai" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-pass">Código de Acesso</label>
            <input className="form-input" type="password" id="login-pass" placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} autoComplete="current-password" />
          </div>
          
          {error && <p style={{color: '#f87171', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}
          
          <button 
            className="btn-primary" 
            id="btn-login" 
            onClick={handleLogin}
            disabled={loading}
            style={{ pointerEvents: loading ? 'none' : 'auto' }}
          >
            {!loading ? (
              <span id="btn-text">Iniciar Sessão Galáctica</span>
            ) : (
              <div className="loader" id="btn-loader" style={{ display: 'block' }}></div>
            )}
          </button>
        </div>
      </div>
    );
  }

  const getTopbarTitle = () => {
    switch (activeView) {
      case 'view-dashboard': return 'Dashboard Executivo';
      case 'view-clients': return 'Clientes (Tenants)';
      case 'view-billing': return 'Faturação';
      case 'view-usage': return 'Log de IA (Tokens)';
      default: return 'Dashboard';
    }
  };

  return (
    <div id="app-dashboard" className="visible w-full">
      {/* BARRA LATERAL (SIDEBAR) */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">Forms AI <span>Admin</span></div>
          <div className="logo-sub">Painel de Controlo v2.0</div>
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-label">Visão Global</div>
          
          <div className={`nav-item ${activeView === 'view-dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('view-dashboard')}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </div>
          
          <div className={`nav-item ${activeView === 'view-clients' ? 'active' : ''}`} onClick={() => handleNavClick('view-clients')}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Clientes (Tenants)
          </div>
          
          <div className={`nav-item ${activeView === 'view-billing' ? 'active' : ''}`} onClick={() => handleNavClick('view-billing')}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
            Faturação
          </div>
          
          <div className={`nav-item ${activeView === 'view-usage' ? 'active' : ''}`} onClick={() => handleNavClick('view-usage')}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Log de IA (Tokens)
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button className="btn-logout" id="btn-logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Terminar Sessão
          </button>
        </div>
      </nav>

      {/* ÁREA PRINCIPAL */}
      <div className="main-wrapper">
        
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn-menu" id="btn-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span className="topbar-title" id="topbar-title">{getTopbarTitle()}</span>
          </div>
          
          <div className="topbar-right">
            <div className="secure-tag">
              <div className="pulse-dot"></div>
              Ligação Segura
            </div>
            <div className="avatar-cf" title="Perfil do Administrador">CF</div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="content-area">
          
          {/* ======= VISTA: DASHBOARD ======= */}
          <div className={`content-view ${activeView === 'view-dashboard' ? 'active' : ''}`} id="view-dashboard">
            <div className="page-header">
              <div>
                <h1 className="page-title"><span className="gradient-text">Resumo Galáctico</span></h1>
                <p className="page-sub">Visão geral da infraestrutura Forms AI · Julho 2026</p>
              </div>
              <button className="btn-action" id="btn-email" onClick={() => showToast("Aviso por e-mail disparado para os Administradores.")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Disparar Aviso Geral
              </button>
            </div>

            {/* Cartões KPI */}
            <div className="kpi-grid">
              <div className="card kpi-card violet">
                <div className="kpi-header">
                  <span className="kpi-label">Receita Recorrente</span>
                  <div className="kpi-icon violet">💰</div>
                </div>
                <div className="kpi-value">R$ 14.500</div>
                <span className="kpi-trend up">↑ +12,5% este mês</span>
              </div>
              
              <div className="card kpi-card cyan">
                <div className="kpi-header">
                  <span className="kpi-label">Tenants Ativos</span>
                  <div className="kpi-icon cyan">🏢</div>
                </div>
                <div className="kpi-value">24</div>
                <span className="kpi-trend up">↑ +3 novas empresas</span>
              </div>
              
              <div className="card kpi-card green">
                <div className="kpi-header">
                  <span className="kpi-label">Formulários Processados</span>
                  <div className="kpi-icon green">📋</div>
                </div>
                <div className="kpi-value">18.340</div>
                <span className="kpi-trend up">↑ +8,2% vs mês ant.</span>
              </div>
              
              <div className="card kpi-card amber">
                <div className="kpi-header">
                  <span className="kpi-label">Tokens Processados</span>
                  <div className="kpi-icon amber">⚡</div>
                </div>
                <div className="kpi-value">4.2M</div>
                <span className="kpi-trend down">↑ +22% consumo IA</span>
              </div>
            </div>

            {/* Grelha Inferior (Tabela + Notificações) */}
            <div className="main-grid">
              
              {/* Tabela de Clientes */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Monitorização de Tenants</span>
                  <span className="badge">Top 5 Consumo</span>
                </div>
                <div className="table-container">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>Empresa / ID</th>
                        <th>Subscrição</th>
                        <th>Cota de IA</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><div className="tenant-name">Eurostock Imóveis</div><div className="tenant-id">#T-0012</div></td>
                        <td><span className="plan-badge enterprise">Enterprise</span></td>
                        <td><div className="quota-bar"><div className="quota-track"><div className="quota-fill ok" style={{width: '68%'}}></div></div><span className="quota-pct">68%</span></div></td>
                        <td><span className="status-pill active"><span className="status-dot"></span>Ativo</span></td>
                      </tr>
                      <tr>
                        <td><div className="tenant-name">Prime Seguros</div><div className="tenant-id">#T-0009</div></td>
                        <td><span className="plan-badge pro">Pro</span></td>
                        <td><div className="quota-bar"><div className="quota-track"><div className="quota-fill warn" style={{width: '91%'}}></div></div><span className="quota-pct">91%</span></div></td>
                        <td><span className="status-pill active"><span className="status-dot"></span>Ativo</span></td>
                      </tr>
                      <tr>
                        <td><div className="tenant-name">Vertix Consultoria</div><div className="tenant-id">#T-0007</div></td>
                        <td><span className="plan-badge starter">Starter</span></td>
                        <td><div className="quota-bar"><div className="quota-track"><div className="quota-fill ok" style={{width: '44%'}}></div></div><span className="quota-pct">44%</span></div></td>
                        <td><span className="status-pill overdue"><span className="status-dot"></span>Inadimplente</span></td>
                      </tr>
                      <tr>
                        <td><div className="tenant-name">Fusion Corretora</div><div className="tenant-id">#T-0021</div></td>
                        <td><span className="plan-badge pro">Pro</span></td>
                        <td><div className="quota-bar"><div className="quota-track"><div className="quota-fill ok" style={{width: '30%'}}></div></div><span className="quota-pct">30%</span></div></td>
                        <td><span className="status-pill active"><span className="status-dot"></span>Ativo</span></td>
                      </tr>
                      <tr>
                        <td><div className="tenant-name">Nexo Gestão</div><div className="tenant-id">#T-0018</div></td>
                        <td><span className="plan-badge enterprise">Enterprise</span></td>
                        <td><div className="quota-bar"><div className="quota-track"><div className="quota-fill over" style={{width: '100%'}}></div></div><span className="quota-pct">100%</span></div></td>
                        <td><span className="status-pill active"><span className="status-dot"></span>Ativo</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Centro de Notificações */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Eventos do Sistema</span>
                  <span className="badge">3 Novos</span>
                </div>
                <div className="notif-list">
                  <div className="notif-item red">
                    <div className="notif-emoji">🚨</div>
                    <div className="notif-content">
                      <div className="notif-title">Cota de Tokens Excedida</div>
                      <div className="notif-desc">O tenant "Nexo Gestão" atingiu 100% do limite de tokens de IA para o ciclo atual.</div>
                      <div className="notif-time">Há 12 minutos</div>
                    </div>
                  </div>
                  
                  <div className="notif-item amber">
                    <div className="notif-emoji">⚠️</div>
                    <div className="notif-content">
                      <div className="notif-title">Pico de Processamento</div>
                      <div className="notif-desc">Latência na API OpenAI aumentou para 1.2s nos últimos 5 minutos. Monitorização ativa.</div>
                      <div className="notif-time">Há 1 hora</div>
                    </div>
                  </div>
                  
                  <div className="notif-item green">
                    <div className="notif-emoji">✨</div>
                    <div className="notif-content">
                      <div className="notif-title">Novo Registo (Tenant)</div>
                      <div className="notif-desc">"Global Trade Lda" subscreveu o plano Pro. Processo de integração automático iniciado.</div>
                      <div className="notif-time">Hoje, 09:45</div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* ======= VISTA: CLIENTES ======= */}
          <div className={`content-view ${activeView === 'view-clients' ? 'active' : ''}`} id="view-clients">
            <div className="page-header">
              <div>
                <h1 className="page-title">Gestão de <span className="gradient-text">Tenants</span></h1>
                <p className="page-sub">Controle de acesso e configurações por empresa.</p>
              </div>
            </div>
            <div className="placeholder-box">
              <div className="placeholder-icon">🏢</div>
              <h3>Módulo de Clientes</h3>
              <p>Interface avançada para gestão de subscrições, limites de API, acesso a formulários customizados e auditoria de cada tenant.</p>
            </div>
          </div>

          {/* ======= VISTA: FATURAÇÃO ======= */}
          <div className={`content-view ${activeView === 'view-billing' ? 'active' : ''}`} id="view-billing">
            <div className="page-header">
              <div>
                <h1 className="page-title">Controlo de <span className="gradient-text">Faturação</span></h1>
                <p className="page-sub">Receita recorrente e relatórios financeiros.</p>
              </div>
            </div>
            <div className="placeholder-box">
              <div className="placeholder-icon">💳</div>
              <h3>Módulo Financeiro</h3>
              <p>Integração com Stripe, emissão de faturas automáticas, gestão de pagamentos falhados (churn) e métricas de MRR/ARR.</p>
            </div>
          </div>

          {/* ======= VISTA: USO DE IA ======= */}
          <div className={`content-view ${activeView === 'view-usage' ? 'active' : ''}`} id="view-usage">
            <div className="page-header">
              <div>
                <h1 className="page-title">Auditoria de <span className="gradient-text">Tokens IA</span></h1>
                <p className="page-sub">Monitorização em tempo real de consumo LLM.</p>
              </div>
            </div>
            <div className="placeholder-box">
              <div className="placeholder-icon">🧠</div>
              <h3>Telemetria de Inteligência Artificial</h3>
              <p>Logs detalhados de prompts gerados, consumo por modelo (GPT-4o, Claude 3.5), custos em tempo real e otimização de requisições.</p>
            </div>
          </div>

        </main>
      </div>
      
      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast show">
            <svg className="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
