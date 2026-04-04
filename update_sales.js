const fs = require("fs");
let c = fs.readFileSync("src/pages/Sales.tsx", "utf8");

c = c.replace(/import \{ Sale \} from \'\.\.\/types\';/, "import { Sale } from '../types';\nimport { Trash2, AlertCircle } from 'lucide-react';");

c = c.replace("  const getMethodLabel = (method: string) => {", `  const handleCancelSale = async (id: string, e?: React.MouseEvent) => {
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

  const getMethodLabel = (method: string) => {`);

c = c.replace(`<td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>`, `<td className="px-6 py-4 text-right">
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
                  </td>`);

c = c.replace(`<div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedSale(null)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2"
              >
                Fechar <ArrowRight size={16} />
              </button>
            </div>`, `<div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0 w-full">
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
            </div>`);

c = c.replace(`<div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Método de Pagamento</p>
                  <p className="text-sm font-bold text-slate-800 uppercase">{getMethodLabel(selectedSale.paymentMethod)}</p>
                </div>`, `<div className="space-y-1 text-right">
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
                </div>`);

fs.writeFileSync("src/pages/Sales.tsx", c, "utf8");
console.log("Sales.tsx updated successfully!");