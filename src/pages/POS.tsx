import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  X, 
  User as UserIcon, 
  Calculator, 
  Package,
  Loader2,
  Tag,
  List,
  LayoutGrid
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { formatCurrency, cn } from '../lib/utils';
import { Product, SaleItem } from '../types';

export default function POS({ data }: { data: ReturnType<typeof useERPData> }) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'card' | 'pix' | 'store_credit'>('money');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [discountType, setDiscountType] = useState<'value' | 'percent'>('value');
  const [discountInput, setDiscountInput] = useState('0');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (!data.isLoading && (!data.cashSession || data.cashSession.status === 'closed')) {
      setIsCashModalOpen(true);
    } else {
      setIsCashModalOpen(false);
    }
  }, [data.isLoading, data.cashSession]);
  const [initialCashValue, setInitialCashValue] = useState('0');

  const filteredProducts = data.products.filter(p => 
    p.active && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.barcode.includes(searchTerm) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Produto sem estoque!');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.salePrice,
        discount: 0
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        const product = data.products.find(p => p.id === productId);
        if (product && newQty > product.stock) {
          alert('Quantidade excede o estoque disponível!');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = discountType === 'percent' 
    ? subtotal * (Number(discountInput) / 100)
    : Number(discountInput);
  const total = Math.max(0, subtotal - discountAmount);
  const change = Number(receivedAmount) > total ? Number(receivedAmount) - total : 0;

  const handleFinishSale = () => {
    if (paymentMethod === 'store_credit' && !selectedCustomerId) {
      alert('Selecione um cliente para venda no crediário!');
      return;
    }

    data.addSale({
      items: cart,
      total,
      discountTotal: discountAmount,
      customerId: selectedCustomerId || undefined,
      paymentMethod,
      paymentDetails: paymentMethod === 'card' ? { cardType } : undefined,
      status: 'completed',
      userId: data.currentUser.id
    });
    setCart([]);
    setIsCheckoutOpen(false);
    setReceivedAmount('');
    setDiscountInput('0');
    setSelectedCustomerId(null);
  };

  if (data.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (false) { return null; }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col lg:flex-row gap-6">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar produto por nome ou código..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">
            <Calculator size={20} />
          </button>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'grid' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className={cn(
          "flex-1 overflow-y-auto pr-2",
          viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"
        )}>
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className={cn(
                "bg-white border shadow-sm transition-all text-left group",
                viewMode === 'grid' 
                  ? "p-4 rounded-xl border-slate-200 hover:border-blue-400 hover:shadow-md flex flex-col h-full"
                  : "p-3 rounded-xl border-slate-200 hover:border-blue-400 hover:shadow-md flex items-center gap-4"
              )}
            >
              <div className={cn(
                "bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-300 transition-colors border border-slate-100 overflow-hidden",
                viewMode === 'grid' ? "aspect-square rounded-lg mb-3 w-full" : "w-14 h-14 rounded-lg"
              )}>
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package size={viewMode === 'grid' ? 32 : 24} />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{product.category}</p>
                <h4 className={cn(
                  "font-bold text-slate-800 text-sm",
                  viewMode === 'grid' ? "line-clamp-2" : "truncate"
                )}>{product.name}</h4>
                {viewMode === 'list' && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-bold">
                    <Tag size={10} className="text-amber-400" />
                    {product.code || 'S/ Código'}
                  </p>
                )}
              </div>

              <div className={cn(
                "flex flex-col gap-1.5",
                viewMode === 'grid' ? "mt-3 flex-row items-center justify-between" : "items-end ml-auto"
              )}>
                <span className="text-blue-600 font-black text-base">{formatCurrency(product.salePrice)}</span>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  product.stock <= product.minStock ? "bg-red-500 text-white shadow-sm" : "bg-slate-100 text-slate-500"
                )}>
                  {viewMode === 'grid' ? 'Qtd: ' : 'Estoque: '}{product.stock}
                </span>
              </div>
              
              {viewMode === 'list' && (
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                  <Plus size={18} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-full lg:w-96 flex flex-col gap-4 min-h-0">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Carrinho</h3>
            </div>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} itens
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <ShoppingCart size={48} className="mb-4" />
                <p className="text-sm font-medium">Carrinho vazio</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex items-center gap-3 group">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.price)} cada</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-white hover:shadow-sm rounded transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-white hover:shadow-sm rounded transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {/* Discount Section */}
            <div className="space-y-2 py-3 border-y border-slate-200 border-dashed">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aplicar Desconto</span>
                <div className="flex bg-slate-200 p-0.5 rounded-lg">
                  <button 
                    onClick={() => setDiscountType('value')}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                      discountType === 'value' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    R$
                  </button>
                  <button 
                    onClick={() => setDiscountType('percent')}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                      discountType === 'percent' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    %
                  </button>
                </div>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-blue-400"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {discountType === 'percent' ? '%' : 'R$'}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-red-500 italic">
                  <span>Total Desconto:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-slate-800">Total</span>
              <span className="text-2xl font-black text-blue-600">{formatCurrency(total)}</span>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex flex-col md:flex-row h-full">
              {/* Summary */}
              <div className="bg-slate-50 p-8 md:w-80 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto max-h-[90vh]">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-500" />
                  Concluir Venda
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Desconto</span>
                    <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total a Pagar</p>
                    <p className="text-3xl font-black text-blue-600">{formatCurrency(total)}</p>
                  </div>

                  <div className="pt-8 border-t border-slate-200">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cliente (Opcional)</label>
                    <select 
                      value={selectedCustomerId || ''}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 shadow-sm"
                    >
                      <option value="">Consumidor Final</option>
                      {data.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Método de Pagamento</h3>
                  <button 
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setSelectedCustomerId(null);
                    }} 
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  <PaymentBtn 
                    active={paymentMethod === 'money'} 
                    onClick={() => setPaymentMethod('money')}
                    icon={Banknote}
                    label="Dinheiro"
                  />
                  <PaymentBtn 
                    active={paymentMethod === 'card'} 
                    onClick={() => setPaymentMethod('card')}
                    icon={CreditCard}
                    label="Cartão"
                  />
                  <PaymentBtn 
                    active={paymentMethod === 'pix'} 
                    onClick={() => setPaymentMethod('pix')}
                    icon={QrCode}
                    label="Pix"
                  />
                  <PaymentBtn 
                    active={paymentMethod === 'store_credit'} 
                    onClick={() => setPaymentMethod('store_credit')}
                    icon={UserIcon}
                    label="Crediário"
                  />
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                  {paymentMethod === 'money' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Valor Recebido</label>
                        <input 
                          type="number" 
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(e.target.value)}
                          placeholder="0,00"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xl font-bold outline-none focus:border-blue-400 shadow-sm"
                        />
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                        <span className="text-sm font-bold text-blue-700">Troco:</span>
                        <span className="text-xl font-black text-blue-800">{formatCurrency(change)}</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold text-slate-500 mb-1 text-center">Tipo de Transação</label>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setCardType('credit')}
                          className={cn(
                            "flex-1 py-4 rounded-xl font-bold border-2 transition-all",
                            cardType === 'credit' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-500"
                          )}
                        >
                          Crédito
                        </button>
                        <button 
                          onClick={() => setCardType('debit')}
                          className={cn(
                            "flex-1 py-4 rounded-xl font-bold border-2 transition-all",
                            cardType === 'debit' ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-500"
                          )}
                        >
                          Débito
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'store_credit' && (
                    <div className="text-center p-4">
                      <div className="bg-yellow-100 p-4 rounded-xl mb-4 text-yellow-800 text-sm font-medium">
                        {selectedCustomerId 
                          ? `Venda será vinculada ao limite de crédito do cliente.`
                          : `Selecione um cliente para habilitar o crediário.`}
                      </div>
                      <UserIcon size={48} className="mx-auto text-slate-300 mb-2" />
                    </div>
                  )}

                  {paymentMethod === 'pix' && (
                    <div className="text-center p-4">
                      <QrCode size={64} className="mx-auto text-blue-600 mb-4" />
                      <p className="text-sm text-slate-500 font-medium">Escaneie o QR Code ou confirme após receber o pagamento.</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleFinishSale}
                  className="w-full py-5 bg-green-600 text-white rounded-2xl font-bold text-xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <CheckCircle2 size={24} />
                  Finalizar Venda {formatCurrency(total)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
        active 
          ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm" 
          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
      )}
    >
      <Icon size={24} />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
