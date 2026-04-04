const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/pages/Inventory.tsx';

const newContent = `import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCw, 
  Search, 
  Plus, 
  History,
  AlertCircle, X
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, formatDate, cn } from '../lib/utils';

export default function Inventory({ data }: { data: ReturnType<typeof useERPData> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entry' | 'exit'>('entry');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isAddingNewReason, setIsAddingNewReason] = useState(false);
  const [newReasonName, setNewReasonName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMovement = async () => {
    if (!selectedProductId || !quantity) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }

    let finalReason = reason;
    
    // If user is adding a new reason, save it first
    if (isAddingNewReason && newReasonName.trim()) {
      try {
        const savedReason = await data.addInventoryReason(newReasonName.trim(), movementType);
        finalReason = newReasonName.trim();
      } catch (error) {
        console.error('Erro ao salvar novo motivo:', error);
      }
    }

    if (!finalReason) {
      alert('Por favor, informe ou selecione um motivo.');
      return;
    }

    setIsSaving(true);
    try {
      await data.addInventoryMovement({
        productId: selectedProductId,
        type: movementType,
        quantity: Number(quantity),
        reason: finalReason
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
       // Error handled by hook
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setQuantity('');
    setReason('');
    setIsAddingNewReason(false);
    setNewReasonName('');
  };

  const lowStock = data.products.filter(p => p.stock <= p.minStock);
  const filteredReasons = data.inventoryReasons.filter(r => r.type === movementType || r.type === 'both');

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Itens</p>
            <p className="text-2xl font-bold text-slate-800">{data.products.reduce((acc, p) => acc + p.stock, 0)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Estoque Baixo</p>
            <p className="text-2xl font-bold text-slate-800">{lowStock.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Valor em Estoque</p>
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(data.products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => { setMovementType('entry'); setIsModalOpen(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
          >
            <ArrowUpCircle size={18} />
            Entrada
          </button>
          <button 
            onClick={() => { setMovementType('exit'); setIsModalOpen(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all"
          >
            <ArrowDownCircle size={18} />
            Saída
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Estoque Atual</th>
              <th className="px-6 py-4">Estoque Mínimo</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.brand}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{product.code}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{product.category}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "font-bold",
                    product.stock <= product.minStock ? "text-red-600" : "text-slate-900"
                  )}>
                    {product.stock} {product.unit}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{product.minStock} {product.unit}</td>
                <td className="px-6 py-4">
                  {product.stock <= product.minStock ? (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                      Crítico
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                      Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={cn(
              "p-6 border-b border-slate-100 flex items-center justify-between",
              movementType === 'entry' ? "bg-emerald-50/50" : "bg-red-50/50"
            )}>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {movementType === 'entry' ? (
                  <ArrowUpCircle className="text-emerald-600" size={24} />
                ) : (
                  <ArrowDownCircle className="text-red-600" size={24} />
                )}
                {movementType === 'entry' ? 'Entrada de Estoque' : 'Saída de Estoque'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-800">Produto</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 text-slate-800"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="">Selecione um produto...</option>
                  {data.products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stock} {p.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-800">Quantidade</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 font-bold text-slate-800"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-800">Motivo</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 text-slate-800"
                    value={isAddingNewReason ? 'new' : reason}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setIsAddingNewReason(true);
                      } else {
                        setIsAddingNewReason(false);
                        setReason(e.target.value);
                      }
                    }}
                    disabled={isSaving}
                  >
                    <option value="">Selecione um motivo...</option>
                    {filteredReasons.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                    <option value="new">+ Criar Novo Motivo...</option>
                  </select>
                </div>
              </div>

              {isAddingNewReason && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Nome do Novo Motivo</label>
                  <input 
                    type="text"
                    placeholder="Ex: Doação, Teste de Qualidade..."
                    className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-400 font-medium text-slate-800"
                    value={newReasonName}
                    onChange={(e) => setNewReasonName(e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={() => setIsAddingNewReason(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 underline"
                  >
                    Cancelar novo motivo
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-6 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-all"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveMovement}
                disabled={isSaving}
                className={cn(
                  "px-8 py-2 text-white rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                  movementType === 'entry' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" : "bg-red-600 hover:bg-red-700 shadow-red-200"
                )}
              >
                {isSaving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
\`;

fs.writeFileSync(filepath, newContent, 'utf8');
console.log('Successfully updated Inventory.tsx with fixed encoding and reasons feature');
