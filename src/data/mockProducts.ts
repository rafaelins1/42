/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, StoreSettings } from '../types';

export const initialCategories: Category[] = [
  { id: 'KITS_COMPLETOS', name: 'KITS COMPLETOS', order: 1 },
  { id: 'SEDA_BLUNTS', name: 'SEDA/BLUNTS', order: 2 },
  { id: 'PITEIRAS_VIDRO', name: 'PITEIRAS DE VIDRO', order: 3 },
  { id: 'DICHAVADORES', name: 'DICHAVADORES', order: 4 },
  { id: 'PITEIRA_FILTRO', name: 'PITEIRA/FILTRO', order: 5 },
  { id: 'SLICKS', name: 'SLICKS', order: 6 },
  { id: 'CUIAS', name: 'CUIAS', order: 7 },
  { id: 'ISQUEIROS_MACARICOS', name: 'ISQUEIROS/MAÇARICOS', order: 8 },
  { id: 'TESOURAS', name: 'TESOURAS', order: 9 },
  { id: 'CUIAS_CERAMICA', name: 'CUIAS DE CERÂMICA', order: 10 },
  { id: 'HEADSHOP', name: 'HEADSHOP', order: 11 },
  { id: 'CASES', name: 'CASES', order: 12 },
  { id: 'BANDEJAS', name: 'BANDEJAS', order: 13 },
  { id: 'BONGS_PIPES', name: 'BONGS/PIPES', order: 14 },
  { id: 'TABACO_KUMBAYA', name: 'T4BAC0 0RG / KUMBAYA', order: 15 },
  { id: 'BOLADORES', name: 'BOLADORES', order: 16 },
  { id: 'CINZEIROS', name: 'CINZEIROS', order: 17 }
];

export const defaultSettings: StoreSettings = {
  storeName: 'TabasGestion',
  phone: '+5571981450503',
  instagram: '@tabasgestion',
  address: 'Rua Doutor Augusto Lopes Pontes 455, Salvador - BA',
  deliveryFee: 10.00,
  pickupTime: '24 horas',
  whatsappMessageTemplate: 'Olá TabasGestion! Gostaria de fazer o seguinte pedido:',
  vipGroupUrl: 'https://chat.whatsapp.com/I38enKB1mtzKN1yxNLuzZV?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAcGRvZgJzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaeANudPlmE3P-wSV0SRjpLfqMxg0w6ekmZEKRuQugpoWQ0JM7UbEsDlCgflcw_aem_9aoKn118zHWAejZ0Bi4wrA'
};

