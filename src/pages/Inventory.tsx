import React, { useState } from 'react';
import {
  Search,
  Settings,
  Plus,
  Image as ImageIcon,
  Tag,
  Package,
  MoreVertical
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, cn } from '../lib/utils';

export default function Inventory({ data }: { data: ReturnType<typeof useERPData> }) {
  const [search, setSearch] = useState('');

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
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
            {/* IMAGE AREA */}
            <div className="aspect-[4/3] bg-slate-50 relative flex flex-col items-center justify-center text-slate-300 group-hover:bg-slate-100/50 transition-colors">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon size={48} strokeWidth={1.5} className="mb-2 opacity-40" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40">Imagem</span>
                </>
              )}
              
              {/* STATUS OVERLAY */}
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
              
              <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="p-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">
                {product.category || 'Outros'}
              </span>
              
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 text-sm group-hover:text-blue-900 transition-colors">
                  {product.name}
                </h3>
                <span className="text-sm font-black text-blue-600 whitespace-nowrap">
                  {formatCurrency(product.salePrice)}
                </span>
              </div>

              {/* FOOTER DETAILS */}
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
            </div>
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