/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Globe, Database, Server, ShieldCheck, DollarSign, ExternalLink } from 'lucide-react';

export default function DomainCostsGuide() {
  const costItems = [
    {
      category: 'Domínio (.com.br)',
      provider: 'Registro.br (Oficial do Brasil)',
      estimate: 'R$ 40,00 por ANO',
      detail: 'O domínio é o seu endereço na internet (ex: tabasgestion.com.br). O Registro.br é o órgão oficial que regula isso no Brasil.',
      recommendation: 'Compre diretamente no Registro.br para evitar taxas de intermediários. O processo é simples e leva 10 minutos.'
    },
    {
      category: 'Hospedagem (Frontend)',
      provider: 'Vercel / Netlify / Cloud Run',
      estimate: 'R$ 0,00 (Grátis)',
      detail: 'Onde o site (HTML/CSS/JS) fica armazenado para as pessoas acessarem. Ambas têm planos gratuitos excelentes para pequenos e médios negócios.',
      recommendation: 'A Vercel é a líder de mercado para projetos em React/Vite. Ela oferece SSL automático (o cadeado de segurança https://) e deploys em 1 clique.'
    },
    {
      category: 'Banco de Dados',
      provider: 'Firebase Firestore / Supabase',
      estimate: 'R$ 0,00 até o limite do plano grátis',
      detail: 'Onde ficam armazenados os dados de produtos, categorias, configurações e pedidos. O Firebase (do Google) oferece até 50.000 leituras e 20.000 escritas grátis por DIA.',
      recommendation: 'Para a TabasGestion, o plano gratuito do Firebase Firestore é mais do que suficiente para o fluxo inicial de vendas.'
    },
    {
      category: 'Hospedagem (Servidor Node)',
      provider: 'Render / Render.com / Railway',
      estimate: 'Grátis ou ~R$ 35,00/mês',
      detail: 'Caso você queira rodar um servidor customizado completo para gerenciar APIs complexas sem depender de localStorage.',
      recommendation: 'Se o site for uma SPA (Single Page Application) integrada diretamente com o Firebase, você NÃO precisa de servidor dedicado, economizando esse custo.'
    }
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto shadow-xl">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Guia de Implantação e Custos Reais</h2>
          <p className="text-neutral-400 text-sm">Tudo o que você precisa saber para colocar a TabasGestion no ar para sempre.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-2 text-purple-500 font-semibold mb-2">
            <Globe className="w-5 h-5" />
            <h3>1. Como Funciona o Domínio</h3>
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed mb-3">
            Para ter um endereço personalizado como <span className="font-mono text-neutral-100 font-medium">www.tabasgestion.com.br</span>, você deve se cadastrar no site oficial <strong>Registro.br</strong>.
          </p>
          <a
            href="https://registro.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Acessar Registro.br <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-2 text-purple-500 font-semibold mb-2">
            <Database className="w-5 h-5" />
            <h3>2. Escolha do Banco de Dados</h3>
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed mb-3">
            Nós estruturamos a TabasGestion com os melhores padrões de engenharia. Ela está pronta para ser conectada ao <strong>Firebase Firestore</strong> (Não relacional) ou <strong>PostgreSQL / Supabase</strong> (Relacional).
          </p>
          <p className="text-xs text-neutral-500">
            *O Firebase possui um SDK em tempo real perfeito para receber notificações de novos pedidos no seu painel.
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-purple-500" />
        Tabela Comparativa de Custos Estimados (R$)
      </h3>

      <div className="space-y-4 mb-8">
        {costItems.map((item, i) => (
          <div key={i} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col md:flex-row md:items-start gap-4">
            <div className="md:w-1/3">
              <span className="text-xs uppercase tracking-wider text-purple-500 font-semibold block mb-1">{item.category}</span>
              <span className="text-sm text-neutral-400 block mb-1">{item.provider}</span>
              <span className="text-base font-bold text-white block">{item.estimate}</span>
            </div>
            <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-neutral-800 pt-3 md:pt-0 md:pl-4">
              <p className="text-neutral-300 text-sm mb-2">{item.detail}</p>
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5 text-xs text-purple-400">
                <strong>Recomendação:</strong> {item.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 mt-1">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-1">Segurança e Boas Práticas (Engenharia de Software)</h4>
            <ul className="text-neutral-400 text-xs space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>SSL Grátis:</strong> Toda hospedagem moderna (Vercel, Netlify) inclui certificado SSL (cadeado de segurança) automático.</li>
              <li><strong>Proteção dos Dados do Gestor:</strong> O painel é protegido localmente com PIN criptografado. Em produção, use Firebase Auth (completamente grátis) para gerenciar login com e-mail/senha.</li>
              <li><strong>Anti-Spam de Pedidos:</strong> O sistema de checkout com validação previne mensagens corrompidas ou malformadas de robôs.</li>
              <li><strong>Arquitetura Desconectada:</strong> O catálogo do cliente funciona offline e carrega instantaneamente, garantindo a melhor experiência de compra (Core Web Vitals).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
