import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Bell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { useERPData } from '../hooks/useERPData';

export default function Dashboard({ data }: { data: ReturnType<typeof useERPData> }) {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);

  // 1. Stats and Trends
  const targetDateString = new Date(selectedDate + "T12:00:00").toDateString();
  const todaySales = data.sales.filter(s => new Date(s.date).toDateString() === targetDateString);
  const totalRevenue = todaySales.reduce((acc, s) => acc + s.total, 0);
  const totalOrders = todaySales.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockCount = data.products.filter(p => p.stock <= p.minStock).length;

  // 2. Dynamic Sales Chart Data (Hourly for today)
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const chartData = hours.map(hour => {
    const hourInt = parseInt(hour.split(':')[0]);
    const hourlySales = todaySales.filter(s => {
      const saleHour = new Date(s.date).getHours();
      return saleHour >= hourInt && saleHour < hourInt + 2;
    }).reduce((acc, s) => acc + s.total, 0);
    
    return { hour, sales: hourlySales };
  });

  // 3. Dynamic Top Products
  const productAggregates: Record<string, { name: string, sales: number, revenue: number }> = {};
  todaySales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productAggregates[item.productId]) {
        productAggregates[item.productId] = { name: item.name, sales: 0, revenue: 0 };
      }
      productAggregates[item.productId].sales += item.quantity;
      productAggregates[item.productId].revenue += (item.quantity * item.price);
    });
  });

  const topProductsSorted = Object.values(productAggregates)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const maxRevenue = topProductsSorted.length > 0 ? topProductsSorted[0].revenue : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800">Resumo Diário</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-500 hidden sm:block">Analisar data:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Faturamento (Dia)" 
          value={formatCurrency(totalRevenue)} 
          icon={DollarSign} 
          trend="+12.5%" 
          trendUp={true} 
          color="blue"
        />
        <StatCard 
          title="Total Pedidos" 
          value={totalOrders.toString()} 
          icon={ShoppingCart} 
          trend="+5.2%" 
          trendUp={true} 
          color="emerald"
        />
        <StatCard 
          title="Ticket Médio" 
          value={formatCurrency(averageTicket)} 
          icon={TrendingUp} 
          trend="-2.1%" 
          trendUp={false} 
          color="indigo"
        />
        <StatCard 
          title="Estoque Baixo" 
          value={lowStockCount.toString()} 
          icon={AlertTriangle} 
          trend="Atenção" 
          trendUp={false} 
          color="amber"
          isAlert={lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Desempenho por Hora ({new Date(selectedDate + "T12:00:00").toLocaleDateString('pt-BR')})</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [formatCurrency(value as number), 'Vendas']}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Produtos Mais Vendidos</h3>
          <div className="space-y-4">
            {topProductsSorted.map((product, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.sales} unidades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(product.revenue)}</p>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Ver Relatório Completo
          </button>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Vendas Recentes</h3>
            <button className="text-xs font-semibold text-blue-600 hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Pagamento</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaySales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">#{sale.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">Consumidor Final</td>
                    <td className="px-6 py-4 text-sm text-slate-500 uppercase">{sale.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(sale.total)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Alertas do Sistema</h3>
          <div className="space-y-4">
            {data.products.filter(p => p.stock <= p.minStock).map(p => (
              <div key={p.id} className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Estoque Baixo: {p.name}</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Apenas {p.stock} unidades restantes. Mínimo sugerido: {p.minStock}.
                  </p>
                  <button className="mt-2 text-xs font-bold text-amber-800 hover:underline">Repor Estoque</button>
                </div>
              </div>
            ))}
            {data.products.filter(p => p.stock <= p.minStock).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-medium">Nenhum alerta pendente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, isAlert }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md",
      isAlert && "border-amber-200 bg-amber-50/30"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg border", colors[color])}>
          <Icon size={20} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
