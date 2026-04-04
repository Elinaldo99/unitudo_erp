import React, { useState } from 'react';
import {
  Search,
  Settings,
  Plus,
  Image as ImageIcon,
  Tag,
  Package,
  MoreVertical,
  List,
  LayoutGrid
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, cn } from '../lib/utils';

export default function Inventory({ data }: { data: ReturnType<typeof useERPData> }) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = data.products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Produtos</h2>
      </div>

      {/* SEARCH + ACTIONS BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, código ou barras..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm font-inter placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
            <Settings size={18} className="text-slate-400 group-hover:text-blue-500" />
            Filtros
          </button>
          
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95">
            <Plus size={18} />
            Novo Produto
          </button>

          <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-slate-100 text-blue-600 shadow-inner" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === 'list' ? "bg-slate-100 text-blue-600 shadow-inner" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS CONTAINER */}
      <div className={cn(
        "mt-8",
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
          : "flex flex-col gap-4"
      )}>
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className={cn(
              "bg-white border border-slate-100 shadow-sm transition-all duration-300 group overflow-hidden",
              viewMode === 'grid' 
                ? "rounded-3xl hover:shadow-xl hover:-translate-y-1" 
                : "rounded-2xl hover:shadow-md flex items-center p-3 gap-6"
            )}
          >
            {/* IMAGE AREA */}
            <div className={cn(
              "bg-slate-50 relative flex flex-col items-center justify-center text-slate-300 group-hover:bg-slate-100/50 transition-colors shrink-0 overflow-hidden",
              viewMode === 'grid' ? "aspect-[4/3] w-full" : "w-20 h-20 rounded-xl"
            )}>
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={viewMode === 'grid' ? 48 : 24} strokeWidth={1.5} className="mb-2 opacity-40" />
                  {viewMode === 'grid' && <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">Imagem</span>}
                </>
              )}
              
              {/* STATUS OVERLAY (GRID ONLY) */}
              {viewMode === 'grid' && (
                <div className="absolute bottom-4 left-4">
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm",
                    product.stock <= (product.minStock || 0) 
                      ? "bg-red-500 text-white" 
                      : "bg-blue-600 text-white"
                  )}>
                    Estoque: {product.stock} {product.unit || 'UN'}
                  </div>
                </div>
              )}
              
              {viewMode === 'grid' && (
                <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600">
                  <MoreVertical size={18} />
                </button>
              )}
            </div>

            {/* CONTENT AREA */}
            <div className={cn(
              "flex-1 min-w-0",
              viewMode === 'grid' ? "p-6 pt-2" : "pr-4"
            )}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">
                {product.category || 'Outros'}
              </span>
              
              <div className={cn(
                "flex justify-between gap-4",
                viewMode === 'grid' ? "items-start mb-6" : "items-center"
              )}>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-bold text-slate-800 leading-tight group-hover:text-blue-900 transition-colors",
                    viewMode === 'grid' ? "text-sm line-clamp-2" : "text-base truncate"
                  )}>
                    {product.name}
                  </h3>
                  {viewMode === 'list' && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Tag size={10} />
                        {product.code || 'S/ Código'}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                        product.stock <= (product.minStock || 0) 
                          ? "bg-red-100 text-red-600" 
                          : "bg-blue-50 text-blue-600"
                      )}>
                        Estoque: {product.stock} {product.unit || 'UN'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "flex flex-col items-end",
                  viewMode === 'list' && "shrink-0"
                )}>
                  <span className={cn(
                    "font-black text-blue-600 whitespace-nowrap",
                    viewMode === 'grid' ? "text-sm" : "text-lg"
                  )}>
                    {formatCurrency(product.salePrice)}
                  </span>
                </div>
              </div>

              {/* GRID-ONLY FOOTER */}
              {viewMode === 'grid' && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Tag size={12} className="text-amber-400" />
                    <span>{product.code || 'S/ Código'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Package size={12} className="text-orange-400" />
                    <span>Padrão</span>
                  </div>
                </div>
              )}
            </div>

            {/* LIST-ONLY ACTION BUTTON */}
            {viewMode === 'list' && (
              <button className="p-2 mr-2 transition-colors text-slate-400 hover:text-blue-600 shrink-0">
                <MoreVertical size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
          <ImageIcon size={64} className="mb-4 opacity-10" />
          <p className="text-sm font-bold">Nenhum produto encontrado</p>
          <p className="text-xs opacity-60">Tente ajustar seus filtros de busca</p>
        </div>
      )}
    </div>
  );
}