const fs = require('fs');
const filepath = 'c:/Users/Elinaldo/Documents/PROJETOS/unitudo-erp/src/pages/Inventory.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// 1. Add icons to imports
content = content.replace(
  "AlertCircle",
  "AlertCircle, X"
);

// 2. Add more state inside the component
const stateUpdate = `  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entry' | 'exit'>('entry');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMovement = async () => {
    if (!selectedProductId || !quantity) {
      alert('Por favor, selecione um produto e informe a quantidade.');
      return;
    }

    setIsSaving(true);
    try {
      await data.addInventoryMovement({
        productId: selectedProductId,
        type: movementType,
        quantity: Number(quantity),
        reason: reason
      });
      setIsModalOpen(false);
      setSelectedProductId('');
      setQuantity('');
      setReason('');
    } catch (error) {
       // Error handled by hook
    } finally {
      setIsSaving(false);
    }
  };`;

content = content.replace(
  /const \[searchTerm, setSearchTerm\] = useState\(''\);\s+const \[isModalOpen, setIsModalOpen\] = useState\(false\);\s+const \[movementType, setMovementType\] = useState<'entry' \| 'exit'>\('entry'\);/,
  stateUpdate
);

// 3. Add Modal JSX before the last </div>
const modalJsx = `
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
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produto</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantidade</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 font-bold"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Motivo / Observação</label>
                <textarea 
                  placeholder="Ex: Compra de mercadoria, Avarias, Ajuste de inventário..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 min-h-[100px] resize-none"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
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
      )}`;

const lastDivIndex = content.lastIndexOf('</div>');
content = content.slice(0, lastDivIndex) + modalJsx + content.slice(lastDivIndex);

fs.writeFileSync(filepath, content);
console.log('Successfully updated Inventory.tsx UI');
