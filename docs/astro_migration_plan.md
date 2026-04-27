# Plano de Migração: OctoManager (Next.js/React ➡️ Astro/Svelte)

Este documento detalha a estratégia, os passos técnicos e as equivalências necessárias para migrar o projeto OctoManager de Next.js (App Router) + React para Astro + Svelte, utilizando a abordagem de migração gradual (*Strangler Fig Pattern*).

---

## 🏗 Estratégia Geral: Migração em 2 Fases

A maior premissa desta migração é **minimizar o risco e evitar o congelamento de novas entregas**. O Astro permite rodar React e Svelte simultaneamente através de sua arquitetura de *Islands*.

*   **Fase 1 (Troca de Chassi):** Substituir o Next.js pelo Astro responsável pelo roteamento e build, mas **manter todos os componentes UI em React**.
*   **Fase 2 (Substituição de UI):** Adicionar o suporte a Svelte e, gradualmente, reescrever os componentes React para Svelte, removendo o React completamente no final.

---

## 🛠 Fase 1: Next.js ➡️ Astro (Mantendo o React)

O objetivo desta fase é fazer o projeto rodar no Astro sem reescrever a lógica de interface.

### 1.1. Setup e Dependências
Removeremos dependências exclusivas do Next.js e instalaremos o Astro e suas integrações.

**Remover:**
```bash
npm uninstall next eslint-config-next
```

**Adicionar:**
```bash
npm install astro @astrojs/react @types/react @types/react-dom
```

### 1.2. Arquitetura de Diretórios (Roteamento)
O roteamento do Astro também é baseado em arquivos, mas a estrutura muda ligeiramente do `app/` (Next) para `src/pages/` (Astro).

| Next.js (App Router) | Astro |
| :--- | :--- |
| `app/page.tsx` | `src/pages/index.astro` |
| `app/layout.tsx` | `src/layouts/Layout.astro` |
| `app/repos/[id]/page.tsx` | `src/pages/repos/[id].astro` |
| `app/api/github/route.ts` | `src/pages/api/github.ts` |

### 1.3. Migração de Páginas para `.astro`
Os componentes React visuais serão mantidos, mas os arquivos de roteamento `.tsx` viram `.astro`.

**Exemplo de Página (Astro encapsulando React):**
```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
// O componente React existente é importado normalmente
import { SearchBar } from '../components/repos/search-bar';
import { RepoList } from '../components/repos/repo-list';
---

<Layout title="OctoManager - Início">
  <main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Meus Repositórios</h1>
    
    <!-- client:load garante que o React assumirá o controle no navegador -->
    <SearchBar client:load />
    <RepoList client:load />
  </main>
</Layout>
```

### 1.4. Migração de API Routes
As funções Serverless que comunicam com o GitHub via `octokit` mudam de sintaxe, mas a lógica se mantém.

**Antes (Next.js):**
```typescript
// app/api/repos/route.ts
export async function GET(req: Request) {
  const data = await fetchRepos();
  return Response.json(data);
}
```

**Depois (Astro):**
```typescript
// src/pages/api/repos.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const data = await fetchRepos();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### 1.5. Ajustes Específicos do Next.js
*   **`next/link` (`<Link>`):** Substituir por tags HTML padrão `<a>`. O Astro faz o prefetch automático nativamente.
*   **`next/image` (`<Image>`):** Substituir por `<Image />` importado de `astro:assets`.
*   **`next/navigation` (`useRouter`):** A navegação programática deve usar o padrão web `window.location.href` ou a view transitions API do Astro.

---

## ⚡ Fase 2: Astro + React ➡️ Astro + Svelte

Com o projeto rodando em Astro, a segunda fase foca em introduzir o Svelte e substituir a biblioteca visual.

### 2.1. Instalação do Svelte
```bash
npx astro add svelte
```
Isso atualizará o `astro.config.mjs` para suportar Svelte. A partir deste momento, um componente `.svelte` e um `.tsx` podem conviver na mesma página `.astro`.

### 2.2. Tabela de Conversão de Tecnologias (De-Para)

Para reconstruir a UI em Svelte mantendo a mesma estética e funcionalidade, usaremos o seguinte mapa tecnológico:

| Domínio | Atualmente (React) | Novo Padrão (Svelte) | Observações |
| :--- | :--- | :--- | :--- |
| **Componentes UI (Headless)** | `@radix-ui/react-*` | **Bits UI** / **Melt UI** | Bits UI é o motor por trás do shadcn-svelte. Mesma acessibilidade do Radix. |
| **Estilização** | `tailwindcss` | `tailwindcss` | Mantém-se inalterado. As classes do Radix mudarão ligeiramente para os padrões do Bits UI. |
| **Animações** | `framer-motion` | **Svelte Transitions** | O Svelte tem um motor nativo (ex: `transition:slide`, `transition:fade`) que cobre 95% do uso do Framer, sem peso extra. |
| **Ícones** | `lucide-react` | `lucide-svelte` | Substituição 1:1. |
| **Data Fetching (Client)** | `@tanstack/react-query` | `@tanstack/svelte-query` | A API é virtualmente a mesma, apenas usando as reatividades do Svelte no lugar de hooks. |
| **Estado Global** | `zustand` | **Svelte Runes (`$state`)** | No Svelte 5, estado global não requer libs externas. Uma runa exportada em um `.svelte.ts` funciona como um store global simplificado. |
| **Formulários** | `react-hook-form` | **SvelteKit Superforms** ou **Felte** | Continuam sendo integráveis com Zod. |
| **Autenticação** | `next-auth` | **Auth.js Astro (`auth-astro`)** | É o sucessor oficial do NextAuth, suporta GitHub Providers da mesma forma. |

### 2.3. Estratégia de Reescrever Componentes (Bottom-Up)

A reescrita deve ocorrer de **baixo para cima** na árvore de componentes:
1.  Comece convertendo componentes "burros" (UI Pura): Botões, Inputs, Badges, Tooltips (Substituindo Radix por Bits UI).
2.  Converta os componentes de bloco: Cards de repositório, Barras de busca.
3.  Converta os gerenciadores de estado: Trocar Zustand por Svelte Runes.
4.  Converta componentes complexos: Tabelas ou listas com React Query para Svelte Query.
5.  Quando uma página `.astro` tiver apenas componentes `<SvelteComponent client:load />`, o React foi completamente expurgado daquela tela.

### Exemplo de Conversão de Componente (Barra de Busca)

**React (Antes):**
```tsx
import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  
  return (
    <div className="relative">
      <Search className="absolute left-2" />
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        className="pl-8"
      />
    </div>
  );
}
```

**Svelte 5 (Depois):**
```svelte
<script lang="ts">
  import { Search } from 'lucide-svelte';
  
  let query = $state('');
</script>

<div class="relative">
  <Search class="absolute left-2" />
  <input 
    bind:value={query} 
    class="pl-8"
  />
</div>
```

---

## ✅ Checklist de Finalização

- [ ] Todas as rotas `app/` migradas para `src/pages/`
- [ ] Todas as funções de API rodando nativamente no Astro (`src/pages/api/`)
- [ ] `next-auth` substituído por `auth-astro`
- [ ] `@astrojs/svelte` instalado e funcionando
- [ ] Todos os componentes React (`.tsx`) reescritos em Svelte (`.svelte`)
- [ ] `@astrojs/react`, `react`, e `react-dom` removidos do `package.json`
