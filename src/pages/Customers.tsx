import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  MoreVertical,
  X,
  Star
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, cn } from '../lib/utils';

export default function Customers({ data }: { data: ReturnType<typeof useERPData> }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  const filteredCustomers = data.customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customerData = {
      id: editingCustomer?.id,
      name: formData.get('name') as string,
      document: formData.get('document') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      creditLimit: Number(formData.get('creditLimit')),
      points: Number(formData.get('points')),
      userId: data.currentUser.id
    };

    data.saveCustomer(customerData);
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
        >
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label>
                  <input name="name" defaultValue={editingCustomer?.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">CPF/CNPJ</label>
                  <input name="document" defaultValue={editingCustomer?.document} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Telefone</label>
                  <input name="phone" defaultValue={editingCustomer?.phone} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label>
                  <input name="email" type="email" defaultValue={editingCustomer?.email} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Endereço</label>
                  <input name="address" defaultValue={editingCustomer?.address} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Limite de Crédito</label>
                  <input name="creditLimit" type="number" step="0.01" defaultValue={editingCustomer?.creditLimit} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pontos Iniciais</label>
                  <input name="points" type="number" defaultValue={editingCustomer?.points} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{customer.name}</h3>
                    <p className="text-xs text-slate-400">{customer.document}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Limite de Crédito</p>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(customer.creditLimit)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pontos Fidelidade</p>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-500" />
                    <span className="text-sm font-bold text-slate-700">{customer.points} pts</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-3 flex justify-between items-center">
              <button className="text-xs font-bold text-blue-600 hover:underline">Histórico de Compras</button>
              <button className="text-xs font-bold text-slate-600 hover:underline">Editar Perfil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
