/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Package, Layers, Settings, LogOut, Plus, 
  Trash2, Edit, Check, X, RefreshCw, AlertTriangle, MessageSquare, 
  DollarSign, TrendingUp, CheckCircle2, BadgePercent, User, MapPin,
  Shield, Database, Image as ImageIcon, Upload, Camera, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category, StoreSettings, Order, OrderStatus } from '../types';
import { validateFirestoreConnection, savePartialStoreToFirestore, getStoreDataFromFirestore } from '../firebase';
import { compressImage } from '../utils/imageUtils';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  orders: Order[];
  passcode: string;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdatePasscode: (passcode: string) => void;
  onExit: () => void;
}

export default function AdminDashboard({
  products,
  categories,
  settings,
  orders,
  passcode,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateSettings,
  onUpdateOrders,
  onUpdatePasscode,
  onExit
}: AdminDashboardProps) {
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories' | 'settings'>('dashboard');

  const reloadOrders = () => {
    fetch('/api/db')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.orders) {
          onUpdateOrders(data.orders);
        }
      })
      .catch((err) => console.error('Failed to reload orders:', err));
  };

  // State for adding/editing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Product Form states
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodPromoPrice, setProdPromoPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodVariationsText, setProdVariationsText] = useState(''); // comma separated choices for quick input: e.g. "Cor: Azul, Preto, Rosa"
  const [prodImage, setProdImage] = useState('');
  const [isUploadingProdImage, setIsUploadingProdImage] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');

  // Settings Form State
  const [setStoreName, setSetStoreName] = useState(settings.storeName);
  const [setLogoUrl, setSetLogoUrl] = useState(settings.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [setPhone, setSetPhone] = useState(settings.phone);
  const [setInstagram, setSetInstagram] = useState(settings.instagram);
  const [setAddress, setSetAddress] = useState(settings.address);
  const [setDeliveryFee, setSetDeliveryFee] = useState(String(settings.deliveryFee));
  const [setPickupTime, setSetPickupTime] = useState(settings.pickupTime);
  const [setVipGroupUrl, setSetVipGroupUrl] = useState(settings.vipGroupUrl || '');

  React.useEffect(() => {
    setSetStoreName(settings.storeName);
    setSetLogoUrl(settings.logoUrl || '');
    setSetPhone(settings.phone);
    setSetInstagram(settings.instagram);
    setSetAddress(settings.address);
    setSetDeliveryFee(String(settings.deliveryFee));
    setSetPickupTime(settings.pickupTime);
    setSetVipGroupUrl(settings.vipGroupUrl || '');
  }, [settings]);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingProdImage(true);
      const compressed = await compressImage(file, 800, 800, 0.82);
      setProdImage(compressed);
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar foto do produto.');
    } finally {
      setIsUploadingProdImage(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const compressed = await compressImage(file, 400, 400, 0.85);
      setSetLogoUrl(compressed);
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar logotipo.');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  // PIN Admin Form State
  const [currentPIN, setCurrentPIN] = useState(passcode);
  const [newPIN, setNewPIN] = useState('');
  const [confirmNewPIN, setConfirmNewPIN] = useState('');
  const [pinMessage, setPinMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleUpdatePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPIN.length < 4 || newPIN.length > 8 || !/^\d+$/.test(newPIN)) {
      setPinMessage({ text: 'O PIN deve conter entre 4 e 8 números!', error: true });
      return;
    }
    if (newPIN !== confirmNewPIN) {
      setPinMessage({ text: 'Os PINs digitados não são idênticos!', error: true });
      return;
    }
    onUpdatePasscode(newPIN);
    setCurrentPIN(newPIN);
    setNewPIN('');
    setConfirmNewPIN('');
    setPinMessage({ text: `PIN alterado com sucesso! Use o novo código (${newPIN.length} dígitos) no próximo acesso.`, error: false });
    setTimeout(() => setPinMessage(null), 5000);
  };

  React.useEffect(() => {
    setCurrentPIN(passcode);
  }, [passcode]);

  // Sync status state for cloud database
  const [syncStatus, setSyncStatus] = useState<{
    enabled: boolean;
    lastSynced: string | null;
    cloudUrl: string;
    bucketId: string;
    isUsingFallback?: boolean;
    connectionError?: string | null;
    isNetworkError?: boolean;
    message?: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; error: boolean } | null>(null);

  const fetchSyncStatus = () => {
    fetch('/api/db/sync-status')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setSyncStatus(data))
      .catch(async () => {
        try {
          const isConnected = await validateFirestoreConnection();
          if (isConnected) {
            setSyncStatus({
              enabled: true,
              lastSynced: new Date().toISOString(),
              cloudUrl: 'Google Cloud Firestore',
              bucketId: 'Firestore',
              connectionError: null,
              message: 'Conectado diretamente ao Google Cloud Firestore em nuvem! Todos os dados e alterações estão persistidos e sincronizados na web.'
            });
            return;
          }
        } catch (e) {}

        setSyncStatus({
          enabled: false,
          lastSynced: null,
          cloudUrl: 'Servidor',
          bucketId: 'Offline',
          isNetworkError: true,
          connectionError: 'O servidor está reiniciando ou indisponível temporariamente. Por favor, aguarde alguns segundos e clique em "Tentar Novamente".'
        });
      });
  };

  React.useEffect(() => {
    fetchSyncStatus();
    // Poll sync status every 15 seconds to keep it fresh and automatically recover from restarts
    const interval = setInterval(fetchSyncStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSync = (enabled: boolean) => {
    fetch('/api/db/sync-status/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchSyncStatus();
          setSyncMessage({ text: enabled ? 'Sincronização em nuvem ativada!' : 'Sincronização em nuvem desativada!', error: false });
          setTimeout(() => setSyncMessage(null), 3000);
        }
      });
  };

  const handleForcePush = async () => {
    setIsSyncing(true);
    try {
      const success = await savePartialStoreToFirestore({
        products,
        categories,
        settings,
        orders,
        passcode
      });
      if (success) {
        fetchSyncStatus();
        setSyncMessage({ text: 'Sincronização concluída com sucesso! Todos os dados locais estão salvos na nuvem.', error: false });
        setTimeout(() => setSyncMessage(null), 5000);
        setIsSyncing(false);
        return;
      }
    } catch (e) {}

    fetch('/api/db/sync/force-push', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setIsSyncing(false);
        if (data.success) {
          fetchSyncStatus();
          setSyncMessage({ text: 'Sincronização concluída com sucesso! Todos os dados locais estão salvos na nuvem.', error: false });
          setTimeout(() => setSyncMessage(null), 5000);
        } else {
          setSyncMessage({ text: 'Falha ao sincronizar dados na nuvem.', error: true });
        }
      })
      .catch(() => {
        setIsSyncing(false);
        setSyncMessage({ text: 'Erro ao se comunicar com o servidor de banco de dados.', error: true });
      });
  };

  const handleForcePull = async () => {
    if (!confirm('Isso irá substituir TODOS os dados do catálogo e pedidos deste aparelho com os dados salvos na nuvem. Deseja continuar?')) return;
    setIsSyncing(true);
    try {
      const cloudDb = await getStoreDataFromFirestore();
      if (cloudDb) {
        setIsSyncing(false);
        fetchSyncStatus();
        if (cloudDb.products) onUpdateProducts(cloudDb.products);
        if (cloudDb.categories) onUpdateCategories(cloudDb.categories);
        if (cloudDb.settings) onUpdateSettings(cloudDb.settings);
        if (cloudDb.orders) onUpdateOrders(cloudDb.orders);
        if (cloudDb.passcode) onUpdatePasscode(cloudDb.passcode);

        setSyncMessage({ text: 'Dados restaurados da nuvem com sucesso neste aparelho!', error: false });
        setTimeout(() => setSyncMessage(null), 5000);
        return;
      }
    } catch (e) {}

    fetch('/api/db/sync/force-pull', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setIsSyncing(false);
        if (data.success && data.db) {
          fetchSyncStatus();
          if (data.db.products) onUpdateProducts(data.db.products);
          if (data.db.categories) onUpdateCategories(data.db.categories);
          if (data.db.settings) onUpdateSettings(data.db.settings);
          if (data.db.orders) onUpdateOrders(data.db.orders);
          if (data.db.passcode) onUpdatePasscode(data.db.passcode);
          
          setSyncMessage({ text: 'Dados restaurados da nuvem com sucesso neste aparelho!', error: false });
          setTimeout(() => setSyncMessage(null), 5000);
        }
      })
      .catch(() => {
        setIsSyncing(false);
        setSyncMessage({ text: 'Erro ao buscar dados na nuvem ou nenhum dado foi encontrado.', error: true });
      });
  };

  // Business stats calculation
  const stats = useMemo(() => {
    const totalProdCount = products.length;
    const outOfStockCount = products.filter(p => p.stock <= 0).length;
    
    const inventoryValuation = products.reduce((acc, p) => {
      const price = p.promoPrice ?? p.price;
      return acc + (price * p.stock);
    }, 0);

    const completedSalesTotal = orders
      .filter(o => o.status === 'completed')
      .reduce((acc, o) => acc + o.total, 0);

    return {
      totalProdCount,
      outOfStockCount,
      inventoryValuation,
      completedSalesTotal,
      pendingOrdersCount: orders.filter(o => o.status === 'pending').length
    };
  }, [products, orders]);

  // Order status management with automatic stock deduction
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const oldStatus = targetOrder.status;
    let updatedProducts = [...products];
    let stockChanged = false;

    // Baixa automática no estoque ao marcar como "Entregue" (completed)
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      targetOrder.items.forEach(item => {
        const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (prodIndex !== -1) {
          const currentStock = Number(updatedProducts[prodIndex].stock) || 0;
          updatedProducts[prodIndex] = {
            ...updatedProducts[prodIndex],
            stock: Math.max(0, currentStock - item.quantity)
          };
          stockChanged = true;
        }
      });

      if (stockChanged) {
        onUpdateProducts(updatedProducts);
        setSyncMessage({ text: 'Pedido Entregue! Quantidades debitadas do estoque automaticamente.', error: false });
        setTimeout(() => setSyncMessage(null), 4000);
      }
    }
    // Devolução automática ao estoque se um pedido Entregue for cancelado ou reaberto
    else if (oldStatus === 'completed' && (newStatus === 'canceled' || newStatus === 'pending')) {
      targetOrder.items.forEach(item => {
        const prodIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (prodIndex !== -1) {
          const currentStock = Number(updatedProducts[prodIndex].stock) || 0;
          updatedProducts[prodIndex] = {
            ...updatedProducts[prodIndex],
            stock: currentStock + item.quantity
          };
          stockChanged = true;
        }
      });

      if (stockChanged) {
        onUpdateProducts(updatedProducts);
        setSyncMessage({ text: 'Pedido cancelado/reaberto. Quantidades estornadas ao estoque.', error: false });
        setTimeout(() => setSyncMessage(null), 4000);
      }
    }

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    onUpdateOrders(updatedOrders);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Deseja realmente arquivar/remover este pedido dos registros?')) {
      const updatedOrders = orders.filter(o => o.id !== orderId);
      onUpdateOrders(updatedOrders);
    }
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdCode('');
    setProdName('');
    setProdDescription('');
    setProdPrice('');
    setProdPromoPrice('');
    setProdCategory(categories[0]?.id ?? '');
    setProdStock('10');
    setProdIsActive(true);
    setProdFeatured(false);
    setProdVariationsText('');
    setProdImage('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdCode(p.code ?? '');
    setProdName(p.name);
    setProdDescription(p.description);
    setProdPrice(String(p.price));
    setProdPromoPrice(p.promoPrice ? String(p.promoPrice) : '');
    setProdCategory(p.category);
    setProdStock(String(p.stock));
    setProdIsActive(p.isActive);
    setProdFeatured(p.featured ?? false);
    setProdImage(p.image ?? '');
    
    // Format variations text back for easy edit
    if (p.variations && p.variations.length > 0) {
      const formatted = p.variations.map(v => `${v.name}: ${v.options.join(', ')}`).join('\n');
      setProdVariationsText(formatted);
    } else {
      setProdVariationsText('');
    }
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza absoluta que deseja remover este produto do catálogo?')) {
      const updated = products.filter(p => p.id !== productId);
      onUpdateProducts(updated);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      alert('Nome e Preço são obrigatórios!');
      return;
    }

    // Parse variations text
    // Example: "Cor: Azul, Preto, Rosa" or "Tamanho: P, M, G"
    const parsedVariations = [];
    if (prodVariationsText.trim()) {
      const lines = prodVariationsText.split('\n');
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length === 2) {
          const name = parts[0].trim();
          const options = parts[1].split(',').map(o => o.trim()).filter(Boolean);
          if (name && options.length > 0) {
            parsedVariations.push({ name, options });
          }
        }
      }
    }

    const priceNum = parseFloat(prodPrice);
    const promoPriceNum = prodPromoPrice.trim() ? parseFloat(prodPromoPrice) : undefined;
    const stockNum = parseInt(prodStock) || 0;

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            code: prodCode.trim() || undefined,
            name: prodName.trim(),
            description: prodDescription.trim(),
            image: prodImage.trim() || undefined,
            price: priceNum,
            promoPrice: promoPriceNum,
            category: prodCategory,
            stock: stockNum,
            isActive: prodIsActive,
            featured: prodFeatured,
            variations: parsedVariations.length > 0 ? parsedVariations : undefined
          };
        }
        return p;
      });
      onUpdateProducts(updated);
    } else {
      // Create
      const newProd: Product = {
        id: 'p-' + Math.floor(Math.random() * 1000000 + 100000),
        code: prodCode.trim() || undefined,
        name: prodName.trim(),
        description: prodDescription.trim(),
        image: prodImage.trim() || undefined,
        price: priceNum,
        promoPrice: promoPriceNum,
        category: prodCategory,
        stock: stockNum,
        isActive: prodIsActive,
        featured: prodFeatured,
        variations: parsedVariations.length > 0 ? parsedVariations : undefined
      };
      onUpdateProducts([newProd, ...products]);
    }

    setIsProductModalOpen(false);
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = newCatName.trim().toUpperCase().replace(/\s+/g, '_');
    if (categories.find(c => c.id === id)) {
      alert('Esta categoria já existe!');
      return;
    }

    const newCat = {
      id,
      name: newCatName.trim(),
      order: categories.length + 1
    };

    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string) => {
    // Check if category is currently used in products
    const inUse = products.some(p => p.category === catId);
    if (inUse) {
      alert('Não é possível excluir esta categoria pois ela possui produtos associados!');
      return;
    }

    if (confirm('Deseja realmente remover esta categoria?')) {
      onUpdateCategories(categories.filter(c => c.id !== catId));
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      storeName: setStoreName,
      logoUrl: setLogoUrl.trim() || undefined,
      phone: setPhone,
      instagram: setInstagram,
      address: setAddress,
      deliveryFee: parseFloat(setDeliveryFee) || 0,
      pickupTime: setPickupTime,
      whatsappMessageTemplate: settings.whatsappMessageTemplate,
      vipGroupUrl: setVipGroupUrl.trim() || undefined
    });
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-neutral-900 border-b border-neutral-850 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center font-bold text-neutral-950 text-sm overflow-hidden shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.storeName} className="w-full h-full object-cover" />
              ) : (
                'G'
              )}
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white block">TabasGestion Painel</span>
              <span className="text-[10px] text-purple-500 font-mono flex items-center gap-1 leading-none mt-0.5">
                ● Gestor Autenticado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              id="btn-admin-logout"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard Body */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-1 bg-neutral-900 lg:bg-transparent rounded-xl border border-neutral-800 lg:border-0 no-scrollbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2.5 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all shrink-0 w-max lg:w-full ${
                activeTab === 'dashboard'
                  ? 'bg-purple-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              id="tab-btn-dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Visão Geral</span>
            </button>
            <button
              onClick={() => { setActiveTab('orders'); reloadOrders(); }}
              className={`flex items-center gap-2.5 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all shrink-0 w-max lg:w-full relative ${
                activeTab === 'orders'
                  ? 'bg-purple-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              id="tab-btn-orders"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Pedidos Recebidos</span>
              {stats.pendingOrdersCount > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ml-auto leading-none">
                  {stats.pendingOrdersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2.5 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all shrink-0 w-max lg:w-full ${
                activeTab === 'products'
                  ? 'bg-purple-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              id="tab-btn-products"
            >
              <Package className="w-4 h-4" />
              <span>Estoque / Produtos</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2.5 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all shrink-0 w-max lg:w-full ${
                activeTab === 'categories'
                  ? 'bg-purple-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              id="tab-btn-categories"
            >
              <Layers className="w-4 h-4" />
              <span>Categorias</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all shrink-0 w-max lg:w-full ${
                activeTab === 'settings'
                  ? 'bg-purple-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              id="tab-btn-settings"
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </nav>
        </aside>

        {/* Dynamic Tab Body */}
        <main className="flex-1 bg-neutral-900 border border-neutral-850 rounded-2xl p-6 shadow-sm overflow-hidden">
          
          {/* TAB 1: VISÃO GERAL (DASHBOARD) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-purple-500" />
                Painel do Negócio - Visão Geral
              </h2>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Valuation */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="flex justify-between items-center text-neutral-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Patrimônio em Estoque</span>
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-mono">
                    R$ {stats.inventoryValuation.toFixed(2).replace('.', ',')}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-none">
                    Preço de Venda x Quantidade em estoque
                  </p>
                </div>

                {/* Sales Completed */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="flex justify-between items-center text-neutral-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Faturamento Concluído</span>
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-500 font-mono">
                    R$ {stats.completedSalesTotal.toFixed(2).replace('.', ',')}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-none">
                    Soma de pedidos com status 'Entregue'
                  </p>
                </div>

                {/* Products Count */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="flex justify-between items-center text-neutral-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Produtos Cadastrados</span>
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-mono">
                    {stats.totalProdCount}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-none">
                    Itens registrados no sistema
                  </p>
                </div>

                {/* Out of Stock Warning */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="flex justify-between items-center text-neutral-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Sem Estoque (Crítico)</span>
                    <AlertTriangle className={`w-5 h-5 ${stats.outOfStockCount > 0 ? 'text-red-500' : 'text-neutral-600'}`} />
                  </div>
                  <h3 className={`text-2xl font-black font-mono ${stats.outOfStockCount > 0 ? 'text-red-500' : 'text-white'}`}>
                    {stats.outOfStockCount}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-none">
                    Produtos aguardando reposição
                  </p>
                </div>

              </div>

              {/* Warnings and Quick list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Out of stock list */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Produtos com Estoque Baixo ou Crítico
                  </h3>
                  
                  {products.filter(p => p.stock <= 2).length === 0 ? (
                    <p className="text-xs text-neutral-500 py-3 text-center">Nenhum produto com estoque crítico no momento! Parabéns. 🎉</p>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {products.filter(p => p.stock <= 2).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900 last:border-0">
                          <span className="truncate pr-4 font-medium text-neutral-300">{p.name}</span>
                          <span className={`font-bold font-mono px-2 py-0.5 rounded ${p.stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}>
                            {p.stock === 0 ? 'Esgotado' : `${p.stock} un`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Categories share list */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" />
                    Distribuição por Categoria
                  </h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {categories.map(cat => {
                      const count = products.filter(p => p.category === cat.id).length;
                      const percentage = products.length > 0 ? (count / products.length) * 100 : 0;
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-neutral-400 font-medium">
                            <span className="truncate">{cat.name}</span>
                            <span className="font-mono">{count} produtos ({Math.round(percentage)}%)</span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PEDIDOS RECEBIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  Fluxo de Pedidos de Clientes
                </h2>
                <button
                  onClick={reloadOrders}
                  className="p-2 bg-neutral-950 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-xs font-bold flex items-center gap-1.5 text-neutral-300"
                  id="btn-admin-reload-orders"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                  <span className="text-4xl block">💤</span>
                  <h3 className="font-bold text-white">Nenhum pedido recebido ainda</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    Quando um cliente finalizar a compra no catálogo, o pedido aparecerá instantaneamente listado aqui para você monitorar e preparar.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    return (
                      <div key={order.id} className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden p-5 space-y-4 relative">
                        
                        {/* Status badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-neutral-900 border border-neutral-800 text-neutral-300 rounded px-2.5 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                            id={`select-status-${order.id}`}
                          >
                            <option value="pending">⏳ Pendente</option>
                            <option value="confirmed">👍 Confirmado</option>
                            <option value="ready">📦 Pronto p/ Retirada</option>
                            <option value="completed">✅ Entregue</option>
                            <option value="canceled">❌ Cancelado</option>
                          </select>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 text-neutral-600 hover:text-red-500 transition-colors"
                            title="Remover Registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Order Metadata */}
                        <div className="flex flex-wrap gap-4 items-baseline">
                          <span className="text-sm font-extrabold text-purple-500 font-mono">#{order.id}</span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {new Date(order.createdAt).toLocaleString('pt-BR')}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            order.deliveryType === 'delivery' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {order.deliveryType === 'delivery' ? 'Entrega em Casa' : 'Retirada'}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-b border-neutral-900 py-3">
                          <div className="space-y-1">
                            <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-wider">Cliente</span>
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-neutral-500" />
                              {order.clientName}
                            </span>
                            <span className="text-neutral-400 flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                              {order.clientPhone}
                            </span>
                          </div>
                          {order.address && (
                            <div className="space-y-1">
                              <span className="text-neutral-500 block uppercase font-mono text-[9px] tracking-wider">Endereço de Entrega</span>
                              <span className="text-neutral-300 flex items-start gap-1.5 leading-relaxed">
                                <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                                {order.address}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Items listed */}
                        <div className="space-y-1.5">
                          <span className="text-neutral-500 uppercase font-mono text-[9px] tracking-wider block">Itens Solicitados</span>
                          <div className="space-y-1 max-h-[150px] overflow-y-auto">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-xs flex justify-between bg-neutral-900/50 p-2 rounded border border-neutral-900/80">
                                <div>
                                  <span className="font-bold text-neutral-300">{item.quantity}x</span>{' '}
                                  <span className="text-neutral-200">{item.productName}</span>
                                  {item.selectedVariations.length > 0 && (
                                    <span className="text-neutral-500 text-[10px] block mt-0.5">
                                      {item.selectedVariations.map(v => `${v.name}: ${v.value}`).join(', ')}
                                    </span>
                                  )}
                                </div>
                                <span className="font-bold text-neutral-400">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Observations */}
                        {order.observation && (
                          <div className="p-2.5 bg-purple-500/5 border border-purple-500/10 rounded-lg text-xs text-purple-400 leading-relaxed">
                            <strong>Observação do cliente:</strong> "{order.observation}"
                          </div>
                        )}

                        {/* Receipt and Total */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-900 pt-3 text-xs">
                          <div className="flex gap-4">
                            <div className="text-neutral-500">
                              Subtotal: <span className="text-neutral-300 font-bold font-mono">R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {order.deliveryFee > 0 && (
                              <div className="text-neutral-500">
                                Taxa: <span className="text-neutral-300 font-bold font-mono">R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
                              </div>
                            )}
                            <div className="text-white">
                              Total Geral: <span className="text-purple-500 font-black font-mono">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>

                          {/* Quick client Chat trigger */}
                          <a
                            href={`https://wa.me/${order.clientPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 transition-colors text-neutral-950 font-bold flex items-center gap-1 leading-none shadow"
                            id={`btn-chat-client-${order.id}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Conversar no WhatsApp</span>
                          </a>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PRODUTOS (ESTOQUE) */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  Gerenciamento de Produtos em Estoque
                </h2>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                  id="btn-admin-add-product"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Produto</span>
                </button>
              </div>

              {/* Table listings */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left" id="products-admin-table">
                  <thead className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Foto</th>
                      <th className="py-3 px-4">Cód / Nome</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Preço (R$)</th>
                      <th className="py-3 px-4">Estoque</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {products.map((p) => {
                      return (
                        <tr key={p.id} className="hover:bg-neutral-950/40 transition-colors">
                          <td className="py-2.5 px-4 w-14">
                            <div className="w-11 h-11 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-base text-neutral-600">🍁</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="font-semibold text-white truncate">{p.name}</div>
                            {p.code ? (
                              <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{p.code}</span>
                            ) : (
                              <span className="text-[10px] text-neutral-600 block mt-0.5">Sem código</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-400">
                            {categories.find(c => c.id === p.category)?.name ?? 'Outros'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {p.promoPrice ? (
                              <div>
                                <span className="text-purple-500 block">R$ {p.promoPrice.toFixed(2)}</span>
                                <span className="text-[10px] text-neutral-500 line-through block">R$ {p.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-300">R$ {p.price.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                              p.stock === 0
                                ? 'bg-red-500/10 text-red-500'
                                : p.stock <= 2
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-neutral-800 text-neutral-300'
                            }`}>
                              {p.stock} un
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 font-bold ${p.isActive ? 'text-emerald-500' : 'text-neutral-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                              {p.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-purple-500 hover:text-purple-400 transition-colors"
                                title="Editar"
                                id={`btn-edit-prod-${p.id}`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded bg-neutral-900 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors"
                                title="Excluir"
                                id={`btn-delete-prod-${p.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIAS */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Gerenciamento de Categorias
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Add category form */}
                <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
                  <h3 className="text-xs uppercase tracking-wider text-purple-500 font-semibold">Nova Categoria</h3>
                  
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Nome da Categoria</label>
                      <input
                        type="text"
                        placeholder="Ex: SILICONES, CHAVEROS, ETC"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                        id="cat-input-name"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-500 text-neutral-950 font-bold rounded-lg text-xs uppercase flex items-center gap-1 shadow"
                      id="btn-save-cat"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar</span>
                    </button>
                  </form>
                </div>

                {/* Right: Category List */}
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-3">Categorias Ativas</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {categories.map(c => {
                      const prodCount = products.filter(p => p.category === c.id).length;
                      return (
                        <div key={c.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-white block uppercase tracking-wide">{c.name}</span>
                            <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">{prodCount} produtos cadastrados</span>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                            title="Remover Categoria"
                            id={`btn-delete-cat-${c.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: CONFIGURAÇÕES GERAIS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Configurações da Loja e Delivery
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-5 max-w-xl">
                
                {/* Store Logo Section */}
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                      <span>Logotipo da Loja (Logo)</span>
                    </label>
                    {setLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setSetLogoUrl('')}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover Logo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Logo Preview */}
                    <div className="w-16 h-16 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow-lg">
                      {setLogoUrl ? (
                        <img
                          src={setLogoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-purple-500 flex items-center justify-center font-black text-neutral-950 text-xl tracking-wider">
                          TG
                        </div>
                      )}
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap gap-2 items-center">
                        <label className="cursor-pointer px-3.5 py-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow active:scale-95">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{setLogoUrl ? 'Trocar Logo (Arquivo)' : 'Escolher Logo do Aparelho'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </label>
                        <span className="text-[11px] text-neutral-500">ou cole link</span>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="url"
                          placeholder="Cole a URL da imagem da Logo (Ex: https://...)"
                          value={setLogoUrl}
                          onChange={(e) => setSetLogoUrl(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono"
                          id="settings-logourl"
                        />
                        <p className="text-[10px] text-neutral-500">
                          O logotipo aparece no cabeçalho do catálogo, na área do cliente e no painel de gestão.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Nome da Loja</label>
                    <input
                      type="text"
                      required
                      value={setStoreName}
                      onChange={(e) => setSetStoreName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      id="settings-storename"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">WhatsApp Oficial (Com DDD)</label>
                    <input
                      type="text"
                      required
                      value={setPhone}
                      onChange={(e) => setSetPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      id="settings-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Instagram (@perfil)</label>
                    <input
                      type="text"
                      value={setInstagram}
                      onChange={(e) => setSetInstagram(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      id="settings-instagram"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Prazo de Retirada na Loja</label>
                    <input
                      type="text"
                      required
                      value={setPickupTime}
                      onChange={(e) => setSetPickupTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      id="settings-pickuptime"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Taxa de Entrega Padrão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={setDeliveryFee}
                    onChange={(e) => setSetDeliveryFee(e.target.value)}
                    className="w-32 bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                    id="settings-deliveryfee"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Endereço da Loja Física</label>
                  <textarea
                    rows={3}
                    required
                    value={setAddress}
                    onChange={(e) => setSetAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    id="settings-address"
                  />
                </div>

                <div className="space-y-1 p-3.5 bg-neutral-950 rounded-xl border border-neutral-850">
                  <label className="text-xs text-neutral-300 block font-semibold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link do Grupo VIP no WhatsApp</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={setVipGroupUrl}
                    onChange={(e) => setSetVipGroupUrl(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono"
                    id="settings-vipgroupurl"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Este link é exibido no banner de destaque e na barra lateral da tela inicial do catálogo para os clientes entrarem no seu Grupo VIP.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold rounded-lg text-xs uppercase flex items-center gap-1.5 shadow"
                  id="btn-settings-save"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </button>

              </form>

              {/* SECURITY - PIN ACCESS CARD */}
              <div className="border-t border-neutral-800 pt-6 mt-8 max-w-xl">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  Segurança - Alterar PIN do Gestor
                </h3>
                <p className="text-neutral-400 text-xs mb-4 leading-relaxed">
                  Modifique o PIN numérico de acesso ao painel para proteger sua loja contra acessos não autorizados. Você pode definir qualquer código de 4 a 8 dígitos (ex: 1234, 1998, 20132013). O PIN atual configurado é <span className="font-mono text-white bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">{currentPIN}</span>.
                </p>

                <form onSubmit={handleUpdatePIN} className="space-y-4 bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Novo PIN (4 a 8 dígitos)</label>
                      <input
                        type="password"
                        maxLength={8}
                        placeholder="Ex: 1234 ou 20132013"
                        required
                        value={newPIN}
                        onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-widest text-center"
                        id="input-new-pin"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Confirmar Novo PIN</label>
                      <input
                        type="password"
                        maxLength={8}
                        placeholder="Repita o novo PIN"
                        required
                        value={confirmNewPIN}
                        onChange={(e) => setConfirmNewPIN(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono tracking-widest text-center"
                        id="input-confirm-pin"
                      />
                    </div>
                  </div>

                  {pinMessage && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${pinMessage.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {pinMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-purple-500/30 text-purple-500 font-bold rounded-lg text-xs uppercase flex items-center gap-1.5 transition-colors"
                    id="btn-update-pin"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Atualizar PIN de Segurança</span>
                  </button>
                </form>
              </div>

              {/* CLOUD DATABASE SYNC */}
              <div className="border-t border-neutral-800 pt-6 mt-8 max-w-xl">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-500" />
                  Sincronização em Nuvem (Multi-Dispositivo)
                </h3>
                <p className="text-neutral-400 text-xs mb-4 leading-relaxed">
                  Sincronize seu catálogo, configurações e pedidos em tempo real. Isso permite que você adicione produtos no computador e eles apareçam instantaneamente no seu celular ou em outros aparelhos!
                </p>

                {!syncStatus ? (
                  <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 flex flex-col items-center justify-center py-10">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-500 mb-2" />
                    <span className="text-xs text-neutral-400 font-medium">Carregando informações de sincronização...</span>
                  </div>
                ) : (
                  <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${syncStatus.enabled && !syncStatus.connectionError ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-bold text-white uppercase">
                          {syncStatus.connectionError
                            ? 'Falha na Conexão'
                            : syncStatus.enabled
                              ? `Banco ${syncStatus.bucketId} Ativo`
                              : 'Sincronização Desativada'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Tipo: {syncStatus.bucketId}
                      </span>
                    </div>

                    {/* Connection Error Warning Box */}
                    {syncStatus.connectionError && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs leading-relaxed text-red-400 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <span>
                            {syncStatus.isNetworkError 
                              ? 'Conectando ao Servidor...' 
                              : 'Falha na Conexão com o Banco de Dados'}
                          </span>
                        </div>
                        <p className="text-neutral-300 font-medium">
                          {syncStatus.connectionError}
                        </p>
                        
                        {syncStatus.isNetworkError ? (
                          <div className="pt-2 flex items-center justify-between border-t border-red-500/10">
                            <span className="text-[10px] text-neutral-500 animate-pulse">Tentando reconectar automaticamente...</span>
                            <button
                              onClick={fetchSyncStatus}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md text-[11px] font-semibold text-white transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3 text-purple-500" />
                              Tentar Novamente
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-400 space-y-1 pt-1 border-t border-red-500/10">
                            <p className="font-bold text-neutral-300">Como resolver no MongoDB Atlas:</p>
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>Acesse seu painel do <strong>MongoDB Atlas</strong>.</li>
                              <li>Vá em <strong>Database Access</strong> e confirme seu usuário e senha.</li>
                              <li>Substitua o marcador de posição <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">&lt;db_password&gt;</code> na sua URI de conexão.</li>
                              <li><strong>Importante:</strong> Certifique-se de remover também os sinais de menor e maior (<code className="text-white">&lt;</code> e <code className="text-white">&gt;</code>).</li>
                              <li>Insira a URI corrigida nas <strong>Configurações (Secrets)</strong> da barra lateral esquerda do AI Studio.</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sync Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-400">
                      <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-900">
                        <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Última Sincronização</span>
                        <span className="text-white font-mono">
                          {syncStatus.lastSynced 
                            ? new Date(syncStatus.lastSynced).toLocaleString('pt-BR') 
                            : 'Nenhuma sincronização ainda'}
                        </span>
                      </div>
                      <div className="bg-neutral-900/50 p-2.5 rounded border border-neutral-900">
                        <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Status do Servidor</span>
                        <span className={`font-bold flex items-center gap-1 ${syncStatus.connectionError ? 'text-red-400' : 'text-emerald-400'}`}>
                          {syncStatus.connectionError ? (
                            <>
                              <X className="w-3.5 h-3.5" /> Erro de Autenticação
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" /> Online & Conectado
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Fallback Warning Notice */}
                    {syncStatus.isUsingFallback && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs leading-relaxed text-purple-300 space-y-1" id="fallback-sync-notice">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Database className="w-4 h-4 text-purple-400 animate-pulse" />
                          <span>Modo de Sincronização Ativo (Instantâneo)</span>
                        </div>
                        <p>
                          Seu catálogo já está sincronizando em tempo real entre todos os dispositivos perfeitamente usando nosso servidor de backup!
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Para ativar a nuvem permanente oficial (sem expiração), confirme o e-mail de ativação que a <span className="font-semibold text-neutral-300">kvdb.io</span> enviou para <span className="font-semibold text-neutral-300">rafalinsqueiroz10@gmail.com</span> no seu e-mail.
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleForcePush}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow disabled:opacity-50 cursor-pointer"
                        title="Envia todos os produtos e configurações deste computador para a nuvem."
                      >
                        {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>Enviar Dados para a Nuvem</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleForcePull}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Baixa os produtos e pedidos salvos na nuvem para este aparelho."
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Baixar Dados da Nuvem</span>
                      </button>
                    </div>

                    {/* Interactive Link */}
                    <div className="pt-2 text-[10px] text-neutral-500 leading-relaxed border-t border-neutral-900 flex flex-col gap-1.5">
                      <p>
                        🔗 Quer ver ou mexer nos dados brutos do seu banco de dados na nuvem? Você pode acessar o link público do seu JSON de armazenamento diretamente aqui:
                      </p>
                      <a 
                        href={syncStatus.cloudUrl} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="text-purple-400 hover:text-purple-300 font-mono break-all underline hover:no-underline flex items-center gap-1"
                      >
                        {syncStatus.cloudUrl}
                      </a>
                    </div>
                  </div>
                )}

                {syncMessage && (
                  <div className={`mt-4 p-3 rounded-lg text-xs font-semibold ${syncMessage.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {syncMessage.text}
                  </div>
                )}
              </div>

            </div>
          )}


        </main>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              id="product-form-modal"
            >
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
                id="btn-close-product-form"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>

                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                  
                  {/* Product Image Section */}
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-purple-500" />
                        <span>Foto do Produto</span>
                      </label>
                      {prodImage && (
                        <button
                          type="button"
                          onClick={() => setProdImage('')}
                          className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover Foto
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      {/* Image Preview Box */}
                      <div className="w-20 h-20 rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center relative group">
                        {prodImage ? (
                          <img
                            src={prodImage}
                            alt="Preview do Produto"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-neutral-600 gap-1 p-2 text-center">
                            <Camera className="w-5 h-5 text-neutral-600" />
                            <span className="text-[9px] leading-tight font-medium">Sem Foto</span>
                          </div>
                        )}
                        {isUploadingProdImage && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex flex-wrap gap-2 items-center">
                          <label className="cursor-pointer px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow active:scale-95">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{prodImage ? 'Trocar Foto do Aparelho' : 'Escolher Foto do Aparelho'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProductImageUpload}
                            />
                          </label>
                          <span className="text-[11px] text-neutral-500">ou cole link</span>
                        </div>

                        <div className="space-y-1">
                          <input
                            type="url"
                            placeholder="Cole o link da imagem (Ex: https://...)"
                            value={prodImage}
                            onChange={(e) => setProdImage(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono"
                            id="form-product-image"
                          />
                          <p className="text-[10px] text-neutral-500">
                            Carregue uma foto da câmera/galeria ou cole uma URL direta da internet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Nome do Produto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 1 Und Seda Blue Silk"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors"
                        id="form-product-name"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Código do Produto (SKU)</label>
                      <input
                        type="text"
                        placeholder="Ex: SED-001"
                        value={prodCode}
                        onChange={(e) => setProdCode(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors"
                        id="form-product-code"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Descrição do Produto *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Descreva detalhes, composição, tamanho, marcas, etc."
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      id="form-product-desc"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Preço Original (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="35,00"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors"
                        id="form-product-price"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Preço Promocional (Opcional)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="24,99"
                        value={prodPromoPrice}
                        onChange={(e) => setProdPromoPrice(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors"
                        id="form-product-promoprice"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Quantidade em Estoque</label>
                      <input
                        type="number"
                        required
                        placeholder="10"
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors"
                        id="form-product-stock"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="space-y-1">
                      <label className="text-xs text-neutral-400 block font-semibold">Categoria *</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors"
                        id="form-product-category"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        checked={prodIsActive}
                        onChange={(e) => setProdIsActive(e.target.checked)}
                        className="accent-purple-500 w-4 h-4 shrink-0 rounded cursor-pointer"
                        id="form-product-active"
                      />
                      <label htmlFor="form-product-active" className="text-xs text-neutral-300 font-semibold cursor-pointer">
                        Produto Ativo no Catálogo
                      </label>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="checkbox"
                        checked={prodFeatured}
                        onChange={(e) => setProdFeatured(e.target.checked)}
                        className="accent-purple-500 w-4 h-4 shrink-0 rounded cursor-pointer"
                        id="form-product-featured"
                      />
                      <label htmlFor="form-product-featured" className="text-xs text-neutral-300 font-semibold cursor-pointer">
                        Destaque da Loja
                      </label>
                    </div>
                  </div>

                  {/* Variations Input Guide */}
                  <div className="space-y-1.5 border-t border-neutral-850 pt-4">
                    <label className="text-xs text-neutral-400 block font-semibold">Variações / Opções do Produto</label>
                    <p className="text-[10px] text-neutral-500 leading-normal mb-1">
                      Digite cada grupo de variação em uma linha com o formato <span className="font-mono text-neutral-400">Nome: Opção1, Opção2, Opção3</span> (ex: <span className="font-mono text-neutral-400">Cor: Azul, Preto, Rosa</span>).
                    </p>
                    <textarea
                      rows={2}
                      placeholder="Cor: Vermelho, Preto, Branco&#10;Tamanho: P, M, G"
                      value={prodVariationsText}
                      onChange={(e) => setProdVariationsText(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-lg py-2.5 px-3 focus:outline-none focus:border-purple-500 transition-colors resize-none font-mono"
                      id="form-product-variations"
                    />
                  </div>

                  <div className="border-t border-neutral-850 pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="px-4 py-2 bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-neutral-950 font-bold rounded-lg text-xs uppercase shadow"
                      id="btn-product-submit"
                    >
                      <span>Salvar Produto</span>
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
