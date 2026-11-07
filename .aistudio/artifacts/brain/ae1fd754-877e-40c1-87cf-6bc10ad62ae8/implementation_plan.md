# Ocultação e Proteção Avançada do Painel do Gestor

Plano de segurança para ocultar o acesso administrativo de clientes comuns e reforçar a proteção com PIN numérico configurável e métodos de entrada secretos.

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisões confirmadas pelo usuário na etapa de alinhamento:
> - **Acesso Oculto**: Remover o botão "Painel do Gestor" do cabeçalho visível aos clientes. O acesso será realizado por toque secreto (5 toques no logotipo) e por parâmetro direto na URL (`?admin=true`).
> - **Segurança**: Autenticação por PIN numérico, com gerenciamento e alteração do código diretamente na aba de Configurações do painel administrativo.

---

### 1. Overview & Core Concept

- **O que faz**: Transforma o catálogo em uma vitrine 100% voltada ao consumidor final, sem botões de gestão visíveis que despertem curiosidade ou tentativas de invasão por clientes.
- **Público-alvo**: O lojista/administrador da TabasGestion terá acesso exclusivo e discreto, enquanto os clientes finais visualizam apenas a loja virtual limpa e o atendimento WhatsApp.
- **Principal Valor**: Discrição total da área administrativa e segurança simples e eficaz sem necessidade de login complexo por e-mail a cada visita no celular.

---

### 2. User Experience & Visual Design

- **Experiência do Cliente Comum**:
  - O cabeçalho exibe apenas a identidade da marca, o botão do Grupo VIP, o resumo do carrinho e a busca/categorias.
  - Zero menções a "Painel", "Gestor", "Admin" ou ícones de cadeado na interface pública.
- **Fluxos Secretos de Acesso do Gestor**:
  1. **Toque Secreto no Logotipo**:
     - Clicar/tocar 5 vezes seguidas no logotipo da loja em um intervalo de até 2,5 segundos.
     - Ao completar a sequência, o modal de autenticação por PIN é aberto suavemente com animação de cofre seguro.
  2. **Acesso Direto por URL (`?admin=true` ou `#admin`)**:
     - O lojista pode salvar nos favoritos do celular ou navegador o link `https://seusite.com/?admin=true`. Ao abrir esse link, o modal de PIN aparece imediatamente.
  3. **Acesso Discreto no Rodapé**:
     - Um link minimalista no rodapé (texto discreto sem destaque visual) como rota alternativa de emergência.
- **Modal de Autenticação por PIN**:
  - Visual escuro minimalista (`bg-neutral-900 border-neutral-800`) com 4 a 6 marcadores de dígitos (bolinhas que acendem conforme digitado).
  - Teclado numérico virtual integrado (botões 0-9, apagar e limpar) ideal para uso rápido no celular com uma mão.
  - Alerta de erro com animação de vibração visual caso o PIN esteja incorreto.
  - **Proteção contra Força Bruta**: Após 5 tentativas incorretas consecutivas, o sistema trava novas tentativas por 30 segundos com contagem regressiva em tempo real.
- **Gestão do PIN no Painel**:
  - Nova seção na aba **Configurações**: campo "Alterar PIN de Acesso" com opção de visualizar/ocultar senha e botão de salvar.
  - O PIN é sincronizado e salvo de forma persistente nas configurações da loja.

---

### 3. Key Product Decisions & Trade-Offs

- **Remoção Completa do Topo**:
  - *Abordagem*: Eliminar o botão `id="btn-goto-manager"` da barra superior.
  - *Por quê*: Impede que qualquer cliente descubra ou tente interagir com o painel administrativo.
  - *Alternativa descartada*: Deixar um ícone discreto no topo ainda atrairia cliques de curiosos no celular.
- **Toque Múltiplo no Logo (5 Toques) + URL**:
  - *Abordagem*: Detector de cliques com timestamp que zera automaticamente se o intervalo entre cliques for maior que 600ms.
  - *Por quê*: É um padrão clássico e ergonômico de "Easter Egg" administrativo em aplicativos móveis e totens de autoatendimento, impossível de ser acionado por acidente por um cliente comum.

---

### 4. Technical Architecture & Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                    Catálogo TabasGestion                    │
│                                                             │
│  [Logo (5 toques)] ───► Detector de Sequência              │
│                                │                            │
│  [URL ?admin=true] ───► Leitura de SearchParams             │
│                                │                            │
│                                ▼                            │
│                 ┌─────────────────────────────┐             │
│                 │  Modal de Autenticação PIN  │             │
│                 │  - Teclado numérico virtual │             │
│                 │  - 5 tentativas máx (30s)   │             │
│                 └──────────────┬──────────────┘             │
│                                │ PIN Correto                │
│                                ▼                            │
│                 ┌─────────────────────────────┐             │
│                 │      Painel do Gestor       │             │
│                 │  - Pedidos & Estoque        │             │
│                 │  - Configurações (Novo PIN) │             │
│                 │  - Botão de Sair (Logout)   │             │
│                 └─────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

- **Estado de Sessão Administrativa**:
  - Salva flag temporária na sessão (`sessionStorage.setItem('tabas_admin_auth', 'true')`) para que o lojista não precise digitar o PIN repetidamente enquanto estiver usando o painel na mesma sessão, com botão explícito de "Sair" para encerrar a sessão imediatamente.
- **Sincronização do PIN**:
  - Salvo na entidade `StoreSettings.adminPin` que já sincroniza com o banco em nuvem (Firestore) e armazenamento local.
