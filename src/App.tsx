/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialProducts, initialCategories, defaultSettings } from './data/mockProducts';
import { Product, Category, StoreSettings, Order } from './types';
import CatalogView from './components/CatalogView';
import PasscodeGate from './components/PasscodeGate';
import AdminDashboard from './components/AdminDashboard';
import { subscribeToStoreData, savePartialStoreToFirestore, getStoreDataFromFirestore } from './firebase';

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [orders, setOrders] = useState<Order[]>([]);
  const [passcode, setPasscode] = useState<string>('20132013');
  const [isLoading, setIsLoading] = useState(true);

  // Routing state: 'catalog' | 'admin_gate' | 'admin_dashboard'
  const [currentScreen, setCurrentScreen] = useState<'catalog' | 'admin_gate' | 'admin_dashboard'>('catalog');

  // Real-time Firestore sync across all open clients & devices
  useEffect(() => {
    const unsubscribe = subscribeToStoreData((cloudData) => {
      if (cloudData) {
        if (Array.isArray(cloudData.products)) setProducts(cloudData.products);
        if (Array.isArray(cloudData.categories)) setCategories(cloudData.categories);
        if (cloudData.settings && typeof cloudData.settings === 'object') setSettings(cloudData.settings);
        if (Array.isArray(cloudData.orders)) setOrders(cloudData.orders);
        if (cloudData.passcode && typeof cloudData.passcode === 'string' && cloudData.passcode.length === 8) {
          setPasscode(cloudData.passcode);
        }
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Load database from cloud Firestore or server API
  useEffect(() => {
    getStoreDataFromFirestore()
      .then((cloudData) => {
        if (cloudData) {
          if (Array.isArray(cloudData.products)) setProducts(cloudData.products);
          if (Array.isArray(cloudData.categories)) setCategories(cloudData.categories);
          if (cloudData.settings && typeof cloudData.settings === 'object') setSettings(cloudData.settings);
          if (Array.isArray(cloudData.orders)) setOrders(cloudData.orders);
          if (cloudData.passcode && typeof cloudData.passcode === 'string' && cloudData.passcode.length === 8) {
            setPasscode(cloudData.passcode);
          }
          setIsLoading(false);
          return;
        }

        return fetch(`/api/db?t=${Date.now()}`)
          .then((res) => {
            if (!res.ok) throw new Error('API response was not ok');
            return res.json();
          })
          .then((data) => {
            if (data) {
              if (data.products) setProducts(data.products);
              if (data.categories) setCategories(data.categories);
              if (data.settings) setSettings(data.settings);
              if (data.orders) setOrders(data.orders);
              if (data.passcode && data.passcode.length === 8) {
                setPasscode(data.passcode);
              }
            }
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.warn('Network fallback:', err);
        const savedProducts = localStorage.getItem('tabas_products');
        const savedCategories = localStorage.getItem('tabas_categories');
        const savedSettings = localStorage.getItem('tabas_settings');
        const savedOrders = localStorage.getItem('tabasgestion_orders');
        const savedPasscode = localStorage.getItem('tabas_admin_passcode');

        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedPasscode && savedPasscode.length === 8) {
          setPasscode(savedPasscode);
        }
        setIsLoading(false);
      });
  }, []);

  // Handlers to synchronize with backend and direct Firestore cloud
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('tabas_products', JSON.stringify(newProducts));
    savePartialStoreToFirestore({ products: newProducts });
    
    fetch('/api/db/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: newProducts }),
    }).catch((err) => console.error('Failed to save products to server:', err));
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('tabas_categories', JSON.stringify(newCategories));
    savePartialStoreToFirestore({ categories: newCategories });

    fetch('/api/db/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: newCategories }),
    }).catch((err) => console.error('Failed to save categories to server:', err));
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    localStorage.setItem('tabas_settings', JSON.stringify(newSettings));
    savePartialStoreToFirestore({ settings: newSettings });

    fetch('/api/db/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: newSettings }),
    }).catch((err) => console.error('Failed to save settings to server:', err));
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('tabasgestion_orders', JSON.stringify(newOrders));
    savePartialStoreToFirestore({ orders: newOrders });

    fetch('/api/db/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: newOrders }),
    }).catch((err) => console.error('Failed to save orders to server:', err));
  };

  const handleAddOrder = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    const savedOrdersStr = localStorage.getItem('tabasgestion_orders');
    const savedOrders = savedOrdersStr ? JSON.parse(savedOrdersStr) : [];
    localStorage.setItem('tabasgestion_orders', JSON.stringify([newOrder, ...savedOrders]));
    savePartialStoreToFirestore({ orders: updatedOrders });

    fetch('/api/db/orders/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newOrder }),
    }).catch((err) => console.error('Failed to add order to server:', err));
  };

  const handleUpdatePasscode = (newPasscode: string) => {
    setPasscode(newPasscode);
    localStorage.setItem('tabas_admin_passcode', newPasscode);
    savePartialStoreToFirestore({ passcode: newPasscode });

    fetch('/api/db/passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: newPasscode }),
    }).catch((err) => console.error('Failed to save passcode to server:', err));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-4 font-sans" id="loading-container">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" id="loading-spinner"></div>
        <p className="text-xs font-mono text-neutral-400 tracking-wider">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950" id="app-root-container">
      {currentScreen === 'catalog' && (
        <CatalogView
          products={products}
          categories={categories}
          settings={settings}
          onEnterAdmin={() => setCurrentScreen('admin_gate')}
          onAddOrder={handleAddOrder}
        />
      )}

      {currentScreen === 'admin_gate' && (
        <PasscodeGate
          onSuccess={() => setCurrentScreen('admin_dashboard')}
          onCancel={() => setCurrentScreen('catalog')}
          correctPasscode={passcode}
        />
      )}

      {currentScreen === 'admin_dashboard' && (
        <AdminDashboard
          products={products}
          categories={categories}
          settings={settings}
          orders={orders}
          passcode={passcode}
          onUpdateProducts={handleUpdateProducts}
          onUpdateCategories={handleUpdateCategories}
          onUpdateSettings={handleUpdateSettings}
          onUpdateOrders={handleUpdateOrders}
          onUpdatePasscode={handleUpdatePasscode}
          onExit={() => setCurrentScreen('catalog')}
        />
      )}
    </div>
  );
}
