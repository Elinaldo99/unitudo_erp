import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { cn } from '../lib/utils';
import { UserProfile, UserPermissions } from '../types';

export default function Admin({ data }: { data: ReturnType<typeof useERPData> }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<UserProfile['permissions']>({
    dashboard: true,
    products: false,
    inventory: false,
    pos: true,
    sales: false,
    customers: false,
    suppliers: false,
    financial: false,
    reports: false,
    admin: false
  });

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setPermissions(user.permissions);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setPermissions({
      dashboard: true,
      products: false,
      inventory: false,
      pos: true,
      sales: false,
      customers: false,
      suppliers: false,
      financial: false,
      reports: false,
      admin: false
    });
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (key: keyof UserProfile['permissions']) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserProfile['role'];
    const status = formData.get('status') as UserProfile['status'];
    const password = formData.get('password') as string;

    try {
      if (editingUser) {
        // Atualizar perfil existente
        await data.saveUser({
          id: editingUser.id,
          name,
          email,
          role,
          status,
          permissions
        });
      } else {
        // Criar novo convite
        await data.createInvite({
          name,
          email,
          password,
          role,
          permissions
        });
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || 'Erro ao salvar usuário.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await data.deleteUser(id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck },
    { id: 'products', label: 'Produtos', icon: Lock },
    { id: 'inventory', label: 'Estoque', icon: Lock },
    { id: 'pos', label: 'PDV (Caixa)', icon: Lock },
    { id: 'sales', label: 'Vendas', icon: Lock },
    { id: 'customers', label: 'Clientes', icon: User },
    { id: 'suppliers', label: 'Fornecedores', icon: Lock },
    { id: 'financial', label: 'Financeiro', icon: Lock },
    { id: 'reports', label: 'Relatórios', icon: Lock },
    { id: 'admin', label: 'Administrativo (Usuários)', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-4 max-w-2xl">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-900">Controle de Acesso</h3>
            <p className="text-sm text-blue-700">Gerencie usuários e defina exatamente quais módulos cada um poderá acessar.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Nível de Acesso</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-slate-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 capitalize">{user.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {user.status === 'ativo' ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      user.status === 'ativo' ? "text-green-700" : "text-red-700"
                    )}>
                      {user.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário (Convite)'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="overflow-y-auto p-6 space-y-6 flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    Dados Básicos
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="name"
                        type="text"
                        defaultValue={editingUser?.name}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Ex: João da Silva"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        name="email"
                        type="email"
                        defaultValue={editingUser?.email}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>

                  {!editingUser && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Senha Inicial</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          name="password"
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Escolha uma senha para o funcionário"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nível de Acesso</label>
                      <select
                        name="role"
                        defaultValue={editingUser?.role || 'vendedor'}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="administrador">Administrador</option>
                        <option value="gerente">Gerente</option>
                        <option value="vendedor">Vendedor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                      <select
                        name="status"
                        defaultValue={editingUser?.status || 'ativo'}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permissions Area */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-600" />
                    Permissões de Módulo
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    {modules.map(({ id, label, icon: Icon }) => (
                      <label key={id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl transition-all cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={permissions[id as keyof UserPermissions]}
                          onChange={() => handlePermissionToggle(id as keyof UserPermissions)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                    <strong className="block mb-1">Como funciona a criação?</strong>
                    Ao criar o perfil, você define a senha. O funcionário deverá logar com esses dados no primeiro acesso. Ninguém pode se cadastrar livremente pelo site.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar e Convidar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
