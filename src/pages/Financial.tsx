import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Plus, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  List as ListIcon
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Transaction } from '../types';

export default function Financial({ data }: { data: ReturnType<typeof useERPData> }) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    status: 'paid' as 'paid' | 'pending'
  });

  const filteredTransactions = data.transactions.filter(t => {
    const tDate = new Date(t.date);
    const isSameMonth = tDate.getMonth() === selectedDate.getMonth() && 
                       tDate.getFullYear() === selectedDate.getFullYear();
    const matchesFilter = filter === 'all' ? true : t.type === filter;
    return isSameMonth && matchesFilter;
  });

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome - totalExpense;

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const resetForm = (date?: Date) => {
    setFormData({
      type: 'income',
      category: '',
      description: '',
      value: '',
      date: (date || new Date()).toISOString().split('T')[0],
      status: 'paid'
    });
    setEditingTransaction(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value)
      };

      if (editingTransaction) {
        await data.updateTransaction(editingTransaction.id, payload);
      } else {
        await data.addTransaction(payload);
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este lançamento?')) {
      await data.deleteTransaction(id);
    }
  };

  const openEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setFormData({
      type: t.type,
      category: t.category,
      description: t.description,
      value: t.value.toString(),
      date: new Date(t.date).toISOString().split('T')[0],
      status: t.status
    });
    setIsModalOpen(true);
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  const firstDay = getFirstDayOfMonth(selectedDate.getFullYear(), selectedDate.getMonth());
  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mês Atual</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+15%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Receitas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mês Atual</span>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">-8%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Despesas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 text-white rounded-xl">
              <DollarSign size={24} />
            </div>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Saldo Líquido</span>
          </div>
          <p className="text-sm font-medium text-blue-100">Saldo Disponível</p>
          <p className="text-2xl font-black text-white mt-1">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ListIcon size={20} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'calendar' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <CalendarIcon size={20} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4 mr-2">
              <button 
                onClick={() => setFilter('all')}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  filter === 'all' ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter('income')}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  filter === 'income' ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                Entradas
              </button>
              <button 
                onClick={() => setFilter('expense')}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  filter === 'expense' ? "bg-red-600 text-white shadow-md shadow-red-100" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                Saídas
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 text-slate-600 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="px-4 py-2 text-sm font-black text-slate-700 uppercase min-w-[140px] text-center">
                {monthName}
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 text-slate-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all hover:scale-105"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Lançamento</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(t => (
                    <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(t.date)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{t.description}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{t.id.substring(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {t.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-sm font-black",
                          t.type === 'income' ? "text-emerald-600" : "text-red-600"
                        )}>
                          {t.type === 'income' ? '+' : '-'} {formatCurrency(t.value)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {t.status === 'paid' ? (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          ) : (
                            <Clock size={14} className="text-amber-500" />
                          )}
                          <span className={cn(
                            "text-[10px] font-bold uppercase",
                            t.status === 'paid' ? "text-emerald-700" : "text-amber-700"
                          )}>
                            {t.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEdit(t)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ArrowUpRight size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 text-slate-300 rounded-full">
                          <DollarSign size={40} />
                        </div>
                        <p className="text-slate-400 font-medium">Nenhum lançamento encontrado para este período.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="bg-slate-50 py-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const dayTransactions = day ? filteredTransactions.filter(t => new Date(t.date).getDate() === day) : [];
                const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
                const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
                const hasTransactions = dayTransactions.length > 0;

                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (day) {
                        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                        resetForm(date);
                        setIsModalOpen(true);
                      }
                    }}
                    className={cn(
                      "min-h-[120px] bg-white p-3 transition-all",
                      day ? "group hover:bg-slate-50 cursor-pointer" : "bg-slate-50/50"
                    )}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center transition-all",
                            hasTransactions ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-400 group-hover:bg-slate-100"
                          )}>
                            {day}
                          </span>
                          {hasTransactions && (
                            <span className="text-[10px] font-black text-slate-400">
                              {dayTransactions.length} lanc.
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {dayIncome > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              <Plus size={8} /> {formatCurrency(dayIncome)}
                            </div>
                          )}
                          {dayExpense > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                              <X size={8} /> {formatCurrency(dayExpense)}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">
                {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all",
                    formData.type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <TrendingUp size={18} /> Receita
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all",
                    formData.type === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <TrendingDown size={18} /> Despesa
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Data</label>
                  <div className="relative">
                    <CalendarIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Descrição</label>
                  <input
                    required
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Aluguel, Venda..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Valor</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={e => setFormData({ ...formData, value: e.target.value })}
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="Venda">Venda</option>
                    <option value="Serviço">Serviço</option>
                    <option value="Produtos">Produtos</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Salários">Salários</option>
                    <option value="Impostos">Impostos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Status do Pagamento</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'paid' })}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-xs font-black uppercase transition-all",
                      formData.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-500 shadow-sm" : "bg-slate-50 text-slate-400 border-2 border-transparent"
                    )}
                  >
                    Efetivado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'pending' })}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-xs font-black uppercase transition-all",
                      formData.status === 'pending' ? "bg-amber-50 text-amber-600 border-2 border-amber-500 shadow-sm" : "bg-slate-50 text-slate-400 border-2 border-transparent"
                    )}
                  >
                    Pendente
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
