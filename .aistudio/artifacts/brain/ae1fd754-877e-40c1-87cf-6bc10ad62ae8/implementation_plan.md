# Integração Firebase Firestore para Persistência e Sincronização em Nuvem (TabasGestion)

Plano de arquitetura e implementação para provisionar e conectar o Google Cloud Firestore ao aplicativo, garantindo que todas as alterações feitas no catálogo, preços, estoque, pedidos recebidos e painel administrativo fiquem salvas permanentemente e sincronizadas em tempo real na web.

> [!IMPORTANT]
> **Decisões Confirmadas pelo Usuário:**
> - **Banco de Dados Selecionado:** Firebase Firestore nativo integrado diretamente na plataforma.
> - **Escopo de Sincronização:** Total — produtos, categorias, configurações da loja, pedidos de clientes e senha de acesso do admin.
> - **Aprovação de Termos do Firebase:** Na etapa de execução, o assistente acionará o modal oficial do Firebase para confirmação única da criação do banco.

---

## 1. Visão Geral e Conceito

- **Problema Atual:** O sistema estava operando em modo de armazenamento local em arquivo temporário (`db.json` e `localStorage`), o que impedia que alterações feitas na área administrativa ficassem salvas na nuvem ou fossem visíveis por clientes em outros navegadores e celulares.
- **Solução:** Integrar o Google Cloud Firestore via SDK oficial (`@google-cloud/firestore` e Firebase Client/Server), permitindo leitura e gravação em nuvem com alta disponibilidade, latência mínima e sincronização em tempo real.
- **Público e Casos de Uso:**
  - **Clientes:** Acessam o catálogo web atualizado em tempo real, visualizam produtos com preços e disponibilidade corretos e enviam pedidos.
  - **Lojista/Administrador:** Gerencia produtos, altera preços, cria categorias, acompanha pedidos em tempo real e customiza configurações da loja a partir de qualquer dispositivo conectado à internet.

---

## 2. Experiência do Usuário e Design Visual

- **Fluxo do Administrador:**
  1. Acessa a Área Restrita digitando a senha (armazenada e validada com o banco em nuvem).
  2. Ao editar um produto, criar categoria ou alterar o WhatsApp/PIX da loja, um indicador sutil e elegante mostra "Sincronizado na Nuvem (Firestore)" com status verde ativo.
  3. Ao receber um novo pedido de cliente, a lista de pedidos é atualizada instantaneamente sem necessidade de recarregar a página manualmente.
- **Fluxo do Cliente:**
  1. Abre o catálogo no celular ou computador e sempre recebe a versão mais recente do estoque e promoções.
  2. Adiciona itens ao carrinho e finaliza via WhatsApp, gerando o pedido salvo com ID único no Firestore.
- **Direção Visual:**
  - Manter a estética premium de tabacaria/lounge: tons escuros neutros (`neutral-950`, `neutral-900`), acentos em âmbar e dourado refinado (`amber-500`, `amber-600`), tipografia nítida e sem excessos de pills estáticos.

---

## 3. Decisões de Produto e Arquitetura

- **Decisão 1: Arquitetura de Sincronização Híbrida (Server-side + Fallback Seguro)**
  - *Abordagem:* O backend Express (`server.ts` e `database-adapter.ts`) atua como camada de persistência robusta alimentando os endpoints REST já consumidos pelo frontend (`/api/db`, `/api/db/products`, etc.) com conexão direta ao Firestore. Adicionalmente, quando o Firestore estiver ativo, os dados são lidos diretamente da nuvem, eliminando a dependência do disco temporário local.
  - *Vantagem:* Compatibilidade total com as telas e formulários existentes, zero risco de quebra de componentes e facilidade de deploy tanto no ambiente AI Studio quanto na Vercel/Cloud Run.
- **Decisão 2: Modelo de Dados no Firestore**
  - Coleção principal `tabas_store` com o documento `main_store` contendo os dados mestre:
    - `products`: Lista de produtos com IDs, títulos, preços, descrições, imagens e status ativo.
    - `categories`: Lista ordenada de categorias.
    - `settings`: Configurações da loja (WhatsApp, chave Pix, taxa de entrega, horário de atendimento).
    - `passcode`: Senha numérica do painel do lojista.
    - `orders`: Histórico dos pedidos realizados.
  - Sub-coleções para histórico detalhado de pedidos (`tabas_orders`) para escalabilidade futura caso o volume cresça.

---

## 4. Arquitetura Técnica e Fluxo de Dados

```
┌───────────────────────────────────────────────────────────────┐
│                    Navegadores Clientes & Admin                │
│   (CatalogView · Modal de Pedidos · AdminDashboard · Gate)     │
└───────────────────────────────┬───────────────────────────────┘
                                │ Fetch / REST API
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                       Express API Server                      │
│   GET  /api/db                POST /api/db/products           │
│   POST /api/db/categories     POST /api/db/settings           │
│   POST /api/db/orders/add     GET  /api/db/sync-status        │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│              database-adapter.ts (Provedor Firestore)         │
│  - Inicialização com credenciais seguras de serviço           │
│  - Cache inteligente em memória para resposta ultra-rápida    │
│  - Fallback automático caso esteja offline                    │
└───────────────────────────────┬───────────────────────────────┘
                                │ Google Cloud SDK
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                 Google Cloud Firestore (Nuvem)                │
│           Coleção: tabas_store / Documento: main_store        │
│           Coleção: orders (Pedidos em tempo real)             │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. Roteiro de Execução (Após Aprovação)

1. **Provisionamento do Firebase:**
   - Acionar `show_aistudio_ui` para confirmação dos termos pelo usuário.
   - Executar `ProvisionFirebase` via RPC para criar a instância Firestore dedicada do projeto.
2. **Configuração de Regras e Blueprint:**
   - Gerar `firebase-blueprint.json` e aplicar regras de segurança com `firestore.rules`.
3. **Conexão no Adaptador de Banco de Dados:**
   - Atualizar `database-adapter.ts` e `server.ts` para carregar a configuração automática do `firebase-applet-config.json`.
   - Garantir migração suave: se o Firestore estiver vazio no primeiro boot, semear automaticamente os dados iniciais do catálogo para nunca deixar a loja vazia.
4. **Verificação e Testes:**
   - Testar gravação de produtos e alteração de preços na Área Restrita.
   - Testar envio de pedidos a partir do carrinho do cliente.
   - Validar compilação (`compile_applet`) e linter (`lint_applet`).