export const initialProducts: Product[] = [
  // KITS COMPLETOS
  {
    id: 'kit-azul-hippster',
    code: 'KIT-001',
    name: 'KIT AZUL Case HIPPSTER CLUB - COMPLETO',
    description: 'Kit completo premium montado em case anti-impacto Hippster Club azul. Contém: Case, dichavador, cuia de silicone, isqueiro Clipper recarregável, piteira de vidro, seda e porta-beck.',
    price: 90.00,
    promoPrice: 79.99,
    category: 'KITS_COMPLETOS',
    stock: 5,
    isActive: true,
    featured: true
  },
  {
    id: 'kit-laranja-hippster',
    code: 'KIT-002',
    name: 'KIT LARANJA Case HIPPSTER CLUB - COMPLETO',
    description: 'Kit completo premium montado em case anti-impacto Hippster Club laranja vibrante. Perfeito para transporte seguro e discreto com todos os acessórios inclusos.',
    price: 90.00,
    category: 'KITS_COMPLETOS',
    stock: 4,
    isActive: true,
    featured: true
  },
  {
    id: 'kit-premium-amarelo',
    code: 'KIT-003',
    name: 'KIT PREMIUM AMARELO Case HIPPSTER CLUB - COMPLETO',
    description: 'Edição de colecionador premium. Case rígido amarelo especial contendo acessórios selecionados de alta qualidade das melhores marcas.',
    price: 170.00,
    promoPrice: 139.99,
    category: 'KITS_COMPLETOS',
    stock: 3,
    isActive: true,
    featured: true
  },

  // SEDA/BLUNTS
  {
    id: 'seda-piteira-papelito',
    code: 'SED-001',
    name: '1 Und Seda + Piteira PAPELITO bandeja dobrável',
    description: 'Seda king size Papelito premium Brown/Alvejada + piteira em papel de alta qualidade, com bandeja dobrável integrada no livreto.',
    price: 8.50,
    category: 'SEDA_BLUNTS',
    stock: 35,
    isActive: true
  },
  {
    id: 'seda-blue-silk',
    code: 'SED-002',
    name: '1 Und Seda BLUE SILK',
    description: 'Seda de alta qualidade com combustão lenta e papel extra fino. Ótimo custo-benefício para o dia a dia.',
    price: 1.11,
    category: 'SEDA_BLUNTS',
    stock: 120,
    isActive: true
  },
  {
    id: 'seda-bros-rosa',
    code: 'SED-003',
    name: '1 Und Seda BROS rosa (66 folhas)',
    description: 'Seda Bros cor de rosa super charmosa com 66 folhas. Papel fino, queima lenta e cola orgânica natural.',
    price: 5.50,
    category: 'SEDA_BLUNTS',
    stock: 40,
    isActive: true
  },

  // PITEIRAS DE VIDRO
  {
    id: 'piteira-vidro-penguim-xl',
    code: 'PIT-001',
    name: 'Piteira de Vidro PENGUIM XL',
    description: 'Piteira de vidro borossilicato Penguim XL. Reduz danos, resfria a fumaça e é totalmente lavável e reutilizável.',
    price: 70.00,
    promoPrice: 60.00,
    category: 'PITEIRAS_VIDRO',
    stock: 12,
    isActive: true,
    featured: true
  },

  // DICHAVADORES
  {
    id: 'dichavador-cubo-lrc',
    code: 'DIC-001',
    name: '1 Und Dichavador Cubo LION ROLLING CIRCUS 4 partes',
    description: 'Dichavador premium formato de cubo oficial Lion Rolling Circus. 4 partes com tela coletora de kief e dentes de metal ultra resistentes.',
    price: 75.00,
    promoPrice: 45.00,
    category: 'DICHAVADORES',
    stock: 8,
    isActive: true,
    featured: true
  },
  {
    id: 'dichavador-cubo-mystic',
    code: 'DIC-002',
    name: '1 Und Dichavador Cubo MYSTIC TIMBERS 4 partes',
    description: 'Dichavador de alta durabilidade com design elegante Mystic Timbers. Ideal para triturar de forma homogênea.',
    price: 50.00,
    category: 'DICHAVADORES',
    variations: [
      { name: 'Acabamento', options: ['Madeira Escura', 'Madeira Clara'] }
    ],
    stock: 15,
    isActive: true
  },

  // SLICKS
  {
    id: 'slick-divisor-squadafum',
    code: 'SLI-001',
    name: '1 Und Slick Com Divisor SQUADAFUM 25ml',
    description: 'Pote de silicone Squadafum de 25ml com divisória interna. Ideal para armazenar suas extrações com segurança, sem grudar e mantendo as propriedades.',
    price: 35.00,
    category: 'SLICKS',
    variations: [
      { name: 'Cor', options: ['Rosa/Preto', 'Azul/Verde', 'Preto Sólido'] }
    ],
    stock: 22,
    isActive: true
  },
  {
    id: 'slick-lego-26ml',
    code: 'SLI-002',
    name: '1 Und Slick LEGO 26ML',
    description: 'Recipiente de silicone modular empilhável modelo bloco de Lego. Capacidade de 26ml para armazenamento seguro.',
    price: 24.99,
    category: 'SLICKS',
    variations: [
      { name: 'Cor', options: ['Colorido', 'Amarelo/Roxo', 'Verde Neon'] }
    ],
    stock: 18,
    isActive: true
  },

  // CUIAS
  {
    id: 'cuia-banheira-silly-g',
    code: 'CUI-001',
    name: '1 Und Cuia Banheira Silicone Bandeja SILLY TRAY - G',
    description: 'Cuia de silicone de tamanho Grande em formato de banheira Silly Tray. Espaço perfeito para picotar suas ervas sem desperdício.',
    price: 22.50,
    category: 'CUIAS',
    variations: [
      { name: 'Cor', options: ['Mármore Roxo', 'Preto Sólido', 'Splash Neon'] }
    ],
    stock: 14,
    isActive: true
  },

  // ISQUEIROS/MAÇARICOS
  {
    id: 'isqueiro-clipper',
    code: 'ISQ-001',
    name: '1 Und Isqueiro CLIPER Recarregável',
    description: 'Isqueiro Clipper oficial, recarregável e com pedra trocável. Acessório indispensável com o famoso pilador embutido.',
    price: 9.00,
    category: 'ISQUEIROS_MACARICOS',
    variations: [
      { name: 'Estampa', options: ['Psychedelic', 'Classic Black', 'Metal Gold', 'Skull Art'] }
    ],
    stock: 55,
    isActive: true
  },
  {
    id: 'macarico-prof-recarregavel',
    code: 'ISQ-002',
    name: '1 Und Maçarico PROF Recarregável',
    description: 'Maçarico compacto profissional recarregável a gás butano. Chama potente com controle de intensidade e trava de segurança.',
    price: 27.50,
    category: 'ISQUEIROS_MACARICOS',
    stock: 10,
    isActive: true,
    featured: true
  },

  // TESOURAS
  {
    id: 'tesoura-metal-garca',
    code: 'TES-001',
    name: '1 Und Tesoura de Metal Garça',
    description: 'Tesoura de metal cirúrgico com design clássico de garça. Ponta fina e afiação precisa, ideal para picotar com maestria.',
    price: 35.00,
    promoPrice: 24.99,
    category: 'TESOURAS',
    stock: 6,
    isActive: true
  },

  // HEADSHOP
  {
    id: 'anel-f1-sadhu',
    code: 'HEA-001',
    name: '1 Und Anel F1 SADHU',
    description: 'Anel de silicone Sadhu porta cigarro. Permite que você segure seu beck enquanto joga, digita ou dirige sem queimar os dedos.',
    price: 9.99,
    category: 'HEADSHOP',
    variations: [
      { name: 'Tamanho', options: ['M (18mm)', 'G (20mm)'] }
    ],
    stock: 30,
    isActive: true
  },
  {
    id: 'porta-beck-metal-bb',
    code: 'HEA-002',
    name: '1 Und Porta Beck Metal BEM BOLADO G',
    description: 'Mantenha seu beck seguro e à prova de água e odores. Tubo de metal de alta resistência Bem Bolado.',
    price: 25.00,
    category: 'HEADSHOP',
    variations: [
      { name: 'Cor', options: ['Azul', 'Verde', 'Preto', 'Amarelo', 'Cinza'] }
    ],
    stock: 25,
    isActive: true
  },

  // TABACO/KUMBAYA
  {
    id: 'tabaco-amsterdam',
    code: 'TAB-001',
    name: '1 Und Tabaco AMSTERDAM - 25g',
    description: 'Tabaco Amsterdam extra suave, livre de aditivos químicos. Fios longos e fáceis de enrolar.',
    price: 22.00,
    category: 'TABACO_KUMBAYA',
    stock: 45,
    isActive: true
  },
  {
    id: 'kumbaya-tabaco-sasso',
    code: 'TAB-002',
    name: 'Kumbaya com Tabaco SASSO - 25g',
    description: 'Blend especial de Kumbaya (ervas naturais) selecionadas harmonizado com o melhor tabaco suave Sasso.',
    price: 20.00,
    category: 'TABACO_KUMBAYA',
    stock: 15,
    isActive: true
  }
];
