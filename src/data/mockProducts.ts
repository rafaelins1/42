/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, StoreSettings } from '../types';

export const initialCategories: Category[] = [
  { id: 'KITS_COMPLETOS', name: 'KITS COMPLETOS', order: 1 },
  { id: 'FILTROS', name: 'FILTROS', order: 2 },
  { id: 'SEDA_BLUNTS', name: 'SEDA/BLUNTS', order: 3 },
  { id: 'PITEIRAS_VIDRO', name: 'PITEIRAS DE VIDRO', order: 4 },
  { id: 'DICHAVADORES', name: 'DICHAVADORES', order: 5 },
  { id: 'PITEIRAS_PAPEL', name: 'PITEIRAS DE PAPEL', order: 6 },
  { id: 'SLICKS', name: 'SLICKS', order: 7 },
  { id: 'CUIAS', name: 'CUIAS', order: 8 },
  { id: 'ISQUEIROS_MACARICOS', name: 'ISQUEIROS/MAÇARICOS', order: 9 },
  { id: 'TESOURAS', name: 'TESOURAS', order: 10 },
  { id: 'CUIAS_CERAMICA', name: 'CUIAS DE CERÂMICA', order: 11 },
  { id: 'HEADSHOP', name: 'HEADSHOP', order: 12 },
  { id: 'CASES', name: 'CASES', order: 13 },
  { id: 'BANDEJAS', name: 'BANDEJAS', order: 14 },
  { id: 'BONGS_PIPES', name: 'BONGS/PIPES', order: 15 },
  { id: 'TABACO_KUMBAYA', name: 'T4BACO ORG / KUMBAYA', order: 16 },
  { id: 'BOLADORES', name: 'BOLADORES', order: 17 },
  { id: 'CINZEIROS', name: 'CINZEIROS', order: 18 },
  { id: 'SHOULDER_BAG', name: 'SHOULDER BAG', order: 19 },
  { id: 'OUTROS', name: 'OUTROS', order: 20 }
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
  // 1. KITS COMPLETOS
  {
    id: 'prod-kit-hall-of-weed',
    code: 'KIT-001',
    name: 'KIT Lata HALL OF WEED - COMPLETO',
    description: 'Kit lata completo temático Hall of Weed contendo acessórios essenciais para sua sessão.',
    price: 40.00,
    promoPrice: 34.99,
    category: 'KITS_COMPLETOS',
    image: '/assets/products/kit_hall_of_weed.png',
    stock: 8,
    isActive: true,
    featured: true
  },

  // 2. FILTROS
  {
    id: 'prod-filtro-papelito-bio',
    code: 'FLT-001',
    name: 'Filtro PAPELITO biodegradável',
    description: 'Pacote de filtros ecológicos biodegradáveis Papelito para redução de danos.',
    price: 12.00,
    promoPrice: 9.99,
    category: 'FILTROS',
    image: '/assets/products/filtro_papelito_biodegradavel.png',
    stock: 25,
    isActive: true
  },
  {
    id: 'prod-filtro-papelito-longo-bio',
    code: 'FLT-002',
    name: 'Filtro PAPELITO longo biodegradável',
    description: 'Filtros longos biodegradáveis Papelito, resfriamento aprimorado e menor impacto ambiental.',
    price: 12.50,
    promoPrice: 10.99,
    category: 'FILTROS',
    image: '/assets/products/filtro_papelito_longo_biodegradavel.png',
    stock: 20,
    isActive: true
  },
  {
    id: 'prod-filtro-papelito-slim',
    code: 'FLT-003',
    name: 'Filtro PAPELITO slim',
    description: 'Filtro clássico modelo slim Papelito de alta densidade.',
    price: 12.00,
    promoPrice: 9.99,
    category: 'FILTROS',
    image: '/assets/products/filtro_papelito_slim.png',
    stock: 30,
    isActive: true
  },
  {
    id: 'prod-filtro-papelito-ultra-longo',
    code: 'FLT-004',
    name: 'Filtro PAPELITO ultra longo',
    description: 'Edição ultra longo Papelito para máxima filtragem e conforto.',
    price: 17.50,
    promoPrice: 14.99,
    category: 'FILTROS',
    image: '/assets/products/filtro_papelito_ultra_longo.png',
    stock: 15,
    isActive: true
  },
  {
    id: 'prod-filtro-bembolado-slim-bio',
    code: 'FLT-005',
    name: 'Filtro slim biodegradável BEMBOLADO',
    description: 'Filtros slim 100% biodegradáveis Bem Bolado Brasil.',
    price: 11.00,
    promoPrice: 8.99,
    category: 'FILTROS',
    image: '/assets/products/filtro_bembolado_slim_biodegradavel.png',
    stock: 22,
    isActive: true
  },
  {
    id: 'prod-filtro-papelito-longo-tradicional',
    code: 'FLT-006',
    name: 'Filtro PAPELITO longo tradicional',
    description: 'Filtro tradicional longo Papelito com 120 unidades por pacote.',
    price: 12.00,
    promoPrice: 9.99,
    category: 'FILTROS',
    image: '/assets/products/filtro_papelito_longo_tradicional.png',
    stock: 25,
    isActive: true
  },

  // 3. SEDA / BLUNTS
  {
    id: 'prod-seda-papelito-mini-brown',
    code: 'SDA-001',
    name: '1 seda PAPELITO mini brown',
    description: 'Seda marrom não branqueada mini size Papelito, queima lenta e natural.',
    price: 5.00,
    promoPrice: 2.99,
    category: 'SEDA_BLUNTS',
    image: '/assets/products/seda_papelito_mini_brown.png',
    stock: 40,
    isActive: true
  },
  {
    id: 'prod-seda-piteira-papelito-bandeja',
    code: 'SDA-002',
    name: '1 Und Seda + Piteira PAPELITO bandeja dobrável',
    description: 'Combo completo de seda King Size + piteira e embalagem que se transforma em bandeja dobrável.',
    price: 10.00,
    promoPrice: 7.99,
    category: 'SEDA_BLUNTS',
    image: '/assets/products/seda_piteira_papelito_bandeja.png',
    stock: 35,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-seda-bem-bolado-slim',
    code: 'SDA-003',
    name: '1 Und Seda BEM BOLADO slim',
    description: 'Livretinho clássico Seda Bem Bolado Brasil formato slim.',
    price: 6.50,
    promoPrice: 4.99,
    category: 'SEDA_BLUNTS',
    image: '/assets/products/seda_bem_bolado_slim.png',
    stock: 50,
    isActive: true
  },
  {
    id: 'prod-seda-celulose-aleda-ks',
    code: 'SDA-004',
    name: '1 und seda celulose ALEDA Kingsize',
    description: 'Seda 100% celulose vegetal transparente original aLeda King Size.',
    price: 6.50,
    promoPrice: 4.99,
    category: 'SEDA_BLUNTS',
    image: '/assets/products/seda_celulose_aleda_kingsize.png',
    stock: 30,
    isActive: true
  },
  {
    id: 'prod-seda-celulose-lion-circus-g',
    code: 'SDA-005',
    name: '1 Und Seda Celulose LION CIRCUS G',
    description: 'Seda celulose vegetal Lion Rolling Circus tamanho grande.',
    price: 8.00,
    promoPrice: 4.99,
    category: 'SEDA_BLUNTS',
    image: '/assets/products/seda_celulose_lion_circus_g.png',
    stock: 25,
    isActive: true
  },
  {
    id: 'prod-seda-celulose-lion-circus-p',
    code: 'SDA-006',
    name: '1 Und Seda Celulose LION CIRCUS P',
    description: 'Seda celulose vegetal Lion Rolling Circus tamanho pequeno 1 1/4.',
    price: 8.00,
    promoPrice: 4.99,
    category: 'SEDA_BLUNTS',
    image: '/assets/products/seda_celulose_lion_circus_p.png',
    stock: 25,
    isActive: true
  },

  // 4. PITEIRAS DE VIDRO
  {
    id: 'prod-piteira-vidro-penguim-xl',
    code: 'PTV-001',
    name: 'Piteira de Vidro PENGUIM XL',
    description: 'Piteira artesanal em vidro borossilicato com miniatura de pinguim modelada à mão.',
    price: 75.00,
    promoPrice: 69.99,
    category: 'PITEIRAS_VIDRO',
    image: '/assets/products/piteira_vidro_penguim_xl.png',
    stock: 6,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-piteira-vidro-pinguim-black',
    code: 'PTV-002',
    name: 'Piteira de vidro PINGUIM all black caliglas',
    description: 'Piteira de vidro artesanal borossilicato linha All Black Caliglass.',
    price: 50.00,
    promoPrice: 39.99,
    category: 'PITEIRAS_VIDRO',
    stock: 5,
    isActive: true
  },
  {
    id: 'prod-piteira-vidro-cogu-sorriso',
    code: 'PTV-003',
    name: 'Piteira de vidro COGU SORRISO all black',
    description: 'Piteira de vidro borossilicato com detalhe cogumelo sorriso.',
    price: 50.00,
    promoPrice: 44.99,
    category: 'PITEIRAS_VIDRO',
    stock: 5,
    isActive: true
  },
  {
    id: 'prod-piteira-vidro-pinguim-caliglass',
    code: 'PTV-004',
    name: 'Piteira de vidro PENGUIM caliglass',
    description: 'Piteira especial de vidro Caliglass com detalhe pinguim.',
    price: 45.00,
    promoPrice: 39.99,
    category: 'PITEIRAS_VIDRO',
    stock: 5,
    isActive: true
  },

  // 5. DICHAVADORES
  {
    id: 'prod-dichavador-cubo-lion-circus',
    code: 'DCH-001',
    name: '1 Und Dichavador Cubo LION ROLLING CIRCUS 4 partes',
    description: 'Dichavador metálico premium em formato de cubo mágico com 4 partes e reservatório com tela de kief.',
    price: 75.00,
    promoPrice: 39.99,
    category: 'DICHAVADORES',
    image: '/assets/products/dichavador_cubo_lion_circus.png',
    stock: 7,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-dichavador-cubo-mystic',
    code: 'DCH-002',
    name: '1 Und Dichavador Cubo MYSTIC TIMBERS 4 partes',
    description: 'Dichavador em cubo de 4 partes com estampas psicodélicas Mystic Timbers.',
    price: 45.00,
    promoPrice: 34.99,
    category: 'DICHAVADORES',
    image: '/assets/products/dichavador_cubo_mystic_timbers.png',
    stock: 12,
    isActive: true,
    variations: [
      { name: 'Modelo', options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'] }
    ]
  },
  {
    id: 'prod-dichavador-lion-circus',
    code: 'DCH-003',
    name: '1 Und Dichavador LION ROLLING CIRCUS',
    description: 'Dichavador colecionável dos personagens icônicos Lion Rolling Circus.',
    price: 15.00,
    promoPrice: 9.99,
    category: 'DICHAVADORES',
    image: '/assets/products/dichavador_lion_rolling_circus.png',
    stock: 15,
    isActive: true,
    variations: [
      { name: 'Personagem', options: ['Edgar', 'Ruby', 'Silver', 'Mr. Trampoline', 'Sexy Sadie'] }
    ]
  },
  {
    id: 'prod-dichavador-to-na-be-2p',
    code: 'DCH-004',
    name: '1 Und Dichavador To na Bê 2 partes',
    description: 'Dichavador prático e resistente de 2 fases Tô na Bê.',
    price: 15.00,
    promoPrice: 9.99,
    category: 'DICHAVADORES',
    stock: 18,
    isActive: true,
    variations: [
      { name: 'Cor/Arte', options: ['Laranja', 'Verde', 'Preto', 'Roxo', 'Rosa', 'Amarelo'] }
    ]
  },
  {
    id: 'prod-dichavador-squadafum-triangulo',
    code: 'DCH-005',
    name: 'Dchavador SQUADAFUM triângulo',
    description: 'Dichavador geométrico acrílico transparente em formato triangular Squadafum.',
    price: 25.00,
    promoPrice: 19.99,
    category: 'DICHAVADORES',
    stock: 10,
    isActive: true
  },
  {
    id: 'prod-dichavador-cremaria-fibra-coco',
    code: 'DCH-006',
    name: 'Dichavador CREMARIA fibra de coco',
    description: 'Dichavador sustentável ecológico produzido com fibra natural de coco Cremaria.',
    price: 17.50,
    promoPrice: 11.99,
    category: 'DICHAVADORES',
    stock: 14,
    isActive: true
  },

  // 6. PITEIRAS DE PAPEL
  {
    id: 'prod-piteira-bamf-large',
    code: 'PTP-001',
    name: '1 Und Piteira BAMF Large',
    description: 'Piteira de papel perfurada formato Large para enrolar com firmeza.',
    price: 9.00,
    promoPrice: 7.99,
    category: 'PITEIRAS_PAPEL',
    image: '/assets/products/piteira_bamf_large.png',
    stock: 30,
    isActive: true
  },
  {
    id: 'prod-piteira-bem-bolado-cone',
    code: 'PTP-002',
    name: '1 Und Piteira BEM BOLADO Cone',
    description: 'Piteiras anatômicas pré-formadas formato Cone Bem Bolado.',
    price: 7.50,
    promoPrice: 5.99,
    category: 'PITEIRAS_PAPEL',
    image: '/assets/products/piteira_bem_bolado_cone.png',
    stock: 25,
    isActive: true
  },
  {
    id: 'prod-piteira-bembolado-large',
    code: 'PTP-003',
    name: '1 Und Piteira BEMBOLADO Large',
    description: 'Piteira de papel Large com picote Bem Bolado.',
    price: 5.50,
    promoPrice: 3.99,
    category: 'PITEIRAS_PAPEL',
    image: '/assets/products/piteira_bembolado_large.png',
    stock: 40,
    isActive: true
  },
  {
    id: 'prod-piteira-hippsterclub-xxl',
    code: 'PTP-004',
    name: '1 Und Piteira HIPPSTERCLUB XXL',
    description: 'Bloco de piteiras tamanho extra-longo XXL Hippster Club.',
    price: 13.00,
    promoPrice: 9.99,
    category: 'PITEIRAS_PAPEL',
    image: '/assets/products/piteira_hippsterclub_xxl.png',
    stock: 20,
    isActive: true
  },
  {
    id: 'prod-piteira-nilo-xxl',
    code: 'PTP-005',
    name: '1 Und Piteira NILO XXL',
    description: 'Piteira de papel kraft Nilo formato XXL.',
    price: 8.50,
    promoPrice: 6.99,
    category: 'PITEIRAS_PAPEL',
    image: '/assets/products/piteira_nilo_xxl.png',
    stock: 25,
    isActive: true
  },
  {
    id: 'prod-piteira-papelito-fun-large',
    code: 'PTP-006',
    name: '1 Und Piteira PAPELITO FUN large',
    description: 'Piteiras coloridas e divertidas Papelito linha Fun tamanho large.',
    price: 6.50,
    promoPrice: 5.50,
    category: 'PITEIRAS_PAPEL',
    image: '/assets/products/piteira_papelito_fun_large.png',
    stock: 30,
    isActive: true
  },

  // 7. SLICKS
  {
    id: 'prod-slick-divisor-squadafum',
    code: 'SLK-001',
    name: '1 Und Slick Com Divisor SQUADAFUM 25ml',
    description: 'Pote hermético em silicone de cura platina com divisória interna Squadafum 25ml.',
    price: 28.00,
    promoPrice: 24.99,
    category: 'SLICKS',
    image: '/assets/products/slick_divisor_squadafum_25ml.png',
    stock: 10,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Laranja', 'Amarelo', 'Roxo'] }
    ]
  },
  {
    id: 'prod-slick-cultdab-5ml',
    code: 'SLK-002',
    name: '1 Und Slick CULTDAB 5ml',
    description: 'Slick de silicone platina Cultdab tamanho 5ml.',
    price: 25.00,
    promoPrice: 19.99,
    category: 'SLICKS',
    image: '/assets/products/slick_cultdab_5ml.png',
    stock: 15,
    isActive: true
  },
  {
    id: 'prod-slick-lego-26ml',
    code: 'SLK-003',
    name: '1 Und Slick LEGO 26ML',
    description: 'Slick empilhável estilo Lego de 26ml antiaderente em silicone.',
    price: 25.00,
    promoPrice: 19.99,
    category: 'SLICKS',
    image: '/assets/products/slick_lego_26ml.png',
    stock: 12,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Lilás/Azul', 'Roxo/Rosa', 'Verde/Amarelo', 'Preto/Vermelho', 'Azul/Branco', 'Tie-Dye'] }
    ]
  },
  {
    id: 'prod-slick-mini-cactus-5ml',
    code: 'SLK-004',
    name: '1 Und Slick MINI CACTUS 5ML',
    description: 'Slick divertido em formato de cacto miniatura 5ml.',
    price: 23.00,
    promoPrice: 17.99,
    category: 'SLICKS',
    image: '/assets/products/slick_mini_cactus_5ml.png',
    stock: 14,
    isActive: true
  },
  {
    id: 'prod-slick-sadhu-9ml-3div',
    code: 'SLK-005',
    name: '1 Und Slick SADHU 9ml 3 div',
    description: 'Slick redondo Sadhu com 3 compartimentos internos para separar diferentes extratos.',
    price: 35.00,
    promoPrice: 22.99,
    category: 'SLICKS',
    image: '/assets/products/slick_sadhu_9ml_3div.png',
    stock: 12,
    isActive: true
  },
  {
    id: 'prod-slick-sadhu-espatula',
    code: 'SLK-006',
    name: '1 Und Slick SADHU Com Espátula 12,5ml',
    description: 'Estojo slick Sadhu com espátula de metal para manuseio acoplada.',
    price: 50.00,
    promoPrice: 37.99,
    category: 'SLICKS',
    image: '/assets/products/slick_sadhu_com_espatula.png',
    stock: 8,
    isActive: true
  },

  // 8. CUIAS
  {
    id: 'prod-cuia-banheira-silly-tray-g-laranja',
    code: 'CUA-001',
    name: '1 Und Cuia Banheira Silicone Bandeja SILLY TRAY - Tamanho G',
    description: 'Cuia no formato banheira grande Silly Tray dobrável em silicone.',
    price: 26.00,
    promoPrice: 22.50,
    category: 'CUIAS',
    image: '/assets/products/cuia_banheira_silly_tray_laranja.png',
    stock: 9,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Laranja', 'Amarelo', 'Azul'] }
    ]
  },
  {
    id: 'prod-cuia-banheira-silly-tray-g-verde',
    code: 'CUA-002',
    name: '1 Und Cuia Banheira Silicone SILLY TRAY - Tamanho G',
    description: 'Cuia de silicone Silly Tray tamanho grande em cores vibrantes.',
    price: 24.00,
    promoPrice: 20.00,
    category: 'CUIAS',
    image: '/assets/products/cuia_banheira_silly_tray_verde.png',
    stock: 11,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Verde Oliva', 'Preto', 'Vermelho', 'Cinza', 'Azul Marinho'] }
    ]
  },
  {
    id: 'prod-cuia-banheira-silly-tray-p',
    code: 'CUA-003',
    name: '1 Und Cuia Banheira Silicone SILLY TRAY - Tamanho P',
    description: 'Cuia formato banheira tamanho compacto Silly Tray.',
    price: 22.00,
    promoPrice: 18.00,
    category: 'CUIAS',
    image: '/assets/products/cuia_banheira_silly_tray_azul.png',
    stock: 15,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Azul Bebê', 'Rosa', 'Amarelo', 'Preto'] }
    ]
  },
  {
    id: 'prod-cuia-chaveiro-holder-m',
    code: 'CUA-004',
    name: '1 Und Cuia Chaveiro HOLDER M',
    description: 'Cuia de silicone com argola de chaveiro para transporte acoplado.',
    price: 15.00,
    promoPrice: 11.99,
    category: 'CUIAS',
    image: '/assets/products/cuia_chaveiro_holder_m.png',
    stock: 18,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Vermelho', 'Preto', 'Azul', 'Verde', 'Laranja', 'Roxo'] }
    ]
  },
  {
    id: 'prod-cuia-silicone-abduzido-g',
    code: 'CUA-005',
    name: '1 Und Cuia de Silicone ABDUZIDO G',
    description: 'Cuia redonda de silicone flexível Abduzido tamanho G.',
    price: 16.00,
    promoPrice: 11.99,
    category: 'CUIAS',
    image: '/assets/products/cuia_silicone_abduzido_g.png',
    stock: 20,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Azul Claro', 'Preto', 'Verde', 'Amarelo', 'Branco', 'Roxo'] }
    ]
  },
  {
    id: 'prod-cuia-silicone-hippster-g',
    code: 'CUA-006',
    name: '1 Und Cuia de Silicone HIPPSTER CLUB G',
    description: 'Cuia de silicone Hippster Club grande com logo gravado.',
    price: 18.00,
    promoPrice: 13.99,
    category: 'CUIAS',
    stock: 25,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Laranja', 'Amarelo', 'Roxo', 'Cinza'] }
    ]
  },

  // 9. ISQUEIROS / MAÇARICOS
  {
    id: 'prod-isqueiro-cliper-recarregavel',
    code: 'ISQ-001',
    name: '1 Und Isqueiro CLIPER Recarregável',
    description: 'O clássico isqueiro redondo Clipper recarregável com pilão embutido.',
    price: 12.00,
    promoPrice: 9.99,
    category: 'ISQUEIROS_MACARICOS',
    image: '/assets/products/isqueiro_cliper_recarregavel.png',
    stock: 30,
    isActive: true,
    featured: true,
    variations: [
      { name: 'Cor', options: ['Azul Bebê', 'Preto', 'Branco', 'Vermelho', 'Amarelo'] }
    ]
  },
  {
    id: 'prod-isqueiro-zippo-recarregavel',
    code: 'ISQ-002',
    name: '1 Und Zippo Recarregável',
    description: 'Isqueiro metálico estilo Zippo gravado à prova de vento e recarregável.',
    price: 12.50,
    promoPrice: 8.99,
    category: 'ISQUEIROS_MACARICOS',
    image: '/assets/products/isqueiro_zippo_recarregavel.png',
    stock: 10,
    isActive: true
  },
  {
    id: 'prod-isqueiro-bic-g',
    code: 'ISQ-003',
    name: 'Bic G',
    description: 'Isqueiro tradicional descartável BIC tamanho grande maxi.',
    price: 8.50,
    category: 'ISQUEIROS_MACARICOS',
    image: '/assets/products/isqueiro_bic_g.png',
    stock: 40,
    isActive: true
  },
  {
    id: 'prod-isqueiro-max1-g',
    code: 'ISQ-004',
    name: 'Isqueiro MAX1 G',
    description: 'Isqueiro grande modelo MAX1 de acendimento suave.',
    price: 8.00,
    promoPrice: 6.99,
    category: 'ISQUEIROS_MACARICOS',
    stock: 25,
    isActive: true
  },
  {
    id: 'prod-isqueiro-coqueiro',
    code: 'ISQ-005',
    name: 'ISQUEIRO COQUEIRO',
    description: 'Isqueiro simples e econômico modelo Coqueiro.',
    price: 3.00,
    category: 'ISQUEIROS_MACARICOS',
    stock: 50,
    isActive: true
  },
  {
    id: 'prod-macarico-pistola-spinner',
    code: 'ISQ-006',
    name: 'Maçarico Pistola/fidgetspinner',
    description: 'Maçarico tipo pistola recarregável com chama turbo e mecanismo giratório fidget spinner.',
    price: 70.00,
    promoPrice: 64.99,
    category: 'ISQUEIROS_MACARICOS',
    stock: 6,
    isActive: true
  },

  // 10. TESOURAS
  {
    id: 'prod-tesoura-metal-garca',
    code: 'TSR-001',
    name: '1 Und Tesoura de Metal Garça',
    description: 'Tesoura clássica de ponta fina e afiação precisa em formato de garça vintage.',
    price: 35.00,
    promoPrice: 24.99,
    category: 'TESOURAS',
    image: '/assets/products/tesoura_metal_garca.png',
    stock: 12,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-tesoura-dobravel-to-na-be',
    code: 'TSR-002',
    name: '1 Und Tesoura Dobrável TO NA BÊ',
    description: 'Tesourinha dobrável portátil Tô na Bê com cabo emborrachado.',
    price: 22.00,
    promoPrice: 18.00,
    category: 'TESOURAS',
    image: '/assets/products/tesoura_dobravel_to_na_be.png',
    stock: 15,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Preto', 'Verde', 'Laranja', 'Rosa'] }
    ]
  },
  {
    id: 'prod-tesoura-abduzido-p',
    code: 'TSR-003',
    name: 'tesoura ABDUZIDO P',
    description: 'Tesoura compacta de corte cirúrgico para fumo linha Abduzido.',
    price: 30.00,
    promoPrice: 24.99,
    category: 'TESOURAS',
    stock: 10,
    isActive: true
  },
  {
    id: 'prod-tesoura-abduzido-g',
    code: 'TSR-004',
    name: 'tesoura ABDUZIDO G',
    description: 'Tesoura de tamanho grande para preparo de fumo Abduzido.',
    price: 50.00,
    promoPrice: 39.99,
    category: 'TESOURAS',
    stock: 8,
    isActive: true
  },
  {
    id: 'prod-tesoura-dobravel-metal',
    code: 'TSR-005',
    name: '1 Und Tesoura Dobrável Metal',
    description: 'Tesoura dobrável em metal resistente com pontas retráteis e anéis dourados.',
    price: 30.00,
    promoPrice: 24.99,
    category: 'TESOURAS',
    image: '/assets/products/tesoura_dobravel_metal.png',
    stock: 14,
    isActive: true
  },

  // 11. CUIAS DE CERÂMICA
  {
    id: 'prod-cuia-ceramica-m',
    code: 'CCR-001',
    name: 'Cuia de ceramica M',
    description: 'Cuia de preparo moldada em cerâmica esmaltada artesanal tamanho médio.',
    price: 80.00,
    promoPrice: 69.99,
    category: 'CUIAS_CERAMICA',
    stock: 4,
    isActive: true
  },
  {
    id: 'prod-cuia-ceramica-p',
    code: 'CCR-002',
    name: 'Cuia de cerâmica P',
    description: 'Cuia de cerâmica artesanal tamanho pequeno para preparo fino.',
    price: 60.00,
    promoPrice: 49.99,
    category: 'CUIAS_CERAMICA',
    stock: 4,
    isActive: true
  },

  // 12. HEADSHOP
  {
    id: 'prod-mini-lata-lion-circus',
    code: 'HDS-001',
    name: '1 Und Mini Lata LION ROLLING CIRCUS',
    description: 'Mini latinha porta-objetos metálica com ilustrações dos personagens Lion Rolling Circus.',
    price: 18.00,
    promoPrice: 14.99,
    category: 'HEADSHOP',
    image: '/assets/products/mini_lata_lion_rolling_circus.png',
    stock: 15,
    isActive: true,
    variations: [
      { name: 'Arte', options: ['Billie/Edgar', 'Ruby', 'Silver', 'Sexy Sadie'] }
    ]
  },
  {
    id: 'prod-porta-beck-metal-bem-bolado',
    code: 'HDS-002',
    name: '1 Und Porta Beck Metal BEM BOLADO G',
    description: 'Mocó metálico hermético antiodor Bem Bolado tamanho G para proteger seu fumo.',
    price: 25.00,
    promoPrice: 21.99,
    category: 'HEADSHOP',
    image: '/assets/products/porta_beck_metal_bem_bolado.png',
    stock: 20,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Verde Metálico', 'Preto Fosco', 'Vermelho', 'Dourado', 'Azul', 'Prata'] }
    ]
  },
  {
    id: 'prod-porta-beck-plastico-p',
    code: 'HDS-003',
    name: '1 Und Porta Beck Plástico P',
    description: 'Tubo porta-beck hermético tamanho P resistente à água e odores.',
    price: 10.00,
    promoPrice: 7.99,
    category: 'HEADSHOP',
    image: '/assets/products/porta_beck_plastico_p.png',
    stock: 35,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Preto', 'Branco', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa'] }
    ]
  },
  {
    id: 'prod-nectar-collector',
    code: 'HDS-004',
    name: 'Néctar collector',
    description: 'Aparelho Nectar Collector portátil em silicone com ponta de titânio para óleos e concentrados.',
    price: 75.00,
    promoPrice: 59.99,
    category: 'HEADSHOP',
    image: '/assets/products/nectar_collector.png',
    stock: 7,
    isActive: true
  },
  {
    id: 'prod-porta-isqueiro-anti-rato',
    code: 'HDS-005',
    name: 'Porta isqueiro anti rato',
    description: 'Cordinha retrátil de segurança porta-isqueiro para prender na roupa e nunca mais perder seu isqueiro.',
    price: 30.00,
    promoPrice: 24.99,
    category: 'HEADSHOP',
    image: '/assets/products/porta_isqueiro_anti_rato.png',
    stock: 25,
    isActive: true
  },
  {
    id: 'prod-cremador-hash-collector',
    code: 'HDS-006',
    name: 'Cremador HASH colector',
    description: 'Acessório cremadouro especial Hash Collector.',
    price: 65.00,
    promoPrice: 54.99,
    category: 'HEADSHOP',
    stock: 8,
    isActive: true
  },

  // 13. CASES
  {
    id: 'prod-case-meninas-super-poderosas',
    code: 'CAS-001',
    name: '1 Und Case Meninas Super Poderosas',
    description: 'Estojo case rígido anti-impacto com estampa das Meninas Super Poderosas.',
    price: 50.00,
    promoPrice: 34.99,
    category: 'CASES',
    image: '/assets/products/case_meninas_super_poderosas.png',
    stock: 8,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-case-to-na-be-verde',
    code: 'CAS-002',
    name: '1 Und Case TO NA BÊ (Verde)',
    description: 'Estojo reforçado anti-impacto Tô na Bê com zíper e divisórias internas.',
    price: 50.00,
    category: 'CASES',
    image: '/assets/products/case_to_na_be_verde.png',
    stock: 10,
    isActive: true
  },
  {
    id: 'prod-case-to-na-be-rosa',
    code: 'CAS-003',
    name: '1 Und Case TO NA BÊ (Rosa)',
    description: 'Estojo rígido Tô na Bê rosa com ilustração psicodélica.',
    price: 50.00,
    category: 'CASES',
    image: '/assets/products/case_to_na_be_rosa.png',
    stock: 10,
    isActive: true
  },
  {
    id: 'prod-case-lata-cigarro',
    code: 'CAS-004',
    name: 'Case em lata disfarçada de cigarro',
    description: 'Case de metal camuflado formato maço de cigarro para discrição total.',
    price: 25.00,
    promoPrice: 19.99,
    category: 'CASES',
    image: '/assets/products/case_lata_cigarro.png',
    stock: 12,
    isActive: true
  },
  {
    id: 'prod-case-hello-kitty',
    code: 'CAS-005',
    name: 'Case Hello Kitty',
    description: 'Case protetor temático Hello Kitty emborrachado com fecho duplo.',
    price: 50.00,
    category: 'CASES',
    stock: 6,
    isActive: true
  },

  // 14. BANDEJAS
  {
    id: 'prod-bandeja-bros',
    code: 'BDJ-001',
    name: '1 Und Bandeja BROS',
    description: 'Bandeja metálica com bordas arredondadas Bros.',
    price: 25.00,
    promoPrice: 16.99,
    category: 'BANDEJAS',
    stock: 12,
    isActive: true
  },
  {
    id: 'prod-bandeja-mandala-sadhu',
    code: 'BDJ-002',
    name: '1 Und Bandeja MANDALA SADHU',
    description: 'Bandeja de metal com estampa artística Mandala Sadhu.',
    price: 33.00,
    promoPrice: 23.99,
    category: 'BANDEJAS',
    stock: 10,
    isActive: true
  },
  {
    id: 'prod-mini-bandeja-hello-kitty',
    code: 'BDJ-003',
    name: '1 Und mini Bandeja Hello Kitty',
    description: 'Mini bandeja de apoio em metal estampada Hello Kitty.',
    price: 20.00,
    promoPrice: 14.99,
    category: 'BANDEJAS',
    image: '/assets/products/mini_bandeja_hello_kitty.png',
    stock: 14,
    isActive: true
  },
  {
    id: 'prod-bandeja-honeypuff-vidro',
    code: 'BDJ-004',
    name: 'Bandeja HONEYPUFF vidro resistente',
    description: 'Bandeja de enrolar em vidro temperado de alta resistência Honeypuff.',
    price: 65.00,
    promoPrice: 39.99,
    category: 'BANDEJAS',
    image: '/assets/products/bandeja_honeypuff_vidro.png',
    stock: 5,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-bandeja-lion-circus-vidro',
    code: 'BDJ-005',
    name: 'Bandeja LION CIRCUS vidro resistente',
    description: 'Bandeja premium de vidro reforçado Lion Rolling Circus ilustrada.',
    price: 70.00,
    promoPrice: 39.99,
    category: 'BANDEJAS',
    image: '/assets/products/bandeja_lion_circus_vidro.png',
    stock: 6,
    isActive: true
  },

  // 15. BONGS / PIPES
  {
    id: 'prod-bong-acrilico',
    code: 'BNG-001',
    name: '1 Und Bong Acrílico',
    description: 'Bong de acrílico leve e resistente para filtragem na água.',
    price: 47.50,
    promoPrice: 34.99,
    category: 'BONGS_PIPES',
    image: '/assets/products/bong_acrilico.png',
    stock: 8,
    isActive: true
  },
  {
    id: 'prod-bong-silicone-pickle-rick',
    code: 'BNG-002',
    name: '1 Und Bong de Silicone PICKLE RICK',
    description: 'Bong dobrável e lavável em silicone temático Pickle Rick com fornilho de vidro.',
    price: 30.00,
    promoPrice: 22.99,
    category: 'BONGS_PIPES',
    image: '/assets/products/bong_silicone_pickle_rick.png',
    stock: 10,
    isActive: true,
    variations: [
      { name: 'Modelo', options: ['Verde Tradicional', 'Azul Tie-Dye', 'Verde Neon'] }
    ]
  },
  {
    id: 'prod-bong-acrilico-squadafum',
    code: 'BNG-003',
    name: 'BONG de acrílico SQUADAFUM',
    description: 'Bong em acrílico reforçado Squadafum com bowl metálico.',
    price: 70.00,
    promoPrice: 54.99,
    category: 'BONGS_PIPES',
    image: '/assets/products/bong_acrilico_squadafum.png',
    stock: 6,
    isActive: true
  },
  {
    id: 'prod-bong-vidro',
    code: 'BNG-004',
    name: 'BONG de vidro',
    description: 'Bong clássico em vidro borossilicato com base beaker para máxima pureza.',
    price: 75.00,
    promoPrice: 59.99,
    category: 'BONGS_PIPES',
    image: '/assets/products/bong_de_vidro.png',
    stock: 7,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-pipe-vidro-ultra420',
    code: 'BNG-005',
    name: 'Pipe de vidro ULTRA420',
    description: 'Pipe artesanal de vidro borossilicato Ultra420 de fácil higienização.',
    price: 100.00,
    promoPrice: 64.99,
    category: 'BONGS_PIPES',
    stock: 5,
    isActive: true
  },

  // 16. TABACO ORGÂNICO / KUMBAYA
  {
    id: 'prod-tabaco-amsterdam-25g',
    code: 'TAB-001',
    name: '1 Und Tabaco AMSTERDAM - 25g',
    description: 'Tabaco Virgínia suave orgânico Amsterdam, picado finamente, embalagem 25g.',
    price: 22.00,
    promoPrice: 20.99,
    category: 'TABACO_KUMBAYA',
    image: '/assets/products/tabaco_amsterdam_25g.png',
    stock: 25,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-tabaco-tanamao-25g',
    code: 'TAB-002',
    name: '1 Und Tabaco TANAMÃO c adesivo - 25g',
    description: 'Tabaco desfiado Tá Na Mão com zip lock e adesivo personalizado 25g.',
    price: 22.00,
    promoPrice: 20.99,
    category: 'TABACO_KUMBAYA',
    image: '/assets/products/tabaco_tanamao_25g.png',
    stock: 20,
    isActive: true
  },
  {
    id: 'prod-kumbaya-com-tabaco-sasso',
    code: 'TAB-003',
    name: 'Kumbaya com Tabaco SASSO - 25g',
    description: 'Blend aromático de ervas selecionadas combinadas com tabaco nobre Sasso 25g.',
    price: 20.00,
    category: 'TABACO_KUMBAYA',
    image: '/assets/products/kumbaya_com_tabaco_sasso.png',
    stock: 18,
    isActive: true
  },
  {
    id: 'prod-kumbaya-sasso-25g',
    code: 'TAB-004',
    name: 'Kumbaya SASSO - 25g',
    description: 'Mistura 100% de flores e ervas naturais kumbaya sem nicotina Sasso 25g.',
    price: 20.00,
    category: 'TABACO_KUMBAYA',
    image: '/assets/products/kumbaya_sasso.png',
    stock: 18,
    isActive: true
  },
  {
    id: 'prod-tabaco-chapada-25g',
    code: 'TAB-005',
    name: 'Tabaco da chapada 25g',
    description: 'Tabaco artesanal original da Chapada Diamantina Bahia 25g.',
    price: 20.00,
    promoPrice: 18.99,
    category: 'TABACO_KUMBAYA',
    image: '/assets/products/tabaco_da_chapada_25g.png',
    stock: 22,
    isActive: true
  },
  {
    id: 'prod-tabaco-sasso-gold-25g',
    code: 'TAB-006',
    name: '1 Und Tabaco SASSO gold - 25g',
    description: 'Tabaco premium Sasso linha Gold Virgínia Gold pacote dourado 25g.',
    price: 25.00,
    category: 'TABACO_KUMBAYA',
    image: '/assets/products/tabaco_sasso_gold_25g.png',
    stock: 20,
    isActive: true,
    featured: true
  },

  // 17. BOLADORES
  {
    id: 'prod-bolador-himalaya-spliff-g',
    code: 'BLD-001',
    name: '1 Und Bolador HIMALAYA SPLIFF G',
    description: 'Máquina boladora automática em acrílico tamanho King Size Himalaya.',
    price: 22.50,
    promoPrice: 11.99,
    category: 'BOLADORES',
    image: '/assets/products/bolador_himalaya_spliff_g.png',
    stock: 15,
    isActive: true
  },
  {
    id: 'prod-bolador-lion-circus-p',
    code: 'BLD-002',
    name: '1 Und Bolador LION ROLLING CIRCUS P',
    description: 'Bolador manual Lion Rolling Circus tamanho pequeno 78mm.',
    price: 18.00,
    promoPrice: 13.99,
    category: 'BOLADORES',
    image: '/assets/products/bolador_lion_circus_p.png',
    stock: 14,
    isActive: true,
    variations: [
      { name: 'Personagem', options: ['Edgar', 'Ruby', 'Silver', 'Trampoline', 'Sadie'] }
    ]
  },
  {
    id: 'prod-bolador-sadhu-g',
    code: 'BLD-003',
    name: '1 Und Bolador SADHU G',
    description: 'Bolador tradicional 110mm Sadhu King Size para enrolar perfeitamente.',
    price: 22.00,
    promoPrice: 11.99,
    category: 'BOLADORES',
    image: '/assets/products/bolador_sadhu_g.png',
    stock: 16,
    isActive: true
  },
  {
    id: 'prod-bolador-hi-tobacco-mini',
    code: 'BLD-004',
    name: 'Bolador HI TOBACCO mini size',
    description: 'Bolador resistente Hi Tobacco tamanho mini 70mm.',
    price: 18.00,
    promoPrice: 14.99,
    category: 'BOLADORES',
    image: '/assets/products/bolador_hi_tobacco_mini.png',
    stock: 12,
    isActive: true
  },
  {
    id: 'prod-bolador-lion-circus-ks',
    code: 'BLD-005',
    name: 'Bolador LION CIRCUS King size',
    description: 'Bolador 110mm King Size Lion Rolling Circus estampas variadas.',
    price: 20.00,
    promoPrice: 13.99,
    category: 'BOLADORES',
    stock: 15,
    isActive: true,
    variations: [
      { name: 'Personagem', options: ['Edgar (Verde)', 'Ruby (Rosa)', 'Silver (Prata)', 'Trampoline (Amarelo)', 'Sadie (Azul)'] }
    ]
  },
  {
    id: 'prod-bolador-smoking-ks',
    code: 'BLD-006',
    name: 'Bolador SMOKING King size',
    description: 'O renomado bolador metálico Smoking King Size 110mm com lona reforçada.',
    price: 30.00,
    promoPrice: 19.99,
    category: 'BOLADORES',
    stock: 10,
    isActive: true
  },

  // 18. CINZEIROS
  {
    id: 'prod-cinzeiro-carro',
    code: 'CNZ-001',
    name: '1 Und Cinzeiro Carro',
    description: 'Cinzeiro copo automotivo antiodor e corta-chamas para porta-copos.',
    price: 15.00,
    promoPrice: 11.99,
    category: 'CINZEIROS',
    image: '/assets/products/cinzeiro_carro.png',
    stock: 20,
    isActive: true,
    variations: [
      { name: 'Cor', options: ['Verde Neon', 'Preto', 'Azul', 'Vermelho'] }
    ]
  },
  {
    id: 'prod-cinzeiro-vidro-rick-morty',
    code: 'CNZ-002',
    name: '1 Und Cinzeiro de Vidro RICK & MORTY',
    description: 'Cinzeiro pesado de vidro maciço com estampa Rick and Morty.',
    price: 35.00,
    promoPrice: 24.99,
    category: 'CINZEIROS',
    image: '/assets/products/cinzeiro_vidro_rick_morty.png',
    stock: 8,
    isActive: true,
    variations: [
      { name: 'Modelo', options: ['Festa Espacial', 'Portal Verde'] }
    ]
  },
  {
    id: 'prod-cinzeiro-vidro-to-na-be',
    code: 'CNZ-003',
    name: '1 Und Cinzeiro de Vidro TO NA BÊ',
    description: 'Cinzeiro redondo em vidro espesso Tô na Bê com 4 descansos de cigarro.',
    price: 35.00,
    promoPrice: 24.99,
    category: 'CINZEIROS',
    image: '/assets/products/cinzeiro_vidro_to_na_be.png',
    stock: 12,
    isActive: true,
    variations: [
      { name: 'Arte', options: ['Hype Azul', 'Psicodélico', 'Caveira', 'Alien', 'Olho Místico', 'Grafite'] }
    ]
  },
  {
    id: 'prod-cinzeiro-metal-giratorio-g',
    code: 'CNZ-004',
    name: '1 Und Cinzeiro Metal giratório - Tamanho G',
    description: 'Cinzeiro fechado giratório com botão de pressão rotativo tamanho G, bloqueia cinzas e odores.',
    price: 40.00,
    promoPrice: 29.99,
    category: 'CINZEIROS',
    image: '/assets/products/cinzeiro_metal_giratorio_g.png',
    stock: 7,
    isActive: true
  },
  {
    id: 'prod-cinzeiro-metal-giratorio-p',
    code: 'CNZ-005',
    name: '1 Und Cinzeiro Metal giratório - Tamanho P',
    description: 'Cinzeiro giratório de metal fechado tamanho P antiodor.',
    price: 35.00,
    promoPrice: 26.99,
    category: 'CINZEIROS',
    image: '/assets/products/cinzeiro_metal_giratorio_p.png',
    stock: 9,
    isActive: true
  },
  {
    id: 'prod-cinzeiro-prato',
    code: 'CNZ-006',
    name: '1 Und Cinzeiro Prato',
    description: 'Cinzeiro clássico formato prato de fácil limpeza.',
    price: 15.00,
    promoPrice: 11.99,
    category: 'CINZEIROS',
    image: '/assets/products/cinzeiro_prato.png',
    stock: 15,
    isActive: true
  },

  // 19. SHOULDER BAG
  {
    id: 'prod-shoulder-bag-puff',
    code: 'SHB-001',
    name: 'shoulder bag PUFF com bolso escondido',
    description: 'Bolsa transversal Shoulder Bag Puff Life original em lona impermeável com compartimento secreto antifurto.',
    price: 125.00,
    promoPrice: 109.99,
    category: 'SHOULDER_BAG',
    image: '/assets/products/shoulder_bag_puff.png',
    stock: 5,
    isActive: true,
    featured: true
  },
  {
    id: 'prod-shoulder-bag-tonabe',
    code: 'SHB-002',
    name: 'Shoulder Bag TONABÊ',
    description: 'Shoulder bag estilosa Tô na Bê com alça regulável e bolsos organizadores.',
    price: 100.00,
    promoPrice: 79.99,
    category: 'SHOULDER_BAG',
    stock: 6,
    isActive: true
  }
];
