# Importação dos Produtos e Fotos Oficiais da TabasGestion

Plano para receber os produtos, fotos, categorias e preços reais da TabasGestion enviados pelo usuário, substituindo os dados de exemplo e sincronizando tudo em nuvem.

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisões confirmadas pelo usuário no alinhamento:
> - **Método de Envio**: O usuário enviará os prints de tela e fotos dos produtos do seu catálogo Kyte diretamente aqui na conversa.
> - **Estrutura de Produtos**: Substituir os itens mockados de exemplo pelos produtos reais e categorias oficiais da loja.

---

### 1. Overview & Core Concept

- **O que faz**: Atualiza a base de dados do catálogo da TabasGestion com os itens reais que o lojista já comercializa (fotos autênticas, nomes de produtos, variações, preços originais, promoções e categorias correspondentes).
- **Público-alvo**: Clientes da TabasGestion que acessam o catálogo pelo celular ou computador, visualizando fotos reais e preços atualizados com estoque correto.
- **Principal Valor**: Fim das fotos genéricas e dados fictícios; o catálogo reflete 100% o estoque e identidade visual real do negócio.

---

### 2. User Experience & Visual Design

- **Exibição dos Produtos Reais**:
  - Grid de produtos com fotos nítidas dos produtos oficiais extraídas dos prints/fotos do usuário.
  - Exibição limpa de preços em reais (`R$ XX,XX`), preço promocional riscado quando houver oferta, e tags discretas de estoque.
  - Variações reais de produtos (ex.: tamanhos, cores, sabores ou gramaturas) integradas no modal de compra.
- **Categorização Personalizada**:
  - Barra de rolagem horizontal com as categorias reais da TabasGestion (ex.: Tabacos, Sedas, Filtros, Bongs, Isqueiros, Acessórios, etc.), facilitando a navegação rápida no celular.
- **Controle de Estoque e WhatsApp**:
  - Produtos reais com estoque inicial configurado para venda imediata.
  - Mensagem de WhatsApp formatada com o nome e código exato do produto escolhido.

---

### 3. Key Product Decisions & Trade-Offs

- **Substituição Completa dos Dados Mockados**:
  - *Abordagem*: Limpar os produtos e categorias de demonstração e popular com a lista real extraída dos prints.
  - *Por quê*: Evita confusão de clientes comprarem produtos que a loja não comercializa.
- **Armazenamento e Otimização das Imagens**:
  - *Abordagem*: Salvar as imagens dos produtos otimizadas em formato WebP/JPG localmente na pasta pública de assets e vincular aos registros do Firestore.
  - *Por quê*: Garante carregamento instantâneo em 4G/5G sem depender de links externos instáveis.

---

### 4. Technical Architecture & Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                 Prints e Fotos Enviados no Chat             │
│                                │                            │
│                                ▼                            │
│                Extração de Dados e Fotos:                   │
│         - Nome, Categoria, Preço, Foto e Variações          │
│                                │                            │
│                                ▼                            │
│       ┌──────────────────────────────────────────────┐      │
│       │   Banco de Dados Firestore & LocalStorage    │      │
│       │   - Coleção de Produtos Reais                │      │
│       │   - Coleção de Categorias Oficiais           │      │
│       └──────────────────────┬───────────────────────┘      │
│                              │ Sincronização Real-time       │
│                              ▼                              │
│       ┌──────────────────────────────────────────────┐      │
│       │              Catálogo do Cliente             │      │
│       │              & Painel do Gestor              │      │
│       └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

- **Fluxo de Conclusão**:
  1. O usuário envia as fotos/prints dos produtos da Kyte aqui no chat.
  2. O catálogo é atualizado com as imagens tratadas, preços reais e categorias.
  3. Os novos produtos sincronizam automaticamente para todos os celulares e computadores conectados.
