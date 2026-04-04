import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Package,
  Tag,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  Scan
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, cn } from '../lib/utils';
import { Product } from '../types';

export default function Products({ data }: { data: ReturnType<typeof useERPData> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [formData, setFormData] = useState({
    barcode: '',
    costPrice: 0,
    margin: 0
  });

  const filteredProducts = data.products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const generateUniqueBarcode = () => {
    let newBarcode = '';
    let isUnique = false;
    while (!isUnique) {
      // 13-digit random numeric string (EAN-13 style)
      newBarcode = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
      isUnique = !data.products.some(p => p.barcode === newBarcode);
    }
    setFormData(prev => ({ ...prev, barcode: newBarcode }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      try {
        await data.deleteProduct(id);
      } catch (error) {
        alert('Erro ao excluir produto. Tente novamente.');
      }
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fData = new FormData(e.currentTarget);
    const costPrice = Number(formData.costPrice);
    const margin = Number(formData.margin);
    const salePrice = costPrice * (1 + margin / 100);

    const productData: Product = {
      id: editingProduct?.id || `P${Date.now()}`,
      code: fData.get('code') as string,
      barcode: formData.barcode || (fData.get('barcode') as string),
      name: fData.get('name') as string,
      description: fData.get('description') as string,
      category: fData.get('category') as string,
      brand: fData.get('brand') as string,
      supplierId: fData.get('supplierId') as string,
      costPrice,
      margin,
      salePrice,
      stock: Number(fData.get('stock')),
      minStock: Number(fData.get('minStock')),
      unit: fData.get('unit') as string,
      active: true,
      userId: data.currentUser.id,
    };

    data.saveProduct(productData);

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const salePricePreview = formData.costPrice * (1 + formData.margin / 100);

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, código ou barras..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-all font-inter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filtros
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ barcode: '', costPrice: 0, margin: 0 });
              setIsModalOpen(true);
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-all"
          >
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="aspect-video bg-slate-100 relative flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon size={48} className="text-slate-300" />
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setFormData({
                      barcode: product.barcode || '',
                      costPrice: product.costPrice || 0,
                      margin: product.margin || 0
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-red-600 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase",
                  product.stock <= product.minStock ? "bg-red-500 text-white" : "bg-blue-600 text-white"
                )}>
                  Estoque: {product.stock} {product.unit}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category}</p>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{product.name}</h3>
                </div>
                <p className="text-lg font-black text-blue-600">{formatCurrency(product.salePrice)}</p>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Tag size={14} />
                  <span>{product.code || 'S/ Código'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Layers size={14} />
                  <span>{product.brand || 'S/ Marca'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Basic Info, Pricing & Stock */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-8">
              {/* Basic Info */}
              <section>
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Nome do Produto *</label>
                    <input 
                      name="name" 
                      defaultValue={editingProduct?.name} 
                      required 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all font-inter" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Código Interno</label>
                    <input 
                      name="code" 
                      defaultValue={editingProduct?.code} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all font-inter" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Código de Barras</label>
                    <div className="flex gap-2">
                      <input
                        name="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter"
                        placeholder="Clique em Gerar ou digite..."
                      />
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2 border border-blue-200"
                      >
                        <Scan size={18} />
                        Escanear
                      </button>
                      <button
                        type="button"
                        onClick={generateUniqueBarcode}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
                      >
                        Gerar Único
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Categoria</label>
                    <select 
                      name="category" 
                      defaultValue={editingProduct?.category} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter"
                    >
                      <option>Capinhas</option>
                      <option>Películas</option>
                      <option>Cabos</option>
                      <option>Carregadores</option>
                      <option>Fones</option>
                      <option>Caixinhas de Som</option>
                      <option>Suportes</option>
                      <option>Segurança</option>
                      <option>Hardware</option>
                      <option>Acessórios</option>
                      <option>Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Marca</label>
                    <input 
                      name="brand" 
                      defaultValue={editingProduct?.brand} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter" 
                    />
                  </div>
                </div>
              </section>

              {/* Pricing & Stock */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Preços e Estoque</h3>
                  <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm flex items-center gap-3">
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Preço de Venda:</span>
                    <span className="text-xl font-black text-blue-700">{formatCurrency(salePricePreview)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Preço de Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Margem (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="margin"
                      value={formData.margin}
                      onChange={(e) => setFormData(prev => ({ ...prev, margin: Number(e.target.value) }))}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Estoque Atual</label>
                    <input 
                      type="number" 
                      name="stock" 
                      defaultValue={editingProduct?.stock || 0} 
                      required 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Mínimo</label>
                    <input 
                      type="number" 
                      name="minStock" 
                      defaultValue={editingProduct?.minStock || 0} 
                      required 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-inter" 
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-10 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Check size={18} />
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanner Modal Placeholder */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <Scan size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Scanner Ativado</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              O recurso de scanner está sendo integrado. Em breve você poderá usar a câmera para capturar códigos de barras automaticamente.
            </p>
            <button 
              onClick={() => setIsScannerOpen(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
