import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Plus,
  X,
  ChevronRight,
  Calendar,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  FileText
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useERPData } from '../hooks/useERPData';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports({ data }: { data: ReturnType<typeof useERPData> }) {
  const [activeReport, setActiveReport] = useState<string | null>('Relatório de Vendas Diário');
  const [dateRange, setDateRange] = useState('30'); // days

  // Data processing for reports
  const reportsData = useMemo(() => {
    // 1. Daily Sales Report
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailySalesArr = last30Days.map(date => {
      const daySales = data.sales.filter(s => s.date.split('T')[0] === date);
      const total = daySales.reduce((acc, s) => acc + s.total, 0);
      return { date: date.split('-').slice(1).reverse().join('/'), valor: total };
    });

    // 2. Sales by Category
    const catTotal: Record<string, number> = {};
    data.sales.forEach(s => {
      s.items.forEach(item => {
        const prod = data.products.find(p => p.id === item.productId);
        const cat = prod?.category || 'Outros';
        catTotal[cat] = (catTotal[cat] || 0) + (item.price * item.quantity);
      });
    });
    const categoryData = Object.entries(catTotal).map(([name, value]) => ({ name, value }));

    // 3. Top Products
    const prodSales: Record<string, { name: string, total: number, quantity: number }> = {};
    data.sales.forEach(s => {
      s.items.forEach(item => {
        if (!prodSales[item.productId]) {
          prodSales[item.productId] = { name: item.name, total: 0, quantity: 0 };
        }
        prodSales[item.productId].total += (item.price * item.quantity);
        prodSales[item.productId].quantity += item.quantity;
      });
    });
    const topProducts = Object.values(prodSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // 4. Cash Flow (Monthly Trend)
    const monthlyTrend: Record<string, { month: string, income: number, expense: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('pt-BR', { month: 'short' });
    }).reverse();

    last6Months.forEach(m => {
       monthlyTrend[m] = { month: m, income: 0, expense: 0 };
    });

    data.transactions.forEach(t => {
      const m = new Date(t.date).toLocaleString('pt-BR', { month: 'short' });
      if (monthlyTrend[m]) {
        if (t.type === 'income') monthlyTrend[m].income += t.value;
        else monthlyTrend[m].expense += t.value;
      }
    });
    const cashFlowData = Object.values(monthlyTrend);

    // 5. Customer Ranking
    const customerRanking = data.customers
      .map(c => {
        const totalSpent = data.sales
          .filter(s => s.customerId === c.id)
          .reduce((acc, s) => acc + s.total, 0);
        return { name: c.name, total: totalSpent };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      dailySales: dailySalesArr,
      categoryData,
      topProducts,
      cashFlowData,
      customerRanking
    };
  }, [data.sales, data.products, data.transactions, data.customers]);

  const reportCategories = [
    {
      title: 'Vendas',
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600',
      items: [
        'Relatório de Vendas Diário',
        'Ranking de Produtos Vendidos',
        'Vendas por Categoria'
      ]
    },
    {
      title: 'Estoque',
      icon: Package,
      color: 'bg-amber-50 text-amber-600',
      items: [
        'Posição de Estoque Atual',
        'Produtos Abaixo do Mínimo'
      ]
    },
    {
      title: 'Financeiro',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
      items: [
        'Fluxo de Caixa Mensal',
        'Lucratividade por Categoria'
      ]
    },
    {
      title: 'Clientes',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      items: [
        'Ranking de Melhores Clientes'
      ]
    }
  ];

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'Relatório de Vendas Diário':
        return (
          <div className="space-y-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportsData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    fontSize={10} 
                    fontWeight="bold" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Faturamento']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Diária</p>
                  <p className="text-xl font-black text-slate-800">
                    {formatCurrency(reportsData.dailySales.reduce((acc, d) => acc + d.valor, 0) / 30)}
                  </p>
               </div>
               <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total do Período</p>
                  <p className="text-xl font-black text-blue-600">
                    {formatCurrency(reportsData.dailySales.reduce((acc, d) => acc + d.valor, 0))}
                  </p>
               </div>
            </div>
          </div>
        );

      case 'Ranking de Produtos Vendidos':
        return (
          <div className="space-y-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsData.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150} 
                    fontSize={10} 
                    fontWeight="bold" 
                    tick={{ fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Qtd. Vendida</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reportsData.topProducts.map((p, i) => (
                    <tr key={i} className="text-sm">
                      <td className="px-4 py-3 font-bold text-slate-700">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{p.quantity} un</td>
                      <td className="px-4 py-3 text-right font-black text-blue-600">{formatCurrency(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Vendas por Categoria':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportsData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportsData.categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Distribuição</h4>
              {reportsData.categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Fluxo de Caixa Mensal':
        return (
          <div className="space-y-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsData.cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    fontSize={10} 
                    fontWeight="bold" 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Saldo Médio Mensal</p>
                <p className="text-xl font-black text-emerald-700">
                  {formatCurrency(reportsData.cashFlowData.reduce((acc, d) => acc + (d.income - d.expense), 0) / 6)}
                </p>
              </div>
              <div className="p-3 bg-white/50 rounded-xl">
                 <TrendingUp className="text-emerald-600" />
              </div>
            </div>
          </div>
        );

      case 'Ranking de Melhores Clientes':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 gap-3">
               {reportsData.customerRanking.map((c, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">
                       {i + 1}
                     </div>
                     <div>
                       <p className="font-bold text-slate-800">{c.name}</p>
                       <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Cliente Platinum</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-black text-slate-900">{formatCurrency(c.total)}</p>
                     <p className="text-[10px] text-emerald-600 font-bold">VIP</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        );

      default:
        return (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Este relatório está sendo processado ou não possui dados suficientes.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCategories.map((cat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", cat.color)}>
              <cat.icon size={24} />
            </div>
            <h3 className="font-bold text-slate-800 mb-4">{cat.title}</h3>
            <ul className="space-y-3">
              {cat.items.map((item, j) => (
                <li key={j}>
                  <button 
                    onClick={() => setActiveReport(item)}
                    className={cn(
                      "w-full flex items-center justify-between text-xs font-bold transition-all p-1 rounded-lg",
                      activeReport === item ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-blue-600"
                    )}
                  >
                    <span className="text-left">{item}</span>
                    <ChevronRight size={14} className={cn("transition-all", activeReport === item ? "opacity-100" : "opacity-0")} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Featured Report Preview */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{activeReport}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Visão Analítica do Negócio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors">
              <Calendar size={14} />
              Últimos 30 Dias
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95">
              <Download size={14} />
              Exportar
            </button>
          </div>
        </div>
        <div className="p-8">
          {renderActiveReport()}
        </div>
      </div>
    </div>
  );
}
