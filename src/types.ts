export interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  supplierId: string;
  costPrice: number;
  margin: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
  image?: string;
  userId: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId?: string;
  items: SaleItem[];
  total: number;
  discountTotal?: number;
  paymentMethod: 'money' | 'card' | 'pix' | 'mixed' | 'store_credit';
  paymentDetails?: {
    cardType?: 'credit' | 'debit';
    installments?: number;
  };
  status: 'completed' | 'cancelled' | 'pending';
  userId: string;
  cashSessionId?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  phone?: string;
  email: string;
  address: string;
  creditLimit: number;
  points: number;
  userId: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  contact: string;
  email: string;
  phone?: string;
  userId: string;
}

export interface UserPermissions {
  dashboard: boolean;
  products: boolean;
  inventory: boolean;
  pos: boolean;
  sales: boolean;
  customers: boolean;
  suppliers: boolean;
  financial: boolean;
  reports: boolean;
  admin: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'administrador' | 'gerente' | 'vendedor';
  status: 'ativo' | 'inativo';
  permissions: UserPermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invitation {
  id: string;
  email: string;
  phone?: string;
  name: string;
  temporary_password?: string;
  role: UserProfile['role'];
  permissions: UserPermissions;
  createdAt?: string;
}

export interface CashSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  initialValue: number;
  finalValue?: number;
  userId: string;
  status: 'open' | 'closed';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  value: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface InventoryMovement {
  id: string;
  date: string;
  productId: string;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
  userId: string;
}

export type UserRole = 'admin' | 'manager' | 'seller';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
}

export interface InventoryReason {
  id: string;
  name: string;
  type: 'entry' | 'exit' | 'both';
  userId: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  userId: string;
}
