import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  Eye, 
  XCircle, 
  CheckCircle2,
  Filter,
  X,
  Package,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Sale } from '../types';

export default function Sales({ data }: { data: ReturnType<typeof useERPData> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  const getTodayFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [dateFilter, setDateFilter] = useState(getTodayFormatted());
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSales = useMemo(() => {
    return data.sales.filter(s => {
      const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = false;
      if (!dateFilter) {
        matchesDate = true;
      } else {
        try {
          const saleDate = new Date(s.date);
          const year = saleDate.getFullYear();
          const month = String(saleDate.getMonth() + 1).padStart(2, '0');
          const day = String(saleDate.getDate()).padStart(2, '0');
          const saleDateStr = `${year}-${month}-${day}`;
          matchesDate = saleDateStr === dateFilter;
        } catch(e) {
          matchesDate = false;
        }
      }

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [data.sales, searchTerm, dateFilter, statusFilter]);

  const handleExport = () => {
    if (filteredSales.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    const headers = ['Venda ID', 'Data', 'Cliente', 'Pagamento', 'Total', 'Status'];
    const csvRows = [headers.join(',')];

    for (const sale of filteredSales) {
      const row = [
        sale.id,
        new Date(sale.date).toLocaleString('pt-BR').replace(/,/g, ''),
        `"${sale.customerName || 'Consumidor Final'}"`,
        getMethodLabel(sale.paymentMethod),
        sale.total.toFixed(2),
        sale.status === 'completed' ? 'Finalizada' : 'Cancelada'
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `vendas_${dateFilter || 'todas'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'money': return 'bg-green-100 text-green-700';
      case 'card': return 'bg-blue-100 text-blue-700';
      case 'pix': return 'bg-purple-100 text-purple-700';
      case 'store_credit': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCancelSale = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Tem certeza que deseja cancelar esta venda? O status será alterado para Cancelada e as transações financeiras removidas.')) {
      try {
        await data.updateSaleStatus(id, 'cancelled');
        alert('Venda cancelada com sucesso!');
        if (selectedSale?.id === id) {
           setSelectedSale(data.sales.find(s => s.id === id) || null);
        }
      } catch (error) {
        alert('Erro ao cancelar venda.');
      }
    }
  };

  const handleDeleteSale = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Atenção: A exclusão física da venda apagará o registro definitivamente juntamente com transações financeiras associadas. Deseja continuar?')) {
      try {
        await data.deleteSale(id);
        alert('Venda excluída!');
        if (selectedSale?.id === id) setSelectedSale(null);
      } catch (error) {
        alert('Erro ao excluir venda.');
      }
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'money': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'pix': return 'Pix';
      case 'store_credit': return 'Crediário';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID ou cliente..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center border border-slate-200 rounded-lg bg-white text-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-full sm:w-auto">
             <div className="pl-3 pr-2 py-2 text-slate-400 border-r border-slate-100 flex items-center gap-2 bg-slate-50 rounded-l-lg shrink-0">
                <Calendar size={16} />
                <span className="font-medium hidden sm:inline">Data</span>
             </div>
             <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 outline-none text-slate-700 bg-transparent cursor-pointer font-medium w-full sm:w-auto"
             />
             {dateFilter && (
                <button 
                  onClick={() => setDateFilter('')} 
                  className="pr-3 text-slate-400 hover:text-red-500 shrink-0"
                  title="Limpar Filtro (Mostrar Todos)"
                >
                  <X size={14} />
                </button>
             )}
          </div>

          <div className="relative flex items-center border border-slate-200 rounded-lg bg-white text-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-full sm:w-auto">
             <div className="pl-3 pr-2 py-2 text-slate-400 border-r border-slate-100 flex items-center gap-2 bg-slate-50 rounded-l-lg shrink-0">
                <Filter size={16} />
                <span className="font-medium hidden sm:inline">Status</span>
             </div>
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 outline-none text-slate-700 bg-transparent cursor-pointer font-medium w-full sm:w-auto pr-2"
             >
                <option value="all">Todos</option>
                <option value="completed">Finalizada</option>
                <option value="cancelled">Cancelada</option>
             </select>
          </div>

          <button 
             onClick={handleExport}
             className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nenhuma venda encontrada</h3>
            <p className="text-slate-500">Comece a vender no PDV para ver o histórico aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  <th className="px-6 py-4">Venda</th>
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Pagamento</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                      #{sale.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {sale.customerName || 'Consumidor Final'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-1 rounded-full",
                        getMethodColor(sale.paymentMethod)
                      )}>
                        {getMethodLabel(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-blue-600">{formatCurrency(sale.total)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {sale.status === 'completed' ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-500" />
                        )}
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          sale.status === 'completed' ? "text-green-700" : "text-red-700"
                        )}>
                          {sale.status === 'completed' ? 'Finalizada' : 'Cancelada'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteSale(sale.id, e)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir Venda"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Package className="text-blue-600" size={24} />
                  Detalhes da Venda #{selectedSale.id.split('-')[0]}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Realizada em {formatDate(selectedSale.date)}</p>
              </div>
              <button 
                onClick={() => setSelectedSale(null)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</p>
                  <p className="text-sm font-bold text-slate-800">{selectedSale.customerName || 'Consumidor Final'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Método de Pagamento</p>
                  <p className="text-sm font-bold text-slate-800 uppercase">{getMethodLabel(selectedSale.paymentMethod)}</p>
                  <div className="mt-2 flex justify-end">
                    <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                        selectedSale.status === 'completed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {selectedSale.status === 'completed' ? 'Finalizada' : 'Cancelada'}
                     </span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3 text-center">Qtd</th>
                      <th className="px-4 py-3 text-right">Preço</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedSale.items.map((item, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Valor Total dos Produtos</span>
                  <span className="font-bold text-slate-700">
                    {formatCurrency(selectedSale.items.reduce((acc, i) => acc + (i.price * i.quantity), 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-red-500">
                  <span>Desconto Aplicado</span>
                  <span className="font-bold text-red-600">- {formatCurrency(selectedSale.total - selectedSale.items.reduce((acc, i) => acc + (i.price * i.quantity), 0))}</span>
                </div>
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-800">Valor Pago</span>
                  <span className="text-3xl font-black text-blue-600">{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0 w-full">
               <div className="flex gap-2">
                 {selectedSale.status === 'completed' && (
                    <button 
                      onClick={(e) => handleCancelSale(selectedSale.id, e)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <XCircle size={16} /> Cancelar Venda
                    </button>
                 )}
                 <button 
                  onClick={(e) => handleDeleteSale(selectedSale.id, e)}
                  className="px-4 py-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                 >
                   <Trash2 size={16} /> Excluir Venda
                 </button>
               </div>
              <button 
                onClick={() => setSelectedSale(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
              >
                Fechar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
