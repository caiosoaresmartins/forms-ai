import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Zap,
  ArrowUpRight
} from 'lucide-react';

const stats = [
  { name: 'Receita Recorrente (MRR)', value: 'R$ 14.500', change: '+12.5%', icon: TrendingUp },
  { name: 'Clientes Ativos (Tenants)', value: '24', change: '+3', icon: Users },
  { name: 'Formulários Processados', value: '1.284', change: '+18.2%', icon: FileText },
  { name: 'Uso de IA (Tokens)', value: '4.2M', change: '+5.4%', icon: Zap },
];

const recentClients = [
  { id: 1, name: 'Imobiliária Silva & Cia', plan: 'Profissional', status: 'Ativo', usage: '84%' },
  { id: 2, name: 'Cartório do 4º Ofício', plan: 'Enterprise', status: 'Ativo', usage: '42%' },
  { id: 3, name: 'RH Tech Solutions', plan: 'Starter', status: 'Inadimplente', usage: '100%' },
  { id: 4, name: 'Construtora Horizonte', plan: 'Profissional', status: 'Ativo', usage: '12%' },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Visão Geral do Negócio</h2>
          <p className="text-sm text-zinc-400">Acompanhe as métricas de receita, uso e saúde dos clientes.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-teal-500/20">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Disparar Aviso de E-mail
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center border border-zinc-700/50">
                  <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <p className="text-zinc-400 text-sm font-medium mb-1">{stat.name}</p>
              <h3 className="text-3xl font-semibold text-white tracking-tight">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients Table */}
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-800/60 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Últimos Clientes Ativos</h3>
              <p className="text-sm text-zinc-400 mt-1">Empresas consumindo a cota de formulários neste mês.</p>
            </div>
            <button className="text-sm text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Ver todos
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/80 border-b border-zinc-800/60">
                <tr>
                  <th className="px-6 py-4 font-medium">Empresa (Tenant)</th>
                  <th className="px-6 py-4 font-medium">Plano Assinado</th>
                  <th className="px-6 py-4 font-medium">Uso da Cota (IA)</th>
                  <th className="px-6 py-4 font-medium">Status Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{client.plan}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${parseInt(client.usage) > 90 ? 'bg-red-500' : 'bg-teal-500'}`} 
                            style={{ width: client.usage }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500">{client.usage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        client.status === 'Ativo' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-800/60 flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Notificações do Sistema</h3>
            <span className="bg-teal-500 text-zinc-950 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {[
              { title: 'Fatura Vencida', desc: 'RH Tech Solutions não pagou a mensalidade.', time: 'Há 2 horas', type: 'error' },
              { title: 'Cota Excedida', desc: 'Imobiliária Silva atingiu 90% da cota de IA.', time: 'Há 5 horas', type: 'alert' },
              { title: 'Novo Assinante', desc: 'Cartório 4º Ofício assinou o plano Enterprise.', time: 'Ontem', type: 'success' }
            ].map((note, i) => (
              <div key={i} className="bg-zinc-950/50 border border-zinc-800/60 rounded-lg p-4 flex gap-3 hover:border-zinc-700 transition-colors cursor-pointer">
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                  note.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                  note.type === 'alert' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                  'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                }`} />
                <div>
                  <h4 className="text-sm font-medium text-white mb-0.5">{note.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">{note.desc}</p>
                  <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{note.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
