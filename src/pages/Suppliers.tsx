import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Truck, 
  Mail, 
  Phone, 
  FileText,
  MoreVertical,
  Package,
  User,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { cn } from '../lib/utils';
import { Supplier } from '../types';

export default function Suppliers({ data }: { data: ReturnType<typeof useERPData> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const suppliersList = data.suppliers || [];

  const filteredSuppliers = suppliersList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.document.includes(searchTerm)
  );

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supplierData = {
      id: editingSupplier?.id,
      name: formData.get('name') as string,
      document: formData.get('document') as string,
      contact: formData.get('contact') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };

    if (data.saveSupplier) {
      await data.saveSupplier(supplierData as any);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      if (data.deleteSupplier) {
        await data.deleteSupplier(id);
      }
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
        >
          <Plus size={18} />
          Novo Fornecedor
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nome / Razão Social</label>
                  <input name="name" defaultValue={editingSupplier?.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CNPJ</label>
                  <input name="document" defaultValue={editingSupplier?.document} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingSupplier?.email} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Contato / Representante</label>
                  <input name="contact" defaultValue={editingSupplier?.contact} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Telefone</label>
                  <input name="phone" defaultValue={editingSupplier?.phone} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all">Salvar Fornecedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 truncate max-w-[150px]">{supplier.name}</h3>
                    <p className="text-xs text-slate-400">{supplier.document}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(supplier)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(supplier.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <User size={16} className="text-slate-400" />
                  <span className="truncate">Contato: {supplier.contact}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{supplier.phone || '(00) 0000-0000'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{supplier.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <button className="flex flex-col items-center gap-1 p-2 hover:bg-slate-50 rounded-lg transition-all">
                  <Package size={20} className="text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Ver Produtos</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 hover:bg-slate-50 rounded-lg transition-all">
                  <FileText size={20} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Pedidos</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredSuppliers.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
             <Truck size={48} className="text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium">Nenhum fornecedor encontrado.</p>
             <button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-bold hover:underline text-sm">Adicionar Primeiro Fornecedor</button>
          </div>
        )}
      </div>
    </div>
  );
}