/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Grid, List, ShoppingCart, MapPin, Instagram, Phone, 
  Clock, ChevronRight, Plus, Minus, Trash2, X, Send, Sparkles, 
  Lock, ArrowRight, Eye, ShieldAlert, BadgePercent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, CartItem, SelectedVariation, StoreSettings, Order } from '../types';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onEnterAdmin: () => void;
  onAddOrder?: (order: Order) => void;
}

export default function CatalogView({ products, categories, settings, onEnterAdmin, onAddOrder }: CatalogViewProps) {
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductVars, setSelectedProductVariations] = useState<SelectedVariation[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartProductQuantity, setCartProductQuantity] = useState(1);

  // Checkout form
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('pickup');
  const [clientAddress, setClientAddress] = useState('');
  const [orderObservation, setOrderObservation] = useState('');

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategoryId === 'ALL' || product.category === selectedCategoryId;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && product.isActive;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Total calculation
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.product.promoPrice ?? item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  }, [cart]);

  const deliveryFee = deliveryType === 'delivery' ? settings.deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  // Add to cart logic
  const handleOpenProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCartProductQuantity(1);
    // Initialize default variations
    if (product.variations) {
      const defaultVars = product.variations.map(v => ({
        name: product.variations?.[0]?.name ?? 'Opção',
        value: v.options[0]
      }));
      setSelectedProductVariations(defaultVars);
    } else {
      setSelectedProductVariations([]);
    }
  };

  const handleSelectVariationValue = (varName: string, value: string) => {
    setSelectedProductVariations(prev => {
      const existing = prev.find(item => item.name === varName);
      if (existing) {
        return prev.map(item => item.name === varName ? { ...item, value } : item);
      }
      return [...prev, { name: varName, value }];
    });
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    setCart(prevCart => {
      // Find identical item (same product ID AND same selected variations)
      const existingIndex = prevCart.findIndex(item => {
        if (item.product.id !== selectedProduct.id) return false;
        if (item.selectedVariations.length !== selectedProductVars.length) return false;
        return item.selectedVariations.every(v => 
          selectedProductVars.find(sv => sv.name === v.name && sv.value === v.value)
        );
      });

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += cartProductQuantity;
        return updatedCart;
      }

      return [...prevCart, {
        product: selectedProduct,
        quantity: cartProductQuantity,
        selectedVariations: [...selectedProductVars]
      }];
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const updateCartItemQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  const removeCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Order via WhatsApp & Save Local Order History
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, preencha seu Nome e Telefone para concluir!');
      return;
    }
    if (deliveryType === 'delivery' && !clientAddress.trim()) {
      alert('Por favor, preencha o Endereço para entrega!');
      return;
    }

    const orderId = 'TAB-' + Math.floor(Math.random() * 900000 + 100000);
    
    // 1. Create order object
    const newOrder: Order = {
      id: orderId,
      clientName,
      clientPhone,
      deliveryType,
      address: deliveryType === 'delivery' ? clientAddress : '',
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.promoPrice ?? item.product.price,
        quantity: item.quantity,
        selectedVariations: item.selectedVariations
      })),
      subtotal: cartSubtotal,
      deliveryFee: deliveryFee || 0,
      total: cartTotal,
      paymentMethod: 'A combinar',
      status: 'pending',
      createdAt: new Date().toISOString(),
      observation: orderObservation || ''
    };

    // 2. Save Order to localStorage & Backend Server (so owner sees it in "Gestor")
    const existingOrdersStr = localStorage.getItem('tabasgestion_orders');
    const existingOrders: Order[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
    localStorage.setItem('tabasgestion_orders', JSON.stringify([newOrder, ...existingOrders]));
    if (onAddOrder) {
      onAddOrder(newOrder);
    }

    // 3. Format WhatsApp Message
    let message = `🛒 *PEDIDO NOVO - ${settings.storeName}* (Ref: #${orderId})\n\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    message += `📞 *Telefone:* ${clientPhone}\n`;
    message += `📍 *Retirada/Entrega:* ${deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada na Loja'}\n`;
    if (deliveryType === 'delivery') {
      message += `🏠 *Endereço:* ${clientAddress}\n`;
    }
    if (orderObservation.trim()) {
      message += `📝 *Observação:* "${orderObservation}"\n`;
    }
    message += `\n📦 *ITENS DO PEDIDO:*\n`;

    cart.forEach(item => {
      const price = item.product.promoPrice ?? item.product.price;
      const vars = item.selectedVariations.length > 0 
        ? ` (${item.selectedVariations.map(v => `${v.name}: ${v.value}`).join(', ')})`
        : '';
      message += `• ${item.quantity}x ${item.product.name}${vars} - R$ ${(price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    message += `\n💵 *Subtotal:* R$ ${cartSubtotal.toFixed(2).replace('.', ',')}\n`;
    if (deliveryType === 'delivery') {
      message += `🛵 *Taxa de Entrega:* R$ ${settings.deliveryFee.toFixed(2).replace('.', ',')}\n`;
    }
    message += `💰 *TOTAL:* R$ ${cartTotal.toFixed(2).replace('.', ',')}\n\n`;
    message += `*A combinar pagamento diretamente no WhatsApp.* Obrigado!`;

    // Encode URL and redirect
    const cleanPhone = settings.phone.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    // Clear cart and state
    setCart([]);
    setIsCartOpen(false);
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setOrderObservation('');

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  // Scroll categories
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesContainerRef.current) {
      const scrollAmount = 200;
      categoriesContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-500 selection:text-neutral-950">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur border-b border-neutral-800/80 px-4 py-3.5 shadow-lg">
        <div className="max-w-full w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center font-black text-neutral-950 text-lg tracking-wider shadow-lg shadow-purple-500/20">
              TG
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">TabasGestion</span>
              <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Catálogo Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Go to Manager Button */}
            <button
              onClick={onEnterAdmin}
              className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-850 hover:border-neutral-700 transition-all text-neutral-300 hover:text-white"
              title="Acessar Gerenciamento de Vendas"
              id="btn-goto-manager"
            >
              <Lock className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Painel do Gestor</span>
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 transition-colors border border-neutral-800 text-neutral-300 hover:text-white"
              id="btn-cart-trigger"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-neutral-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner / Subtitle */}
      <section className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-900 py-8 px-6 text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(168,85,247,0.06),transparent_60%)] pointer-events-none" />
        <div className="max-w-full w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-purple-500/15">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Premium Smoke Shop & Headshop
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              TabasGestion
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-3xl">
              O catálogo mais completo de sedas, cases, kits, dichavadores e acessórios. Monte seu carrinho e envie seu pedido diretamente no nosso WhatsApp.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Layout Section */}
      <main className="flex-1 max-w-full w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Desktop only (1024px+) */}
        <aside className="hidden lg:block w-72 shrink-0 space-y-6">
          
          {/* Business Info Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-3 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Tabacaria Oficial
            </h3>
            <ul className="space-y-4 text-sm text-neutral-300">
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-purple-500 shrink-0" />
                <div className="break-all">
                  <span className="text-xs text-neutral-500 block">WhatsApp</span>
                  <a href={`https://wa.me/${settings.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors font-medium">
                    {settings.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Instagram className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <span className="text-xs text-neutral-500 block">Instagram</span>
                  <a href={`https://instagram.com/${settings.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors font-medium">
                    {settings.instagram}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <span className="text-xs text-neutral-500 block">Endereço</span>
                  <span className="text-xs leading-relaxed text-neutral-400">{settings.address}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <span className="text-xs text-neutral-500 block">Prazo de Retirada</span>
                  <span className="text-xs text-neutral-400">{settings.pickupTime}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Categories List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-3 mb-4">
              Categorias
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryId('ALL')}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  selectedCategoryId === 'ALL'
                    ? 'bg-purple-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
                id="cat-sidebar-inicio"
              >
                <span>🚀 Início / Tudo</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategoryId === cat.id
                      ? 'bg-purple-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  id={`cat-sidebar-${cat.id}`}
                >
                  <span className="truncate">{cat.name}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content Area: Filters, Search, and Products */}
        <section className="flex-1 min-w-0 space-y-6">
          
          {/* Controls Bar: Search Input, Category Slider, Grid/List Toggles */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-5 h-5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Pesquisar produto ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-950 text-white placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-purple-500 text-sm focus:ring-1 focus:ring-purple-500 transition-all"
                  id="catalog-search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-neutral-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* View Grid vs List toggle */}
              <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                <span className="text-xs text-neutral-500 uppercase font-semibold font-mono hidden md:inline">Visualizar</span>
                <div className="flex items-center rounded-lg bg-neutral-950 p-1 border border-neutral-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-purple-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Grelha"
                    id="btn-view-grid"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-purple-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Lista"
                    id="btn-view-list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scroll categories on smaller screens / quickly accessible */}
            <div className="relative flex items-center border-t border-neutral-800/60 pt-3 w-full max-w-full overflow-hidden">
              <button 
                onClick={() => scrollCategories('left')}
                className="absolute left-0 z-10 p-1.5 rounded-full bg-neutral-950 border border-neutral-800/80 shadow-md text-neutral-400 hover:text-white transition-colors"
                id="btn-scroll-cat-left"
              >
                &larr;
              </button>
              
              <div 
                ref={categoriesContainerRef}
                className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1.5 px-10 pb-2.5 w-full text-xs font-semibold select-none"
              >
                <button
                  onClick={() => setSelectedCategoryId('ALL')}
                  className={`py-1.5 px-4 rounded-full border shrink-0 transition-all ${
                    selectedCategoryId === 'ALL'
                      ? 'bg-purple-500 text-neutral-950 border-purple-500'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                  }`}
                  id="cat-pill-inicio"
                >
                  INÍCIO
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`py-1.5 px-4 rounded-full border shrink-0 transition-all uppercase tracking-wider ${
                      selectedCategoryId === cat.id
                        ? 'bg-purple-500 text-neutral-950 border-purple-500'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                    id={`cat-pill-${cat.id}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => scrollCategories('right')}
                className="absolute right-0 z-10 p-1.5 rounded-full bg-neutral-950 border border-neutral-800/80 shadow-md text-neutral-400 hover:text-white transition-colors"
                id="btn-scroll-cat-right"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Product Grid / List Listing */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
              <ShieldAlert className="w-12 h-12 text-purple-500/60 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Nenhum produto encontrado</h3>
              <p className="text-neutral-400 text-sm max-w-md mx-auto">
                Não encontramos itens correspondentes aos filtros selecionados. Tente limpar os termos de busca ou mudar a categoria.
              </p>
              <button
                onClick={() => { setSelectedCategoryId('ALL'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 bg-purple-500 text-neutral-950 font-bold rounded-lg hover:bg-purple-400 transition-colors text-xs uppercase"
                id="btn-clear-filters"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div>
              {/* Active Category Title */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  {selectedCategoryId === 'ALL' ? 'Todos os Produtos' : categories.find(c => c.id === selectedCategoryId)?.name}
                  <span className="text-xs font-mono font-medium text-neutral-500">({filteredProducts.length} itens)</span>
                </h2>
              </div>

              {/* Grid Layout */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3" id="products-grid">
                  {filteredProducts.map((product) => {
                    const hasPromo = product.promoPrice && product.promoPrice < product.price;
                    const displayPrice = hasPromo ? product.promoPrice! : product.price;
                    const discountPercent = hasPromo ? Math.round(((product.price - product.promoPrice!) / product.price) * 100) : 0;

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 transition-all rounded-xl overflow-hidden flex flex-col relative group"
                        id={`product-card-${product.id}`}
                      >
                        {/* Promo Badge */}
                        {hasPromo && (
                          <div className="absolute top-2.5 left-0 z-20 bg-purple-500 text-neutral-950 font-black text-[10px] px-2 py-0.5 rounded-r flex items-center gap-0.5 shadow-md">
                            <BadgePercent className="w-3.5 h-3.5" />
                            -{discountPercent}%
                          </div>
                        )}

                        {/* Image Container with blurred background like Kyte app */}
                        <div 
                          onClick={() => handleOpenProductDetail(product)}
                          className="h-28 sm:h-36 bg-neutral-950 relative overflow-hidden flex items-center justify-center cursor-pointer border-b border-neutral-800/40"
                        >
                          {/* Image styling - clean vector mock if no image */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950/20" />
                          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800/80 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🍁</span>
                          </div>
                          
                          {/* Code tooltip if any */}
                          {product.code && (
                            <span className="absolute bottom-2 left-2 text-[10px] bg-neutral-900/80 backdrop-blur text-neutral-400 font-mono py-0.5 px-1.5 rounded">
                              {product.code}
                            </span>
                          )}

                          {/* Quick Eye action on hover */}
                          <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="bg-purple-500 text-neutral-950 p-2 rounded-full shadow-lg">
                              <Eye className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                          <div onClick={() => handleOpenProductDetail(product)} className="cursor-pointer">
                            <h3 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2 hover:text-purple-400 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              {hasPromo && (
                                <span className="text-[10px] text-neutral-500 line-through block leading-none">
                                  R$ {product.price.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                              <span className="text-sm sm:text-base font-extrabold text-purple-500 leading-none block mt-0.5">
                                R$ {displayPrice.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <button
                              onClick={() => handleOpenProductDetail(product)}
                              className="py-1 px-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-purple-400 hover:text-purple-300 text-xs font-semibold tracking-wide transition-colors flex items-center gap-1"
                              id={`btn-product-buy-${product.id}`}
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* List Layout */
                <div className="space-y-3" id="products-list">
                  {filteredProducts.map((product) => {
                    const hasPromo = product.promoPrice && product.promoPrice < product.price;
                    const displayPrice = hasPromo ? product.promoPrice! : product.price;

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        className="bg-neutral-900 border border-neutral-800 hover:border-purple-500/30 transition-all rounded-xl overflow-hidden p-3 flex gap-4 relative group"
                        id={`product-list-card-${product.id}`}
                      >
                        <div 
                          onClick={() => handleOpenProductDetail(product)}
                          className="w-20 h-20 bg-neutral-950 rounded-lg overflow-hidden shrink-0 flex items-center justify-center cursor-pointer relative border border-neutral-800/40"
                        >
                          <span className="text-xl">🍂</span>
                          {hasPromo && (
                            <span className="absolute top-1 left-1 bg-purple-500 text-neutral-950 text-[8px] font-bold py-0.5 px-1 rounded">
                              PROMO
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div onClick={() => handleOpenProductDetail(product)} className="cursor-pointer">
                            <h3 className="text-sm font-semibold text-white truncate leading-snug">
                              {product.name}
                            </h3>
                            <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5">
                              {product.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-purple-500">
                                R$ {displayPrice.toFixed(2).replace('.', ',')}
                              </span>
                              {hasPromo && (
                                <span className="text-xs text-neutral-500 line-through">
                                  R$ {product.price.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => handleOpenProductDetail(product)}
                              className="py-1 px-3 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-purple-400 hover:text-purple-300 text-xs font-semibold tracking-wide transition-colors flex items-center gap-1"
                              id={`btn-product-buy-list-${product.id}`}
                            >
                              <span>Adicionar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Floating Bottom Cart Bar (visible only on screens below 1024px, when items are in cart) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 z-30 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">Carrinho Tabas</span>
            <span className="text-base font-extrabold text-purple-500">R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
            <span className="text-[10px] text-neutral-500 block">({cart.reduce((sum, i) => sum + i.quantity, 0)} itens)</span>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-neutral-950 font-bold text-sm shadow-lg hover:bg-purple-400 active:scale-95 transition-all"
            id="btn-cart-floating-trigger"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Ver Carrinho</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-10 px-4 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-semibold text-neutral-400">TabasGestion Smoke Catalog & Admin Engine</p>
          <p>
            Desenvolvido com carinho para gerenciamento completo e checkout unificado por WhatsApp. Todas as ofertas e produtos são de responsabilidade da TabasGestion.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <span className="hover:text-neutral-400 cursor-help">Dúvidas? Fale conosco</span>
            <span>•</span>
            <span className="hover:text-neutral-400 cursor-help">Engenharia de Software de Alta Qualidade</span>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
              id="product-detail-modal"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                id="btn-close-product-detail"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Info */}
              <div className="p-6 space-y-6">
                
                {/* Modal Visual Placeholder */}
                <div className="h-56 bg-neutral-950 rounded-xl flex items-center justify-center relative border border-neutral-800">
                  <span className="text-5xl">🌿</span>
                  {selectedProduct.promoPrice && (
                    <span className="absolute top-3 left-3 bg-purple-500 text-neutral-950 text-xs font-black py-1 px-2.5 rounded-md shadow-md">
                      OFERTA ESPECIAL
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-500 font-mono">
                      {categories.find(c => c.id === selectedProduct.category)?.name ?? 'Outros'}
                    </span>
                    {selectedProduct.code && (
                      <span className="text-xs font-mono text-neutral-500">
                        Código: {selectedProduct.code}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Variations choice if any */}
                {selectedProduct.variations && selectedProduct.variations.map((v) => (
                  <div key={v.name} className="space-y-2 border-t border-neutral-800/80 pt-4">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">{v.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((option) => {
                        const isSelected = selectedProductVars.find(sv => sv.name === v.name && sv.value === option);
                        return (
                          <button
                            key={option}
                            onClick={() => handleSelectVariationValue(v.name, option)}
                            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                              isSelected
                                ? 'bg-purple-500 text-neutral-950 border-purple-500 scale-105'
                                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                            }`}
                            id={`btn-option-${v.name}-${option}`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Buy Action Section */}
                <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-400 block leading-none">Preço do Produto</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-purple-500">
                        R$ {((selectedProduct.promoPrice ?? selectedProduct.price) * cartProductQuantity).toFixed(2).replace('.', ',')}
                      </span>
                      {selectedProduct.promoPrice && (
                        <span className="text-xs text-neutral-500 line-through leading-none">
                          R$ {(selectedProduct.price * cartProductQuantity).toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity manager */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                      <button
                        onClick={() => setCartProductQuantity(prev => Math.max(1, prev - 1))}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white active:scale-95 transition-all"
                        id="btn-modal-qty-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold font-mono">{cartProductQuantity}</span>
                      <button
                        onClick={() => setCartProductQuantity(prev => Math.min(selectedProduct.stock, prev + 1))}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white active:scale-95 transition-all"
                        id="btn-modal-qty-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 active:scale-95 text-sm"
                      id="btn-modal-add-to-cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 text-center leading-none">
                  Disponível em estoque para entrega imediata: <span className="text-neutral-400 font-mono font-semibold">{selectedProduct.stock} unidades</span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING CART OVERLAY MODAL */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-neutral-900 border-l border-neutral-800 w-full max-w-md h-full flex flex-col relative shadow-2xl"
              id="shopping-cart-sidebar"
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-purple-500" />
                  <h3 className="font-extrabold text-white">Seu Carrinho</h3>
                  <span className="text-xs font-mono font-semibold py-0.5 px-2 bg-neutral-950 text-neutral-400 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
                  id="btn-close-cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center py-10 space-y-4">
                    <span className="text-5xl animate-bounce">🛒</span>
                    <div>
                      <h4 className="font-bold text-white mb-1">Seu carrinho está vazio</h4>
                      <p className="text-xs text-neutral-400 max-w-[240px] mx-auto leading-relaxed">
                        Navegue pelo nosso catálogo e adicione itens para iniciar seu pedido.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-4 py-2 bg-purple-500 text-neutral-950 font-bold rounded-lg text-xs uppercase"
                    >
                      Continuar Comprando
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, idx) => {
                      const itemPrice = item.product.promoPrice ?? item.product.price;
                      return (
                        <div key={idx} className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex gap-3 relative">
                          <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-xl border border-neutral-800">
                            🍂
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{item.product.name}</h4>
                            {item.selectedVariations.length > 0 && (
                              <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                                {item.selectedVariations.map(v => `${v.name}: ${v.value}`).join(', ')}
                              </p>
                            )}
                            <span className="text-xs font-bold text-purple-500 block mt-1">
                              R$ {(itemPrice * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          {/* Action triggers */}
                          <div className="absolute right-3 top-3">
                            <button
                              onClick={() => removeCartItem(idx)}
                              className="text-neutral-600 hover:text-red-500 transition-colors"
                              title="Remover Item"
                              id={`btn-cart-remove-${idx}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="absolute right-3 bottom-3 flex items-center rounded-lg bg-neutral-900 p-0.5 border border-neutral-800">
                            <button
                              onClick={() => updateCartItemQuantity(idx, -1)}
                              className="p-1 text-neutral-500 hover:text-white"
                              id={`btn-cart-qty-dec-${idx}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(idx, 1)}
                              className="p-1 text-neutral-500 hover:text-white"
                              id={`btn-cart-qty-inc-${idx}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Checkout Form & Total Section (visible only when cart has items) */}
              {cart.length > 0 && (
                <div className="border-t border-neutral-800 bg-neutral-950 p-4 space-y-4">
                  
                  {/* Delivery Info */}
                  <form onSubmit={handlePlaceOrder} className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold border-b border-neutral-800 pb-1.5 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      Dados para entrega/retirada
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          deliveryType === 'pickup'
                            ? 'bg-purple-500 text-neutral-950 border-purple-500'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                        id="btn-cart-delivery-pickup"
                      >
                        Retirada (Grátis)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          deliveryType === 'delivery'
                            ? 'bg-purple-500 text-neutral-950 border-purple-500'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                        id="btn-cart-delivery-home"
                      >
                        Entrega (+R$ {settings.deliveryFee.toFixed(2)})
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nome e Sobrenome"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2 px-3 text-xs placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                        id="cart-input-name"
                      />
                      <input
                        type="tel"
                        placeholder="WhatsApp / Telefone para contato"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2 px-3 text-xs placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                        id="cart-input-phone"
                      />
                      
                      {deliveryType === 'delivery' && (
                        <textarea
                          placeholder="Endereço Completo de Entrega (Rua, Número, Bairro)"
                          required={deliveryType === 'delivery'}
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          rows={2}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2 px-3 text-xs placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                          id="cart-input-address"
                        />
                      )}

                      <input
                        type="text"
                        placeholder="Alguma observação? (Opcional)"
                        value={orderObservation}
                        onChange={(e) => setOrderObservation(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2 px-3 text-xs placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                        id="cart-input-obs"
                      />
                    </div>

                    {/* Total Sheet */}
                    <div className="space-y-1.5 border-t border-neutral-800 pt-3 text-xs">
                      <div className="flex justify-between text-neutral-400">
                        <span>Subtotal do Pedido</span>
                        <span>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                      {deliveryType === 'delivery' && (
                        <div className="flex justify-between text-neutral-400">
                          <span>Taxa de Entrega</span>
                          <span>R$ {settings.deliveryFee.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-extrabold text-white pt-1">
                        <span>Total Geral</span>
                        <span className="text-purple-500">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-xl text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                      id="btn-cart-checkout"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Pedido via WhatsApp</span>
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
