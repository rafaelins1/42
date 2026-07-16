/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductVariation {
  name: string; // e.g. "Cor", "Tamanho"
  options: string[]; // e.g. ["Azul", "Preto", "Rosa"]
}

export interface SelectedVariation {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  code?: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  image?: string;
  variations?: ProductVariation[];
  stock: number;
  isActive: boolean;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariations: SelectedVariation[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'canceled';

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  deliveryType: 'delivery' | 'pickup';
  address?: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedVariations: SelectedVariation[];
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  observation?: string;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  instagram: string;
  address: string;
  deliveryFee: number;
  pickupTime: string;
  whatsappMessageTemplate: string;
}
