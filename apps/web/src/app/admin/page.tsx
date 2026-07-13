'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState<'SUPER_ADMIN' | 'ADMIN' | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('view-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);
  
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  // Estados dos Modais
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Dados Mockados para interatividade
  const [clients, setClients] = useState([
    { id: '#T-0012', name: 'Eurostock Imóveis', plan: 'Enterprise', quota: 68, status: 'Ativo', inactiveDays: 2 },
    { id: '#T-0009', name: 'Prime Seguros', plan: 'Pro', quota: 91, status: 'Ativo', inactiveDays: 0 },
    { id: '#T-0007', name: 'Vertix Consultoria', plan: 'Starter', quota: 44, status: 'Inadimplente', inactiveDays: 8 },
    { id: '#T-0021', name: 'Fusion Corretora', plan: 'Pro', quota: 30, status: 'Pausado', inactiveDays: 14 },
    { id: '#T-0018', name: 'Nexo Gestão', plan: 'Enterprise', quota: 100, status: 'Ativo', inactiveDays: 1 }
  ]);

  const [admins, setAdmins] = useState([
    { id: '1', name: 'Caio Felipe', email: 'caio felipe', role: 'SUPER_ADMIN', status: 'Ativo' },
    { id: '2', name: 'João Silva', email: 'joao.silva@forms.ai', role: 'ADMIN', status: 'Ativo' }
  ]);

  // Carrega estado do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
      const role = localStorage.getItem('admin_role') as 'SUPER_ADMIN' | 'ADMIN' | null;
      setAdminRole(role || 'ADMIN');
      setTimeout(animateQuotaBars, 100);
    }
  }, []);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const isSuperAdmin = adminEmail.trim().toLowerCase() === 'caio felipe';
      // Permite entrada como SUPER_ADMIN se for caio felipe, ou ADMIN se for outro e a senha for válida
      // Senha mockada super permissiva para facilitar o teste:
      const isSenhaValida = adminPassword.trim() === '@122191zX' || adminPassword.trim().toLowerCase().includes('122191') || adminPassword.trim().length >= 4 || adminPassword.trim() === '';
      
      if (isSenhaValida) {
        const roleToSet = isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN';
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_role', roleToSet);
        setAdminRole(roleToSet);
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
    localStorage.removeItem('admin_role');
    setIsAuthenticated(false);
    setAdminRole(null);
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
    if (view === 'view-dashboard') {
      setTimeout(animateQuotaBars, 100);
    }
  };

  const changeClientStatus = (id: string, newStatus: string) => {
    setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
    showToast(`Status do cliente atualizado para: ${newStatus}`);
  };

  const handleNewClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowClientModal(false);
    showToast('Novo cliente cadastrado com sucesso!');
  };

  const handleNewAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAdminModal(false);
    showToast('Novo administrador adicionado à equipe!');
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
      case 'view-clients': return 'Gestão de Clientes (Tenants)';
      case 'view-billing': return 'Faturação';
      case 'view-usage': return 'Log de IA (Tokens)';
      case 'view-admins': return 'Gestão da Equipe (Admins)';
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

          {adminRole === 'SUPER_ADMIN' && (
            <div className={`nav-item ${activeView === 'view-admins' ? 'active' : ''}`} onClick={() => handleNavClick('view-admins')}>
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M18 22H6c-2 0-3-1-3-3a8 8 0 0 1 14 0c0 2-1 3-3 3z"/>
                <path d="M19 8v4M17 10h4" />
              </svg>
              Equipe (Admins)
            </div>
          )}
          
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
              {adminRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
            </div>
            <div className="avatar-cf" title="Perfil">{adminRole === 'SUPER_ADMIN' ? 'CF' : 'AD'}</div>
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
              {adminRole === 'SUPER_ADMIN' && (
                <button className="btn-action" onClick={() => showToast("Aviso por e-mail disparado para os Administradores.")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Disparar Aviso Geral
                </button>
              )}
            </div>

            {/* Cartões KPI */}
            <div className="kpi-grid">
              
              {/* Card condicional: Receita (Só Super Admin) ou Vendas (Admins) */}
              {adminRole === 'SUPER_ADMIN' ? (
                <div className="card kpi-card violet">
                  <div className="kpi-header">
                    <span className="kpi-label">Receita Recorrente</span>
                    <div className="kpi-icon violet">💰</div>
                  </div>
                  <div className="kpi-value">R$ 14.500</div>
                  <span className="kpi-trend up">↑ +12,5% este mês</span>
                </div>
              ) : (
                <div className="card kpi-card violet">
                  <div className="kpi-header">
                    <span className="kpi-label">Número de Vendas</span>
                    <div className="kpi-icon violet">🚀</div>
                  </div>
                  <div className="kpi-value">142</div>
                  <span className="kpi-trend up">↑ +5 assinaturas hoje</span>
                </div>
              )}
              
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
                      {clients.slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td><div className="tenant-name">{c.name}</div><div className="tenant-id">{c.id}</div></td>
                          <td><span className={`plan-badge ${c.plan.toLowerCase()}`}>{c.plan}</span></td>
                          <td><div className="quota-bar"><div className="quota-track"><div className={`quota-fill ${c.quota > 90 ? 'over' : c.quota > 75 ? 'warn' : 'ok'}`} style={{width: `${c.quota}%`}}></div></div><span className="quota-pct">{c.quota}%</span></div></td>
                          <td>
                            <span className={`status-pill ${c.status === 'Ativo' ? 'active' : 'overdue'}`}>
                              <span className="status-dot"></span>{c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Centro de Notificações */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Eventos do Sistema</span>
                  <span className="badge">Novos Alertas</span>
                </div>
                <div className="notif-list">
                  
                  {/* ALERTA DE INATIVIDADE REQUERIDO PELO USER */}
                  {clients.some(c => c.inactiveDays > 7) && (
                    <div className="notif-item amber">
                      <div className="notif-emoji">⚠️</div>
                      <div className="notif-content">
                        <div className="notif-title">Alerta de Inatividade</div>
                        <div className="notif-desc">Existem clientes que não acessam o sistema há mais de 7 dias. Verifique a aba de Tenants.</div>
                        <div className="notif-time">Agora mesmo</div>
                      </div>
                    </div>
                  )}

                  <div className="notif-item red">
                    <div className="notif-emoji">🚨</div>
                    <div className="notif-content">
                      <div className="notif-title">Cota de Tokens Excedida</div>
                      <div className="notif-desc">O tenant "Nexo Gestão" atingiu 100% do limite de tokens de IA para o ciclo atual.</div>
                      <div className="notif-time">Há 12 minutos</div>
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
                <p className="page-sub">Cadastro manual, bloqueios e controle de acessos.</p>
              </div>
              <button className="btn-action" onClick={() => setShowClientModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Cadastrar Novo Cliente
              </button>
            </div>
            
            <div className="card">
              <div className="table-container">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>Último Acesso</th>
                      <th>Plano</th>
                      <th>Estado</th>
                      <th>Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td><div className="tenant-name">{c.name}</div><div className="tenant-id">{c.id}</div></td>
                        <td>
                          {c.inactiveDays === 0 ? 'Hoje' : c.inactiveDays > 7 ? (
                            <span style={{ color: 'var(--color-error)' }}>Há {c.inactiveDays} dias ⚠️</span>
                          ) : (
                            <span style={{ color: 'var(--color-text-faint)' }}>Há {c.inactiveDays} dias</span>
                          )}
                        </td>
                        <td><span className={`plan-badge ${c.plan.toLowerCase()}`}>{c.plan}</span></td>
                        <td>
                          <span className={`status-pill ${c.status === 'Ativo' ? 'active' : 'overdue'}`}>
                            <span className="status-dot"></span>{c.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => changeClientStatus(c.id, 'Ativo')} title="Ativar" style={{ padding: '6px', borderRadius: '6px', background: 'rgba(52,211,153,0.1)', color: 'var(--color-success)', cursor: 'pointer', border: '1px solid rgba(52,211,153,0.2)' }}>▶️</button>
                            <button onClick={() => changeClientStatus(c.id, 'Pausado')} title="Pausar" style={{ padding: '6px', borderRadius: '6px', background: 'rgba(251,191,36,0.1)', color: 'var(--color-warning)', cursor: 'pointer', border: '1px solid rgba(251,191,36,0.2)' }}>⏸️</button>
                            <button onClick={() => changeClientStatus(c.id, 'Bloqueado')} title="Bloquear" style={{ padding: '6px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', color: 'var(--color-error)', cursor: 'pointer', border: '1px solid rgba(248,113,113,0.2)' }}>🛑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ======= VISTA: ADMINS (Só Super Admin) ======= */}
          {adminRole === 'SUPER_ADMIN' && (
            <div className={`content-view ${activeView === 'view-admins' ? 'active' : ''}`} id="view-admins">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Gestão da <span className="gradient-text">Equipe</span></h1>
                  <p className="page-sub">Controle quem tem acesso ao painel de administração.</p>
                </div>
                <button className="btn-action" onClick={() => setShowAdminModal(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Adicionar Admin
                </button>
              </div>
              
              <div className="card">
                <div className="table-container">
                  <table className="clients-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Nível de Acesso</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(a => (
                        <tr key={a.id}>
                          <td><div className="tenant-name">{a.name}</div></td>
                          <td><div style={{ color: 'var(--color-text-muted)' }}>{a.email}</div></td>
                          <td><span className={`plan-badge ${a.role === 'SUPER_ADMIN' ? 'enterprise' : 'pro'}`}>{a.role}</span></td>
                          <td>
                            {a.role !== 'SUPER_ADMIN' && (
                              <button onClick={() => showToast(`Usuário ${a.name} bloqueado.`)} style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', color: 'var(--color-error)', cursor: 'pointer', border: '1px solid rgba(248,113,113,0.2)', fontSize: '0.8rem', fontWeight: 600 }}>Revogar Acesso</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

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
              {adminRole === 'SUPER_ADMIN' ? (
                <p>Integração com Stripe, emissão de faturas automáticas, gestão de pagamentos falhados (churn) e métricas de MRR/ARR.</p>
              ) : (
                <p>Você não tem permissão para visualizar dados financeiros.</p>
              )}
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

      {/* MODAL: CADASTRAR CLIENTE */}
      <div className={`modal-overlay ${showClientModal ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Novo Cliente (Tenant)</h3>
            <button className="btn-close" onClick={() => setShowClientModal(false)}>✕</button>
          </div>
          <form onSubmit={handleNewClientSubmit}>
            <div className="form-group">
              <label className="form-label">Nome da Empresa</label>
              <input type="text" className="form-input" required placeholder="Ex: Imobiliária XYZ" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail Principal</label>
              <input type="email" className="form-input" required placeholder="contato@empresa.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Plano</label>
              <select className="form-input" style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)' }}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowClientModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ margin: 0, width: 'auto' }}>Cadastrar Cliente</button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: CADASTRAR ADMIN */}
      <div className={`modal-overlay ${showAdminModal ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Novo Administrador</h3>
            <button className="btn-close" onClick={() => setShowAdminModal(false)}>✕</button>
          </div>
          <form onSubmit={handleNewAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input type="text" className="form-input" required placeholder="Ex: Lucas Silva" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail de Acesso</label>
              <input type="email" className="form-input" required placeholder="lucas@forms.ai" />
            </div>
            <div className="form-group">
              <label className="form-label">Senha Provisória</label>
              <input type="password" className="form-input" required placeholder="••••••••" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAdminModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" style={{ margin: 0, width: 'auto' }}>Criar Acesso</button>
            </div>
          </form>
        </div>
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
