import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Product, Sale, Customer, Supplier, Transaction, CashSession, UserProfile, InventoryMovement, InventoryReason, ProductCategory } from '../types';

export function useERPData(session?: Session | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [inventoryReasons, setInventoryReasons] = useState<InventoryReason[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isInitializing, setIsInitializing] = useState(true);

  // Dynamic current user with permissions check
  const dbUser = users.find(u => u.id === session?.user?.id);
  const currentUser = {
    id: session?.user?.id ?? 'U1',
    name: dbUser?.name ?? session?.user?.user_metadata?.full_name ?? session?.user?.email?.split('@')[0] ?? 'Usuário',
    role: dbUser?.role ?? 'vendedor',
    email: session?.user?.email ?? '',
    permissions: dbUser?.permissions || {
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
    }
  };

  const fetchData = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      const { data: prodData } = await supabase.from('products').select('*');
      const { data: custData } = await supabase.from('customers').select('*');
      const { data: suppData } = await supabase.from('suppliers').select('*');
      const { data: transData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      const { data: cashData } = await supabase.from('cash_sessions').select('*').eq('status', 'open').maybeSingle();
            const { data: salesData, error: salesFetchError } = await supabase.from('sales').select('*, items:sale_items(*), customers(name)').order('date', { ascending: false });
      if (salesFetchError) console.error('Sales fetch error:', salesFetchError);
      
      const { data: invMoveData } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });
      const { data: reasonsData } = await supabase.from('inventory_reasons').select('*').order('name');
      const { data: categoriesData } = await supabase.from('product_categories').select('*').order('name');

      if (prodData) {
        setProducts(prodData.map(p => ({
          id: p.id,
          code: p.code || '',
          barcode: p.barcode || '',
          name: p.name,
          description: p.description || '',
          category: p.category || '',
          brand: p.brand || '',
          supplierId: p.supplier_id || '',
          costPrice: Number(p.cost_price),
          margin: Number(p.margin),
          salePrice: Number(p.sale_price),
          stock: Number(p.stock),
          minStock: Number(p.min_stock),
          unit: p.unit || 'UN',
          active: p.active,
          image: p.image_url,
          userId: p.user_id
        })));
      }

      if (custData) {
        setCustomers(custData.map(c => ({
          id: c.id,
          name: c.name,
          document: c.document || '',
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          creditLimit: Number(c.credit_limit),
          points: Number(c.points),
          userId: c.user_id
        })));
      }

      if (suppData) {
        setSuppliers(suppData.map(s => ({
          id: s.id,
          name: s.name,
          document: s.document || '',
          contact: s.contact || '',
          email: s.email || '',
          userId: s.user_id,
          cashSessionId: s.cash_session_id
        })));
      }
      
      if (transData) {
        setTransactions(transData.map(t => ({
          id: t.id,
          type: t.type,
          category: t.category,
          description: t.description,
          value: Number(t.value),
          date: t.date,
          status: t.status
        })));
      }

      if (cashData) {
        setCashSession({
          id: cashData.id,
          openedAt: cashData.opened_at,
          closedAt: cashData.closed_at,
          initialValue: Number(cashData.initial_value),
          finalValue: cashData.final_value ? Number(cashData.final_value) : undefined,
          status: cashData.status,
          userId: cashData.user_id
        });
      } else {
        setCashSession(null);
      }

      if (invMoveData) {
        setInventoryMovements(invMoveData.map(m => ({
          id: m.id,
          date: m.created_at,
          productId: m.product_id,
          type: m.type,
          quantity: Number(m.quantity),
          reason: m.reason || '',
          userId: m.user_id
        })));
      }

      
      if (reasonsData) {
        setInventoryReasons(reasonsData.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          userId: r.user_id
        })));
      }

      if (categoriesData) {
        setProductCategories(categoriesData.map(c => ({
          id: c.id,
          name: c.name,
          userId: c.user_id
        })));
      }
      if (salesData) {
        setSales(salesData.map(s => ({
          id: s.id,
          date: s.date,
          customerId: s.customer_id,
          customerName: s.customers?.name, // From join
          items: s.items.map((i: any) => ({
            productId: i.product_id,
            name: i.name,
            quantity: Number(i.quantity),
            price: Number(i.price),
            discount: Number(i.discount)
          })),
          total: Number(s.total),
          paymentMethod: s.payment_method,
          status: s.status,
          userId: s.user_id
        })));
      }

      // 7. Profiles and Invitations
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const { data: invitationsData } = await supabase.from('invitations').select('*');
      
      let allUsers: UserProfile[] = [];

      if (profilesData) {
        const mappedProfiles: UserProfile[] = profilesData.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role as UserProfile['role'],
          status: p.status as UserProfile['status'],
          permissions: p.permissions || {
            dashboard: true,
            products: true,
            inventory: true,
            pos: true,
            sales: true,
            customers: true,
            suppliers: true,
            financial: true,
            reports: true,
            admin: false
          },
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        allUsers = [...mappedProfiles];

        // Auto-create Admin profile if it doesn't exist
        const adminEmail = 'francoinvestimentoss@gmail.com';
        if (!profilesData.some(p => p.id === session.user.id)) {
          const isAdmin = session.user.email === adminEmail;
          await supabase.from('profiles').insert({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Administrador',
            email: session.user.email,
            role: isAdmin ? 'administrador' : 'vendedor',
            status: 'ativo',
            permissions: {
               dashboard: true,
               products: true,
               inventory: true,
               pos: true,
               sales: true,
               customers: true,
               suppliers: true,
               financial: true,
               reports: true,
               admin: isAdmin
            }
          });
          allUsers.push({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Administrador',
            email: session.user.email || '',
            role: isAdmin ? 'administrador' : 'vendedor',
            status: 'ativo',
            permissions: {
               dashboard: true,
               products: true,
               inventory: true,
               pos: true,
               sales: true,
               customers: true,
               suppliers: true,
               financial: true,
               reports: true,
               admin: isAdmin
            }
          });
        }
      }

      if (invitationsData) {
        const mappedInvites: UserProfile[] = invitationsData.map(inv => ({
          id: inv.id,
          name: inv.name,
          email: inv.email,
          role: inv.role as UserProfile['role'],
          status: 'convite' as const,
          permissions: inv.permissions || {
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
          },
          createdAt: inv.created_at
        }));
        allUsers = [...allUsers, ...mappedInvites];
      }
      
      setUsers(allUsers);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase.from('transactions').insert({
        ...transaction,
        user_id: session.user.id,
        date: transaction.date || new Date().toISOString()
      });
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase.from('transactions').update(updates).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!session?.user) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const updateSaleStatus = async (id: string, status: 'completed' | 'cancelled') => {
    if (!session?.user) return;
    try {
      const { error } = await supabase.from('sales').update({ status }).eq('id', id);
      if (error) throw error;
      
      // If cancelling, and there's an associated transaction, we might want to handle it
      // For now, just refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating sale status:', error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    if (!session?.user) return;
    try {
      // sale_items will be deleted by ON DELETE CASCADE if configured, or manually
      await supabase.from('sale_items').delete().eq('sale_id', id);
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'date'>) => {
    if (!session?.user) return;

    try {
      const { data: newSaleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: sale.customerId || null,
          total: sale.total,
          discount_total: sale.discountTotal || 0,
          payment_method: sale.paymentMethod,
          payment_details: sale.paymentDetails || null,
          status: sale.status,
          user_id: session.user.id,
          cash_session_id: sale.cashSessionId || null
        })
        .select()
        .single();

      if (saleError) {
        console.error('Sale header insert error:', saleError);
        throw saleError;
      }

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(sale.items.map(item => ({
          sale_id: newSaleData.id,
          product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          user_id: session.user.id
        })));

      if (itemsError) throw itemsError;

      await supabase.from('transactions').insert({
        type: 'income',
        category: 'Venda',
        description: `Venda ${newSaleData.id}`,
        value: sale.total,
        user_id: session.user.id,
        status: 'paid'
      });

      fetchData();
    } catch (error: any) {
      console.error('Error processing sale:', error);
      alert(`Erro ao salvar venda: ${error.message || 'Verifique sua conexão e o banco de dados.'}`);
    }
  };

  const openCash = async (initialValue: number) => {
    if (!session?.user) return;
    try {
      await supabase.from('cash_sessions').insert({
        initial_value: initialValue,
        status: 'open',
        user_id: session.user.id
      });
      fetchData();
    } catch (error) {
      console.error('Error opening cash:', error);
    }
  };

  const closeCash = async (finalValue: number) => {
    if (!session?.user || !cashSession) return;
    try {
      await supabase
        .from('cash_sessions')
        .update({
          final_value: finalValue,
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', cashSession.id);
      fetchData();
    } catch (error) {
      console.error('Error closing cash:', error);
    }
  };

  
  const updateProductStock = async (productId: string, newStock: number) => {
    if (!session?.user) return;
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);
    
    if (error) throw error;
    fetchData();
  };

  const saveProduct = async (product: Omit<Product, 'id' | 'userId'> & { id?: string }) => {
    if (!session?.user) return;
    const payload = {
      code: product.code,
      barcode: product.barcode,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      supplier_id: product.supplierId || null,
      cost_price: product.costPrice,
      margin: product.margin,
      sale_price: product.salePrice,
      stock: product.stock,
      min_stock: product.minStock,
      unit: product.unit,
      active: product.active,
      image_url: product.image,
      user_id: session.user.id
    };

    if (product.id && !product.id.startsWith('P')) {
      await supabase.from('products').update(payload).eq('id', product.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    fetchData();
  };

  const saveCustomer = async (customer: Omit<Customer, 'id' | 'userId'> & { id?: string }) => {
    if (!session?.user) return;
    const payload = {
      name: customer.name,
      document: customer.document,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      credit_limit: customer.creditLimit,
      points: customer.points,
      user_id: session.user.id
    };
    if (customer.id && !customer.id.startsWith('C')) {
       await supabase.from('customers').update(payload).eq('id', customer.id);
    } else {
       await supabase.from('customers').insert(payload);
    }
    fetchData();
  };

  
  const saveSupplier = async (supplier: Omit<Supplier, 'id' | 'userId'> & { id?: string }) => {
    if (!session?.user) return;
    const payload = {
      name: supplier.name,
      document: supplier.document,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone || null,
      user_id: session.user.id
    };
    if (supplier.id && !supplier.id.startsWith('S')) {
       await supabase.from('suppliers').update(payload).eq('id', supplier.id);
    } else {
       await supabase.from('suppliers').insert(payload);
    }
    fetchData();
  };

  const deleteSupplier = async (id: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  
  

  const saveUser = async (profile: Partial<UserProfile>) => {
    if (!session?.user || !profile.id) return;

    const existingUser = users.find(u => u.id === profile.id);
    const isInvitation = existingUser?.status === 'convite';

    if (isInvitation) {
      if (profile.status && profile.status !== 'convite') {
        throw new Error("Você não pode ativar um convite manualmente. O usuário será ativado automaticamente quando fizer o primeiro login.");
      }
      const { error } = await supabase.from('invitations').update({
        name: profile.name,
        email: profile.email,
        role: profile.role,
        permissions: profile.permissions
      }).eq('id', profile.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        permissions: profile.permissions,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
    }
    fetchData();
  };

  const createInvite = async (invite: { email: string; name: string; password: string; role: UserProfile['role']; permissions: UserProfile['permissions'] }) => {
    if (!session?.user) return;
    const { error } = await supabase.from('invitations').insert({
      email: invite.email,
      name: invite.name,
      temporary_password: invite.password,
      role: invite.role,
      permissions: invite.permissions,
      created_by: session.user.id
    });
    if (error) throw error;
    fetchData();
  };

  const deleteUser = async (id: string) => {
    if (!session?.user) return;
    if (session.user.id === id) {
       alert("Você não pode excluir seu próprio perfil.");
       return;
    }

    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.status === 'convite') {
      const { error } = await supabase.from('invitations').delete().eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    }
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  const addInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'date' | 'userId'>) => {
    if (!session?.user) return;
    
    try {
      // 1. Get current stock
      const product = products.find(p => p.id === movement.productId);
      if (!product) throw new Error('Produto n�o encontrado');

      const newStock = movement.type === 'entry' 
        ? product.stock + movement.quantity 
        : product.stock - movement.quantity;

      if (newStock < 0) throw new Error('Saldo insuficiente em estoque');

      // 2. Insert movement
      const { error: moveError } = await supabase.from('inventory_movements').insert({
        product_id: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        user_id: session.user.id
      });
      if (moveError) throw moveError;

      // 3. Update product stock
      const { error: prodError } = await supabase.from('products').update({ stock: newStock }).eq('id', movement.productId);
      if (prodError) throw prodError;

      fetchData();
    } catch (error: any) {
      console.error('Error adding inventory movement:', error);
      alert(error.message || 'Erro ao processar movimenta��o de estoque');
    }
  };

  
  const addInventoryReason = async (name: string, type: 'entry' | 'exit' | 'both' = 'both') => {
    if (!session?.user) return;
    const { data, error } = await supabase.from('inventory_reasons').insert({
      name,
      type,
      user_id: session.user.id
    }).select().single();
    if (error) throw error;
    fetchData();
    return data;
  };

  const saveProductCategory = async (name: string, id?: string): Promise<ProductCategory | null> => {
    if (!session?.user) return null;
    if (id) {
      const { data, error } = await supabase
        .from('product_categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      fetchData();
      return data ? { id: data.id, name: data.name, userId: data.user_id } : null;
    } else {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({ name, user_id: session.user.id })
        .select()
        .single();
      if (error) throw error;
      fetchData();
      return data ? { id: data.id, name: data.name, userId: data.user_id } : null;
    }
  };

  const deleteProductCategory = async (id: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) throw error;
    fetchData();
  };

  return {
    products, saveProduct, deleteProduct, updateProductStock, 
    suppliers, saveSupplier, deleteSupplier,
    inventoryMovements, addInventoryMovement, 
    inventoryReasons, addInventoryReason,
    productCategories, saveProductCategory, deleteProductCategory,
    sales, addSale, updateSaleStatus, deleteSale,
    customers, saveCustomer,
    transactions, addTransaction, updateTransaction, deleteTransaction,
    cashSession, openCash, closeCash,
    users, saveUser, deleteUser, createInvite,
    currentUser,
    isLoading
  };
}
