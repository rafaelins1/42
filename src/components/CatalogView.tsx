/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Grid, List, ShoppingCart, MapPin, Instagram, Phone, 
  Clock, ChevronRight, Plus, Minus, Trash2, X, Send, Sparkles, 
  Lock, ArrowRight, Eye, ShieldAlert, BadgePercent, Crown, MessageCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, CartItem, SelectedVariation, StoreSettings, Order } from '../types';
import { getProductTotalStock, getStockForVariations, getVariationStockKey } from '../utils/inventory';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onEnterAdmin: () => void;
  onAddOrder?: (order: Order) => void;
}

const isSameStockBucket = (
  product: Product,
  firstSelection: SelectedVariation[],
  secondSelection: SelectedVariation[]
): boolean =>
  !product.variationStocks ||
  getVariationStockKey(firstSelection) === getVariationStockKey(secondSelection);

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

  const vipUrl = settings.vipGroupUrl || 'https://chat.whatsapp.com/I38enKB1mtzKN1yxNLuzZV?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaeANudPlmE3P-wSV0SRjpLfqMxg0w6ekmZEKRuQugpoWQ0JM7UbEsDlCgflcw_aem_9aoKn118zHWAejZ0Bi4wrA';

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
  const totalCartQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

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
    const defaultVars = product.variations?.map(v => ({
      name: v.name,
      value: v.options[0]
    })) ?? [];
    const inCart = cart
      .filter(item =>
        item.product.id === product.id &&
        isSameStockBucket(product, item.selectedVariations, defaultVars)
      )
      .reduce((sum, item) => sum + item.quantity, 0);
    const remaining = Math.max(0, getStockForVariations(product, defaultVars) - inCart);
    setCartProductQuantity(remaining > 0 ? 1 : 0);

    // Initialize default variations
    if (defaultVars.length > 0) {
      setSelectedProductVariations(defaultVars);
    } else {
      setSelectedProductVariations([]);
    }
  };

  const handleSelectVariationValue = (varName: string, value: string) => {
    const existing = selectedProductVars.find(item => item.name === varName);
    const nextSelection = existing
      ? selectedProductVars.map(item => item.name === varName ? { ...item, value } : item)
      : [...selectedProductVars, { name: varName, value }];
    setSelectedProductVariations(nextSelection);

    if (selectedProduct) {
      const alreadyInCart = cart
        .filter(item =>
          item.product.id === selectedProduct.id &&
          isSameStockBucket(selectedProduct, item.selectedVariations, nextSelection)
        )
        .reduce((sum, item) => sum + item.quantity, 0);
      const remaining = Math.max(0, getStockForVariations(selectedProduct, nextSelection) - alreadyInCart);
      setCartProductQuantity(remaining > 0 ? Math.min(Math.max(1, cartProductQuantity), remaining) : 0);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const availableStock = getStockForVariations(selectedProduct, selectedProductVars);
    if (availableStock <= 0) {
      alert(`Desculpe, esta variação de "${selectedProduct.name}" está esgotada no momento.`);
      return;
    }

    const alreadyInCart = cart
      .filter(item =>
        item.product.id === selectedProduct.id &&
        isSameStockBucket(selectedProduct, item.selectedVariations, selectedProductVars)
      )
      .reduce((sum, item) => sum + item.quantity, 0);

    const remainingStock = Math.max(0, availableStock - alreadyInCart);

    if (remainingStock <= 0) {
      alert(`Você já adicionou a quantidade máxima disponível em estoque (${availableStock} un) desta variação ao seu carrinho.`);
      return;
    }

    const quantityToAdd = Math.min(cartProductQuantity, remainingStock);
    if (quantityToAdd <= 0) return;

    setCart(prevCart => {
      // Find identical item (same product ID AND same selected variations)
      const existingIndex = prevCart.findIndex(item => {
        if (item.product.id !== selectedProduct.id) return false;
        return getVariationStockKey(item.selectedVariations) === getVariationStockKey(selectedProductVars);
      });

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += quantityToAdd;
        return updatedCart;
      }

      return [...prevCart, {
        product: selectedProduct,
        quantity: quantityToAdd,
        selectedVariations: [...selectedProductVars]
      }];
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const updateCartItemQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      if (delta > 0) {
        const otherQtyOfSameProduct = prev
          .filter((it, i) =>
            i !== index &&
            it.product.id === item.product.id &&
            isSameStockBucket(item.product, it.selectedVariations, item.selectedVariations)
          )
          .reduce((sum, it) => sum + it.quantity, 0);
        
        const availableStock = getStockForVariations(item.product, item.selectedVariations);
        const availableToAdd = Math.max(0, availableStock - otherQtyOfSameProduct);

        if (item.quantity + delta > availableToAdd) {
          alert(`Limite de estoque atingido! Há apenas ${availableStock} unidades desta variação disponíveis.`);
          return prev;
        }
      }

      const newQty = item.quantity + delta;
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

  // Secret logo tap detection (5 quick clicks to open admin gate)
  const logoTapRef = useRef<{ count: number; lastTap: number }>({ count: 0, lastTap: 0 });
  const handleLogoSecretTap = () => {
    const now = Date.now();
    if (now - logoTapRef.current.lastTap > 800) {
      logoTapRef.current.count = 1;
    } else {
      logoTapRef.current.count += 1;
    }
    logoTapRef.current.lastTap = now;

    if (logoTapRef.current.count >= 5) {
      logoTapRef.current.count = 0;
      onEnterAdmin();
    }
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-500 selection:text-neutral-950">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur border-b border-neutral-800/80 px-4 py-3.5 shadow-lg">
        <div className="max-w-full w-full flex items-center justify-between">
          {/* Logo with 5-tap secret admin trigger */}
          <div 
            onClick={handleLogoSecretTap}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title={settings.storeName || 'TabasGestion'}
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="h-10 w-10 rounded-xl object-cover shadow-lg border border-neutral-800 shrink-0 group-hover:border-purple-500/30 transition-colors"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center font-black text-neutral-950 text-lg tracking-wider shadow-lg shadow-purple-500/20 shrink-0">
                TG
              </div>
            )}
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">{settings.storeName || 'TabasGestion'}</span>
              <span className="text-xs text-neutral-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Catálogo Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* VIP Group Trigger */}
            <a
              href={vipUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all shadow-sm"
              title="Acessar Grupo VIP no WhatsApp"
              id="btn-header-vip"
            >
              <Crown className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Grupo VIP</span>
            </a>

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
            <div className="flex items-center gap-4 mb-2">
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-purple-500/30 shadow-xl shadow-purple-500/10 shrink-0"
                />
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {settings.storeName || 'TabasGestion'}
              </h1>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-3xl">
              O catálogo mais completo de sedas, cases, kits, dichavadores e acessórios. Monte seu carrinho e envie seu pedido diretamente no nosso WhatsApp.
            </p>

            {/* VIP Group Call-To-Action Banner */}
            <div className="mt-5 max-w-2xl">
              <a
                href={vipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-900 border border-emerald-500/30 hover:border-emerald-500/70 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/20 transition-all duration-300"
                id="banner-grupo-vip"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0 shadow-inner">
                    <Crown className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                        Grupo VIP no WhatsApp
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        Exclusivo
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5 leading-snug">
                      Ofertas especiais, novidades em primeira mão e descontos antecipados para membros.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end shrink-0">
                  <span className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all group-hover:gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>Entrar no Grupo VIP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            </div>
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
              <li className="flex gap-3 pt-3 border-t border-neutral-800">
                <Crown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-xs text-neutral-500 block">Comunidade Oficial</span>
                  <a
                    href={vipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-0.5 transition-colors"
                  >
                    <span>Grupo VIP no WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
                    const isOutOfStock = getProductTotalStock(product) <= 0;

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 transition-all rounded-xl overflow-hidden flex flex-col relative group ${
                          isOutOfStock ? 'opacity-70' : ''
                        }`}
                        id={`product-card-${product.id}`}
                      >
                        {/* Promo or Out of Stock Badge */}
                        {isOutOfStock ? (
                          <div className="absolute top-2.5 left-2 z-20 bg-red-600/90 text-white font-black text-[9px] px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
                            Esgotado
                          </div>
                        ) : hasPromo ? (
                          <div className="absolute top-2.5 left-0 z-20 bg-purple-500 text-neutral-950 font-black text-[10px] px-2 py-0.5 rounded-r flex items-center gap-0.5 shadow-md">
                            <BadgePercent className="w-3.5 h-3.5" />
                            -{discountPercent}%
                          </div>
                        ) : null}

                        {/* Image Container with blurred background like Kyte app */}
                        <div 
                          onClick={() => handleOpenProductDetail(product)}
                          className="h-32 sm:h-40 bg-neutral-950 relative overflow-hidden flex items-center justify-center cursor-pointer border-b border-neutral-800/40 group"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                isOutOfStock ? 'grayscale contrast-75' : ''
                              }`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950/20" />
                              <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800/80 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🍁</span>
                              </div>
                            </>
                          )}
                          
                          {/* Code tooltip if any */}
                          {product.code && (
                            <span className="absolute bottom-2 left-2 text-[10px] bg-neutral-900/90 backdrop-blur text-neutral-300 font-mono py-0.5 px-1.5 rounded border border-neutral-800/60 z-10">
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
                              className={`py-1 px-2.5 rounded-lg border text-xs font-semibold tracking-wide transition-colors flex items-center gap-1 ${
                                isOutOfStock
                                  ? 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-400'
                                  : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-purple-400 hover:text-purple-300'
                              }`}
                              id={`btn-product-buy-${product.id}`}
                            >
                              <span>{isOutOfStock ? 'Esgotado' : 'Ver'}</span>
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
                    const isOutOfStock = getProductTotalStock(product) <= 0;

                    return (
                      <motion.div
                        key={product.id}
                        layout
                        className={`bg-neutral-900 border border-neutral-800 hover:border-purple-500/30 transition-all rounded-xl overflow-hidden p-3 flex gap-4 relative group ${
                          isOutOfStock ? 'opacity-70' : ''
                        }`}
                        id={`product-list-card-${product.id}`}
                      >
                        <div 
                          onClick={() => handleOpenProductDetail(product)}
                          className="w-20 h-20 bg-neutral-950 rounded-lg overflow-hidden shrink-0 flex items-center justify-center cursor-pointer relative border border-neutral-800/40"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale contrast-75' : ''}`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-xl">🍂</span>
                          )}
                          {isOutOfStock ? (
                            <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold py-0.5 px-1 rounded z-10 uppercase">
                              Esgotado
                            </span>
                          ) : hasPromo ? (
                            <span className="absolute top-1 left-1 bg-purple-500 text-neutral-950 text-[8px] font-bold py-0.5 px-1 rounded z-10">
                              PROMO
                            </span>
                          ) : null}
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
                              className={`py-1 px-3 rounded-lg border text-xs font-semibold tracking-wide transition-colors flex items-center gap-1 ${
                                isOutOfStock
                                  ? 'bg-neutral-950 border-neutral-800 text-neutral-500'
                                  : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-purple-400 hover:text-purple-300'
                              }`}
                              id={`btn-product-buy-list-${product.id}`}
                            >
                              <span>{isOutOfStock ? 'Esgotado' : 'Adicionar'}</span>
                              {!isOutOfStock && <ChevronRight className="w-3.5 h-3.5" />}
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

      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href={`https://wa.me/${(settings.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Vim pelo catálogo online TabasGestion e gostaria de atendimento.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 group hover:scale-105 cursor-pointer ring-4 ring-emerald-500/20"
        title={`Falar no WhatsApp (${settings.phone})`}
        id="btn-floating-whatsapp"
        aria-label="Atendimento via WhatsApp"
      >
        <span className="sr-only">Falar no WhatsApp</span>
        {/* Subtle breathing glow */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25 group-hover:opacity-40"></span>
        <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.57 4.186 1.564 5.945l-1.564 5.709 5.867-1.539c1.716.941 3.682 1.475 5.773 1.475 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      </a>

      {/* Floating Bottom-Corner Cart Button (Floats right above WhatsApp) */}
      <AnimatePresence>
        {totalCartQuantity > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-22 right-5 sm:bottom-25 sm:right-6 z-40"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="group relative flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-neutral-900/95 hover:bg-neutral-850 backdrop-blur-xl border border-purple-500/40 hover:border-purple-500 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 active:scale-95 cursor-pointer ring-1 ring-purple-500/20"
              id="btn-cart-floating-trigger"
              title="Visualizar Resumo do Pedido"
            >
              {/* Cart Icon with Counter Badge */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-neutral-950 flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-5 h-5 text-neutral-950" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-black text-[11px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-lg border border-neutral-900 animate-bounce">
                  {totalCartQuantity}
                </span>
              </div>

              {/* Text Info: Items count & Total */}
              <div className="text-left pr-1">
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="text-xs sm:text-sm font-extrabold text-white">
                    {totalCartQuantity} {totalCartQuantity === 1 ? 'item' : 'itens'}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-xs sm:text-sm font-black text-purple-400 font-mono">
                    R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 group-hover:text-neutral-300 transition-colors block mt-0.5 font-medium">
                  Ver resumo do pedido
                </span>
              </div>

              {/* Arrow Indicator */}
              <div className="w-7 h-7 rounded-lg bg-neutral-800 group-hover:bg-purple-500 group-hover:text-neutral-950 text-neutral-400 flex items-center justify-center transition-all shrink-0 ml-1">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-10 px-4 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-semibold text-neutral-400">TabasGestion Smoke Catalog & Admin Engine</p>
          <p>
            Desenvolvido com carinho para gerenciamento completo e checkout unificado por WhatsApp. Todas as ofertas e produtos são de responsabilidade da TabasGestion.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-neutral-500">
            <span className="hover:text-neutral-400">Dúvidas? Fale conosco</span>
            <span>•</span>
            <span className="hover:text-neutral-400">Catálogo Oficial</span>
            <span>•</span>
            <button
              onClick={onEnterAdmin}
              className="text-neutral-700 hover:text-neutral-400 transition-colors text-[11px] cursor-pointer"
              title="Acesso de Gestão"
              id="link-footer-restricted"
            >
              Área Restrita
            </button>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (() => {
          const inCartCount = cart
            .filter(i =>
              i.product.id === selectedProduct.id &&
              isSameStockBucket(selectedProduct, i.selectedVariations, selectedProductVars)
            )
            .reduce((sum, i) => sum + i.quantity, 0);
          const availableStock = getStockForVariations(selectedProduct, selectedProductVars);
          const remainingStock = Math.max(0, availableStock - inCartCount);
          const isOutOfStock = availableStock <= 0;
          const isProductOutOfStock = getProductTotalStock(selectedProduct) <= 0;
          const isStockLimitReached = availableStock > 0 && remainingStock <= 0;

          return (
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
                  
                  {/* Modal Visual Placeholder / Real Image */}
                  <div className="h-60 sm:h-72 bg-neutral-950 rounded-xl flex items-center justify-center relative border border-neutral-800 overflow-hidden">
                    {selectedProduct.image ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-contain bg-black/40"
                      />
                    ) : (
                      <span className="text-5xl">🌿</span>
                    )}
                    {isOutOfStock ? (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black py-1 px-2.5 rounded-md shadow-md uppercase tracking-wide">
                        {isProductOutOfStock ? 'PRODUTO ESGOTADO' : 'VARIAÇÃO ESGOTADA'}
                      </span>
                    ) : selectedProduct.promoPrice ? (
                      <span className="absolute top-3 left-3 bg-purple-500 text-neutral-950 text-xs font-black py-1 px-2.5 rounded-md shadow-md">
                        OFERTA ESPECIAL
                      </span>
                    ) : null}
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
                          const optionVariations = selectedProductVars.some(sv => sv.name === v.name)
                            ? selectedProductVars.map(sv => sv.name === v.name ? { ...sv, value: option } : sv)
                            : [...selectedProductVars, { name: v.name, value: option }];
                          const optionStock = selectedProduct.variationStocks
                            ? getStockForVariations(selectedProduct, optionVariations)
                            : undefined;
                          return (
                            <button
                              key={option}
                              onClick={() => handleSelectVariationValue(v.name, option)}
                              className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                                isSelected
                                  ? 'bg-purple-500 text-neutral-950 border-purple-500 scale-105'
                                  : optionStock === 0
                                  ? 'bg-neutral-950 text-red-400 border-red-900 hover:border-red-700'
                                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                              }`}
                              id={`btn-option-${v.name}-${option}`}
                            >
                              {option}
                              {optionStock !== undefined && (
                                <span className="ml-1.5 text-[9px] opacity-75">
                                  {optionStock === 0 ? 'Esgotado' : `${optionStock} un`}
                                </span>
                              )}
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
                          R$ {((selectedProduct.promoPrice ?? selectedProduct.price) * (cartProductQuantity || 1)).toFixed(2).replace('.', ',')}
                        </span>
                        {selectedProduct.promoPrice && (
                          <span className="text-xs text-neutral-500 line-through leading-none">
                            R$ {(selectedProduct.price * (cartProductQuantity || 1)).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity manager */}
                    <div className="flex items-center gap-3">
                      {!isOutOfStock && !isStockLimitReached && (
                        <div className="flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                          <button
                            onClick={() => setCartProductQuantity(prev => Math.max(1, prev - 1))}
                            disabled={cartProductQuantity <= 1}
                            className={`p-1.5 rounded-lg transition-all ${
                              cartProductQuantity <= 1 ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-400 hover:text-white active:scale-95'
                            }`}
                            id="btn-modal-qty-decrease"
                            title="Diminuir quantidade"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold font-mono">{cartProductQuantity}</span>
                          <button
                            onClick={() => setCartProductQuantity(prev => Math.min(remainingStock, prev + 1))}
                            disabled={cartProductQuantity >= remainingStock}
                            className={`p-1.5 rounded-lg transition-all ${
                              cartProductQuantity >= remainingStock ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-400 hover:text-white active:scale-95'
                            }`}
                            id="btn-modal-qty-increase"
                            title={cartProductQuantity >= remainingStock ? `Máximo disponível em estoque (${remainingStock} un)` : 'Aumentar quantidade'}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {isOutOfStock ? (
                        <button
                          disabled
                          className="px-6 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-500 font-bold transition-all text-sm cursor-not-allowed"
                          id="btn-modal-add-to-cart"
                        >
                          Produto Esgotado
                        </button>
                      ) : isStockLimitReached ? (
                        <button
                          disabled
                          className="px-6 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-amber-500/80 font-bold transition-all text-sm cursor-not-allowed"
                          id="btn-modal-add-to-cart"
                        >
                          Limite no Carrinho
                        </button>
                      ) : (
                        <button
                          onClick={handleAddToCart}
                          className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 active:scale-95 text-sm cursor-pointer"
                          id="btn-modal-add-to-cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Adicionar ({cartProductQuantity})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-center leading-none">
                    {isOutOfStock ? (
                      <span className="text-red-400 font-medium">
                        {isProductOutOfStock
                          ? 'Ops! Este produto está esgotado no estoque no momento.'
                          : 'Esta variação está esgotada. Selecione outra opção disponível.'}
                      </span>
                    ) : isStockLimitReached ? (
                      <span className="text-amber-400 font-medium">
                        Você já adicionou todas as <strong className="font-mono">{availableStock} unidades</strong> desta variação ao seu carrinho.
                      </span>
                    ) : (
                      <span className="text-neutral-400">
                        Estoque desta variação: <span className="text-purple-400 font-mono font-semibold">{availableStock} unidades</span>
                        {inCartCount > 0 && (
                          <span className="text-neutral-500 ml-1">({inCartCount} já no carrinho, restam {remainingStock})</span>
                        )}
                      </span>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
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
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base leading-tight">Resumo do Pedido</h3>
                    <span className="text-[11px] text-neutral-400 block">
                      Revise seus itens antes de finalizar
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold py-1 px-2.5 bg-neutral-950 border border-neutral-800 text-purple-400 rounded-full">
                    {totalCartQuantity} {totalCartQuantity === 1 ? 'item' : 'itens'}
                  </span>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-full hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
                    id="btn-close-cart"
                    title="Fechar Resumo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                      const productInCartTotal = cart
                        .filter(it =>
                          it.product.id === item.product.id &&
                          isSameStockBucket(item.product, it.selectedVariations, item.selectedVariations)
                        )
                        .reduce((sum, it) => sum + it.quantity, 0);
                      const itemStock = getStockForVariations(item.product, item.selectedVariations);
                      const isMaxStockReached = productInCartTotal >= itemStock;

                      return (
                        <div key={idx} className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex gap-3 relative">
                          <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center text-xl border border-neutral-800 overflow-hidden shrink-0">
                            {item.product.image ? (
                              <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              '🍂'
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{item.product.name}</h4>
                            {item.selectedVariations.length > 0 && (
                              <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                                {item.selectedVariations.map(v => `${v.name}: ${v.value}`).join(', ')}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-purple-500">
                                R$ {(itemPrice * item.quantity).toFixed(2).replace('.', ',')}
                              </span>
                              {isMaxStockReached && (
                                <span className="text-[10px] text-amber-400 font-mono font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  Máx: {itemStock} un
                                </span>
                              )}
                            </div>
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
                              title="Diminuir"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(idx, 1)}
                              disabled={isMaxStockReached}
                              className={`p-1 transition-colors ${
                                isMaxStockReached ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-500 hover:text-white'
                              }`}
                              id={`btn-cart-qty-inc-${idx}`}
                              title={isMaxStockReached ? `Estoque máximo atingido (${itemStock} un)` : 'Aumentar'}
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
