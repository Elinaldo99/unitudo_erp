import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileText, 
  Download, 
  ChevronRight,
  Calendar,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export default function Reports({ data }: { data: any }) {
  const reportCategories = [
    {
      title: 'Vendas',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600',
      items: [
        'Relatório de Vendas Diário',
        'Vendas por Vendedor',
        'Vendas por Forma de Pagamento',
        'Ranking de Produtos Vendidos'
      ]
    },
    {
      title: 'Estoque',
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
      items: [
        'Posição de Estoque Atual',
        'Produtos Abaixo do Mínimo',
        'Movimentação de Entrada/Saída',
        'Curva ABC de Produtos'
      ]
    },
    {
      title: 'Financeiro',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      items: [
        'Fluxo de Caixa Mensal',
        'DRE Simplificado',
        'Contas a Pagar/Receber',
        'Lucratividade por Categoria'
      ]
    },
    {
      title: 'Clientes',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      items: [
        'Ranking de Melhores Clientes',
        'Clientes Inativos',
        'Fidelidade e Pontuação',
        'Aniversariantes do Mês'
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCategories.map((cat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", cat.color)}>
              <cat.icon size={24} />
            </div>
            <h3 className="font-bold text-slate-800 mb-4">{cat.title}</h3>
            <ul className="space-y-3">
              {cat.items.map((item, j) => (
                <li key={j}>
                  <button className="w-full flex items-center justify-between text-xs font-medium text-slate-500 hover:text-blue-600 group transition-colors">
                    <span className="text-left">{item}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Featured Report Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Análise de Lucratividade (Últimos 30 dias)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
              <Calendar size={14} />
              Março 2024
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
              <Download size={14} />
              PDF
            </button>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center text-slate-400 py-24">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">Selecione um relatório para visualizar a prévia</p>
        </div>
      </div>
    </div>
  );
}
