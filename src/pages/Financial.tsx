import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Plus, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, formatDate, cn } from '../lib/utils';

export default function Financial({ data }: { data: ReturnType<typeof useERPData> }) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = data.transactions.filter(t => 
    filter === 'all' ? true : t.type === filter
  );

  const totalIncome = data.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
  const totalExpense = data.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+15%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Receitas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">-8%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Despesas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 text-white rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-100">Saldo Disponível</p>
          <p className="text-2xl font-black text-white mt-1">{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                filter === 'all' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('income')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                filter === 'income' ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Entradas
            </button>
            <button 
              onClick={() => setFilter('expense')}
              className={cn(
                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                filter === 'expense' ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Saídas
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
              <Calendar size={18} />
              Março 2024
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md">
              <Plus size={18} />
              Lançamento
            </button>
          </div>
        </div>

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
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{t.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{t.id}</p>
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
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Download size={18} />
                    </button>
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
