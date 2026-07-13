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
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Visão Geral do Negócio</h2>
        <p className="text-sm text-zinc-400">Acompanhe as métricas de receita, uso e saúde dos clientes.</p>
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

      {/* Clients Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl overflow-hidden">
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
    </div>
  );
}
