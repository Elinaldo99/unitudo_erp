import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import POS from './pages/POS';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Financial from './pages/Financial';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

import { useERPData } from './hooks/useERPData';
import { UserPermissions } from './types';
import Inventory from './pages/Inventory';

type TabId = 'dashboard' | 'products' | 'inventory' | 'pos' | 'sales' | 'customers' | 'suppliers' | 'financial' | 'reports' | 'admin';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
  category: 'Administrativo' | 'Cadastros' | 'Comercial' | 'Estoque' | 'Financeiro' | 'Relatórios';
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Administrativo' },
  { id: 'admin', label: 'Usuários', icon: Settings, category: 'Administrativo' },
  { id: 'products', label: 'Produtos', icon: Package, category: 'Cadastros' },
  { id: 'customers', label: 'Clientes', icon: Users, category: 'Cadastros' },
  { id: 'suppliers', label: 'Fornecedores', icon: Truck, category: 'Cadastros' },
  { id: 'pos', label: 'PDV (Caixa)', icon: ShoppingCart, category: 'Comercial' },
  { id: 'sales', label: 'Vendas', icon: BarChart3, category: 'Comercial' },
  { id: 'inventory', label: 'Estoque', icon: Package, category: 'Estoque' },
  { id: 'financial', label: 'Financeiro', icon: DollarSign, category: 'Financeiro' },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, category: 'Relatórios' },
];

const categories = ['Administrativo', 'Cadastros', 'Comercial', 'Estoque', 'Financeiro', 'Relatórios'] as const;

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = loading
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const erpData = useERPData(session);

  // Filter tabs based on user permissions
  const filteredTabs = tabs.filter(tab => {
    // Admin tab is special - only for 'administrador' role or if explicitly permitted
    if (tab.id === 'admin') {
      return erpData.currentUser.role === 'administrador' || erpData.currentUser.permissions?.admin;
    }
    // Dashboard is always visible by default unless explicitly disabled
    if (tab.id === 'dashboard') return erpData.currentUser.permissions?.dashboard ?? true;

    // Check other modules
    return erpData.currentUser.permissions?.[tab.id as keyof UserPermissions] ?? true;
  });

  // Ensure active tab is allowed, otherwise redirect to dashboard or first available
  useEffect(() => {
    if (session && !erpData.isLoading) {
      const isAllowed = filteredTabs.some(t => t.id === activeTab);
      if (!isAllowed && filteredTabs.length > 0) {
        setActiveTab(filteredTabs[0].id);
      }
    }
  }, [activeTab, filteredTabs, session, erpData.isLoading]);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Still loading initial session
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>U</div>
        <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite', color: '#94a3b8' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not authenticated → show Auth screen
  if (!session) {
    return (
      <AnimatePresence>
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Auth />
        </motion.div>
      </AnimatePresence>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard data={erpData} />;
      case 'products': return <Products data={erpData} />;
      case 'inventory': return <Inventory data={erpData} />;
      case 'pos': return <POS data={erpData} />;
      case 'sales': return <Sales data={erpData} />;
      case 'customers': return <Customers data={erpData} />;
      case 'suppliers': return <Suppliers data={erpData} />;
      case 'financial': return <Financial data={erpData} />;
      case 'reports': return <Reports data={erpData} />;
      case 'admin': return <Admin data={erpData} />;
      default: return <Dashboard data={erpData} />;
    }
  };

  const activeCategory = filteredTabs.find(t => t.id === activeTab)?.category;

  return (
    <AnimatePresence>
      <motion.div
        key="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900"
      >
        {/* Loading Overlay */}
        {erpData.isLoading && (
          <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-blue-900 animate-pulse">Sincronizando com Supabase...</p>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
              <span className="font-bold text-xl tracking-tight text-blue-900">UniTudo <span className="text-slate-400 font-normal">ERP</span></span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-slate-100 px-3 py-1.5 rounded-full gap-2 w-64 border border-transparent focus-within:border-blue-300 transition-all">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Pesquisar..." className="bg-transparent border-none outline-none text-sm w-full" />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-none">{erpData.currentUser.name}</p>
                  <p className="text-xs text-slate-500 mt-1 capitalize">{erpData.currentUser.role}</p>
                </div>
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-slate-300">
                  <UserIcon size={20} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-64px)] overflow-y-auto"
              >
                <nav className="p-4 space-y-6">
                  {categories.map(category => {
                    const categoryTabs = filteredTabs.filter(t => t.category === category);
                    if (categoryTabs.length === 0) return null;

                    return (
                      <div key={category} className="space-y-1">
                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 mb-2">
                          {category}
                        </h3>
                        {categoryTabs.map(tab => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                activeTab === tab.id
                                  ? "bg-blue-50 text-blue-700 shadow-sm"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              <Icon size={18} className={cn(
                                activeTab === tab.id ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                              )} />
                              {tab.label}
                              {activeTab === tab.id && (
                                <motion.div
                                  layoutId="active-indicator"
                                  className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </nav>

                <div className="mt-auto p-4 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={18} />
                    Sair do Sistema
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    <span>UniTudo ERP</span>
                    <span>/</span>
                    <span className="text-blue-600">{activeCategory}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full animate-pulse",
                      erpData.cashSession?.status === 'open' ? "bg-green-500" : "bg-red-500"
                    )}></div>
                    <span className="text-sm font-medium text-slate-700">
                      Caixa: {erpData.cashSession?.status === 'open' ? "Aberto" : "Fechado"}
                    </span>
                  </div>
                </div>
              </header>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
