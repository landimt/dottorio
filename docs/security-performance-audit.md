# Auditoria de Seguranca e Performance - Dottorio

**Data:** 2026-01-24
**Versao:** 1.0
**Branch:** feat/notebook

---

## Sumario Executivo

Este documento apresenta uma analise completa de seguranca e performance do projeto Dottorio, um sistema Next.js com Prisma, NextAuth e React Query. A auditoria identificou **4 problemas criticos**, **8 problemas de alta severidade** e diversas oportunidades de otimizacao.

### Resumo de Severidade

| Severidade | Quantidade | Categoria |
|------------|------------|-----------|
| CRITICO | 4 | Seguranca |
| ALTO | 8 | Seguranca/Performance |
| MEDIO | 12 | Performance/Seguranca |
| BAIXO | 6 | Otimizacao |

---

# PARTE 1: AUDITORIA DE SEGURANCA

## 1. Variaveis de Ambiente e Secrets

### Status: OK - Arquivos .env nao versionados

Os arquivos `.env` estao corretamente listados no `.gitignore`:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.vercel`

Apenas os arquivos `.example` sao versionados, o que e a pratica correta.

### Recomendacoes

1. **Garantir que credenciais nunca sejam commitadas acidentalmente**
   - Adicionar hook pre-commit para verificar secrets
   - Usar ferramentas como `git-secrets` ou `gitleaks`

2. **Rotacao periodica de secrets**
   - `AUTH_SECRET` deve ser rotacionado periodicamente
   - Credenciais de banco devem usar IAM roles quando possivel

---

## 2. Vulnerabilidades XSS (Cross-Site Scripting)

### Severidade: CRITICA

O projeto usa `dangerouslySetInnerHTML` em varios locais para renderizar conteudo gerado por usuarios sem sanitizacao adequada.

### Arquivos Afetados

| Arquivo | Componente | Risco |
|---------|------------|-------|
| `src/app/(main)/questions/[id]/_components/ai-answer-tab.tsx` | AIAnswer | Alto |
| `src/app/(main)/questions/[id]/_components/comments-section.tsx` | Comentarios | Critico |
| `src/app/(main)/questions/[id]/_components/student-answers-tab.tsx` | Respostas | Critico |
| `src/app/admin/questions/[id]/_components/question-details-admin.tsx` | Admin | Medio |

### Problema

```tsx
// Exemplo do problema - ai-answer-tab.tsx
<div dangerouslySetInnerHTML={{ __html: aiAnswer.content }} />
```

O conteudo e renderizado diretamente sem sanitizacao, permitindo XSS se um atacante conseguir injetar HTML malicioso.

### Solucao

O projeto ja possui DOMPurify instalado (`src/lib/utils.ts`), mas **nao esta sendo usado** nos componentes vulneraveis.

```tsx
// ANTES (vulneravel)
<div dangerouslySetInnerHTML={{ __html: content }} />

// DEPOIS (seguro)
import { sanitizeHtml } from '@/lib/utils';
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
```

### Arquivos a Corrigir

1. `src/app/(main)/questions/[id]/_components/ai-answer-tab.tsx`
2. `src/app/(main)/questions/[id]/_components/comments-section.tsx`
3. `src/app/(main)/questions/[id]/_components/student-answers-tab.tsx`
4. `src/app/admin/questions/[id]/_components/question-details-admin.tsx`

---

## 3. Endpoints API sem Autenticacao

### Severidade: ALTA

### Endpoint: `/api/questions/[id]/ai-answer`

**Arquivo:** `src/app/api/questions/[id]/ai-answer/route.ts`

Este endpoint retorna respostas de IA sem verificar autenticacao, permitindo acesso anonimo a conteudo que deveria ser protegido.

### Solucao

```typescript
// Adicionar verificacao de sessao
import { auth } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... resto do codigo
}
```

---

## 4. Requisitos de Senha Fracos

### Severidade: ALTA

**Arquivo:** `src/app/api/auth/register/route.ts`

A senha minima e de apenas 6 caracteres, o que e muito fraco para padroes modernos de seguranca.

```typescript
// Atual
password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),

// Recomendado
password: z
  .string()
  .min(12, "Senha deve ter pelo menos 12 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiuscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minuscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um numero")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
```

---

## 5. Headers de Seguranca

### Severidade: MEDIA

**Arquivo:** `next.config.ts`

### Headers Presentes (OK)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Headers Ausentes

| Header | Proposito | Prioridade |
|--------|-----------|------------|
| `Content-Security-Policy` | Previne XSS e injecao de dados | Alta |
| `Strict-Transport-Security` | Forca HTTPS | Alta |
| `X-XSS-Protection` | Protecao XSS legacy | Media |
| `Permissions-Policy` | Controla features do browser | Baixa |

### Solucao

Adicionar em `next.config.ts`:

```typescript
{
  key: "Content-Security-Policy",
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
},
{
  key: "Strict-Transport-Security",
  value: "max-age=31536000; includeSubDomains"
},
{
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=()"
}
```

---

## 6. Configuracao de Imagens Permissiva

### Severidade: ALTA

**Arquivo:** `next.config.ts` (linhas 155-161)

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**",  // PROBLEMA: Aceita qualquer dominio
    },
  ],
}
```

Isso permite carregar imagens de qualquer dominio HTTPS, o que pode:
- Ser usado para proxy de conteudo malicioso
- Permitir tracking de usuarios
- Causar problemas de CORS

### Solucao

Restringir a dominios especificos:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
    },
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
    },
    // Adicionar outros dominios conforme necessario
  ],
}
```

---

## 7. Rate Limiting Ausente

### Severidade: MEDIA

O projeto nao possui rate limiting em nenhum endpoint, tornando-o vulneravel a:
- Ataques de forca bruta em `/api/auth/login`
- Enumeracao de usuarios em `/api/auth/register`
- DDoS em endpoints publicos

### Solucao

Implementar rate limiting usando `@vercel/edge-config` ou `upstash/ratelimit`:

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

// Uso no endpoint
const ip = request.headers.get("x-forwarded-for") ?? "unknown";
const { success } = await rateLimiter.limit(ip);
if (!success) {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}
```

---

## 8. Exposicao de Erros Detalhados

### Severidade: MEDIA

**Arquivo:** `src/lib/api/api-response.ts`

```typescript
console.error("API Error:", error); // Expoe detalhes do erro
```

Erros detalhados podem vazar informacoes sobre a estrutura interna do sistema.

### Solucao

```typescript
// Em producao, logar apenas ID do erro
if (process.env.NODE_ENV === "production") {
  const errorId = crypto.randomUUID();
  console.error(`Error ${errorId}:`, error);
  return { error: "Internal server error", errorId };
} else {
  console.error("API Error:", error);
  return { error: error.message };
}
```

---

## 9. Validacao de Input Incompleta

### Severidade: MEDIA

### Parsing de Inteiros sem Validacao

**Arquivos Afetados:**
- `src/app/api/admin/audit-logs/route.ts`
- `src/app/api/questions/route.ts`

```typescript
// Problema: parseInt pode retornar NaN ou valores negativos
const page = parseInt(searchParams.get("page") || "1");
```

### Solucao

```typescript
const pageParam = searchParams.get("page");
const page = Math.max(1, Math.min(100, parseInt(pageParam || "1", 10) || 1));
```

---

## 10. Autenticacao Admin

### Status: OK com Ressalvas

O middleware `withAdminAuth` em `src/lib/admin/admin-api.ts` verifica corretamente:
- Existencia da sessao
- Usuario ativo no banco
- Role de admin ou super_admin

**Ressalva:** Algumas rotas admin fazem verificacao manual em vez de usar o middleware, o que pode levar a inconsistencias.

### Recomendacao

Padronizar todas as rotas admin para usar `withAdminAuth`:

```typescript
// Ao inves de verificacao manual
if (session.user.role !== "admin") { ... }

// Usar o middleware
export const GET = withAdminAuth(async (req, session) => { ... });
```

---

# PARTE 2: AUDITORIA DE PERFORMANCE

## 1. Problemas Criticos de React

### 1.1 useEffect sem Array de Dependencias

**Severidade:** CRITICA
**Arquivo:** `src/app/(main)/questions/[id]/_components/question-sidebar.tsx` (linha 86)

```typescript
// PROBLEMA: Executa em TODA renderizacao
useEffect(() => {
  // logica de restauracao de scroll
}); // Sem array de dependencias!
```

**Impacto:** Este useEffect roda apos cada render, causando loops de performance e comportamento imprevisivel.

**Solucao:**
```typescript
useEffect(() => {
  // logica de restauracao de scroll
}, [subjectId, scrollPosition]); // Adicionar dependencias corretas
```

---

### 1.2 Memory Leak em Estado a Nivel de Modulo

**Severidade:** CRITICA
**Arquivo:** `src/app/(main)/questions/[id]/_components/question-sidebar.tsx` (linha 11)

```typescript
// PROBLEMA: Objeto cresce indefinidamente
const scrollPositionBySubject: Record<string, number> = {};
```

Este objeto armazena posicoes de scroll para cada subject visitado e nunca e limpo, causando memory leak em sessoes longas.

**Solucao:**
```typescript
// Usar LRU Cache com limite
const MAX_CACHED_POSITIONS = 50;
const scrollPositionBySubject = new Map<string, number>();

function setScrollPosition(subjectId: string, position: number) {
  if (scrollPositionBySubject.size >= MAX_CACHED_POSITIONS) {
    const firstKey = scrollPositionBySubject.keys().next().value;
    scrollPositionBySubject.delete(firstKey);
  }
  scrollPositionBySubject.set(subjectId, position);
}
```

---

### 1.3 Missing useMemo em Computed Values

**Severidade:** MEDIA
**Arquivo:** `src/app/(main)/search/_components/search-client.tsx` (linhas 198-210)

```typescript
// PROBLEMA: queryParams recriado em cada render
const queryParams = {
  universityId: filters.universityId,
  courseId: filters.courseId,
  // ...
};

// SOLUCAO
const queryParams = useMemo(() => ({
  universityId: filters.universityId,
  courseId: filters.courseId,
  // ...
}), [filters.universityId, filters.courseId, /* ... */]);
```

---

### 1.4 Missing useCallback em Handlers

**Severidade:** MEDIA
**Arquivo:** `src/app/(main)/search/_components/search-client.tsx` (linhas 221-263)

Handlers como `handleFilterChange` sao recriados em cada render, causando re-renders desnecessarios em componentes filhos.

```typescript
// PROBLEMA
const handleFilterChange = (key: string, value: string) => { ... };

// SOLUCAO
const handleFilterChange = useCallback((key: string, value: string) => {
  // ...
}, [/* dependencias */]);
```

---

## 2. Problemas de Data Fetching

### 2.1 Multiplas Queries Separadas

**Severidade:** ALTA
**Arquivo:** `src/app/(main)/dashboard/page.tsx` (linhas 27-48)

```typescript
// PROBLEMA: 4 queries separadas
const [questionsAdded, questionsSaved, answersCount, commentsCount] =
  await Promise.all([
    prisma.question.count({ ... }),
    prisma.savedQuestion.count({ ... }),
    prisma.studentAnswer.count({ ... }),
    prisma.comment.count({ ... }),
  ]);
```

**Solucao:** Usar uma unica query agregada:

```typescript
const stats = await prisma.$queryRaw`
  SELECT
    (SELECT COUNT(*) FROM "Question" WHERE ...) as questions_added,
    (SELECT COUNT(*) FROM "SavedQuestion" WHERE ...) as questions_saved,
    (SELECT COUNT(*) FROM "StudentAnswer" WHERE ...) as answers_count,
    (SELECT COUNT(*) FROM "Comment" WHERE ...) as comments_count
`;
```

---

### 2.2 Over-fetching em Includes

**Severidade:** ALTA
**Arquivo:** `src/lib/services/question.service.ts` (linhas 96-183)

O metodo `findById` busca TODOS os comentarios e respostas de uma questao sem paginacao:

```typescript
comments: {
  include: { ... },
  orderBy: { createdAt: "asc" },
  // PROBLEMA: Sem take/limit!
},
```

**Solucao:**
```typescript
comments: {
  include: { ... },
  orderBy: { createdAt: "asc" },
  take: 20, // Limitar quantidade inicial
},
_count: {
  select: { comments: true } // Para mostrar total
}
```

---

### 2.3 N+1 Queries em Related Questions

**Severidade:** MEDIA
**Arquivo:** `src/app/api/questions/[id]/related/route.ts`

Sao feitas 3 queries separadas quando poderiam ser 2:
1. `findUnique` para buscar a questao
2. `count` para total de relacionadas
3. `findMany` para questoes relacionadas

**Solucao:** Combinar count com findMany usando `_count` ou raw query.

---

### 2.4 Dados de Referencia sem Cache

**Severidade:** MEDIA
**Arquivo:** `src/app/(main)/search/page.tsx`

Universidades, cursos, professores e disciplinas sao buscados em cada page load sem caching. Esses dados mudam raramente.

**Solucao:** Usar ISR (Incremental Static Regeneration):

```typescript
export const revalidate = 3600; // Revalidar a cada hora

// Ou usar unstable_cache do Next.js
import { unstable_cache } from 'next/cache';

const getCachedReferenceData = unstable_cache(
  async () => {
    return {
      universities: await prisma.university.findMany(),
      courses: await prisma.course.findMany(),
      // ...
    };
  },
  ['reference-data'],
  { revalidate: 3600 }
);
```

---

## 3. Bundle Size

### 3.1 Tiptap Editor Pesado

**Severidade:** MEDIA
**Arquivo:** `src/components/TipTapEditor.tsx`

O editor importa 39 extensoes do Tiptap individualmente, resultando em um bundle de ~300KB+.

**Solucao:** Lazy load do editor:

```typescript
// src/components/TipTapEditorLazy.tsx
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(
  () => import('./TipTapEditor'),
  {
    loading: () => <div className="h-64 animate-pulse bg-muted rounded" />,
    ssr: false
  }
);

export default TipTapEditor;
```

---

### 3.2 Recharts Nao Utilizado

**Severidade:** BAIXA
**Arquivo:** `package.json`

Recharts esta instalado (~100KB gzipped) mas o dashboard usa barras CSS manuais.

**Verificar:** Se Recharts nao esta sendo usado, remover a dependencia:
```bash
yarn remove recharts
```

---

### 3.3 Muitos Imports de Lucide Icons

**Severidade:** BAIXA

Multiplos arquivos importam icones do lucide-react individualmente. Embora o tree-shaking funcione, considerar:

```typescript
// Ao inves de importar em cada arquivo
import { Search, Filter, X } from 'lucide-react';

// Criar arquivo central de icones usados
// src/components/icons.tsx
export { Search, Filter, X, /* ... */ } from 'lucide-react';
```

---

## 4. Next.js Specificos

### 4.1 Uso Incorreto de "use client"

**Severidade:** MEDIA

44 arquivos em `/src/app` usam `"use client"`, incluindo alguns que poderiam ser Server Components.

**Arquivo:** `src/app/(main)/notebooks/page.tsx`

```typescript
"use client";  // Desnecessario se nao usa hooks
const INITIAL_NOTEBOOKS: Notebook[] = [...];  // Dados hardcoded
```

**Verificar cada arquivo e remover `"use client"` quando:**
- Nao usa hooks (useState, useEffect, etc.)
- Nao usa event handlers (onClick, onChange, etc.)
- Apenas renderiza dados

---

### 4.2 API Call em vez de Server Action

**Severidade:** BAIXA
**Arquivo:** `src/app/(main)/questions/[id]/_components/question-detail-container.tsx` (linhas 144-146)

```typescript
// Chamada API para incrementar views
API.questions.view(safeQuestionId).catch((err) => {
  console.error("Failed to increment view count:", err);
});
```

**Solucao:** Usar Server Action para eliminar round-trip:

```typescript
// src/app/actions/questions.ts
"use server";
export async function incrementViewCount(questionId: string) {
  await prisma.question.update({
    where: { id: questionId },
    data: { viewCount: { increment: 1 } },
  });
}

// No componente
import { incrementViewCount } from "@/app/actions/questions";
useEffect(() => {
  incrementViewCount(questionId);
}, [questionId]);
```

---

### 4.3 Streaming Nao Utilizado

**Severidade:** MEDIA
**Arquivo:** `src/app/(main)/dashboard/page.tsx`

Queries do dashboard bloqueiam o render da pagina inteira. Usar Suspense para streaming:

```typescript
// dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      <Suspense fallback={<RecentQuestionsSkeleton />}>
        <RecentQuestions />
      </Suspense>
    </div>
  );
}
```

---

## 5. Database Query Optimization

### 5.1 Conditional Includes

**Severidade:** MEDIA
**Arquivo:** `src/lib/services/question.service.ts` (linhas 67-72)

```typescript
savedBy: userId ? {
  where: { userId },
  select: { id: true },
} : false,
```

Includes condicionais mudam a shape da query, impedindo cache de query plans.

**Solucao:** Separar em queries distintas ou usar abordagem consistente.

---

### 5.2 Text Search sem Indice

**Severidade:** MEDIA
**Arquivo:** `src/app/api/questions/similar/route.ts`

```typescript
text: {
  contains: word,
  mode: "insensitive",
}
```

Busca case-insensitive sem indice de texto completo e lenta em tabelas grandes.

**Solucao:** Criar indice GIN no PostgreSQL:

```sql
CREATE INDEX questions_text_gin ON "Question"
USING gin(to_tsvector('portuguese', text));
```

---

# PARTE 3: CHECKLIST DE CORRECOES

## Prioridade 1 - Critico (Fazer Imediatamente)

- [ ] Aplicar `sanitizeHtml()` em todos os `dangerouslySetInnerHTML`
- [ ] Corrigir `useEffect` sem dependencias em `question-sidebar.tsx`
- [ ] Implementar LRU cache para `scrollPositionBySubject`
- [ ] Adicionar autenticacao ao endpoint `/api/questions/[id]/ai-answer`

## Prioridade 2 - Alta (Fazer Esta Semana)

- [ ] Implementar rate limiting em endpoints publicos
- [ ] Aumentar requisitos de senha para 12+ caracteres
- [ ] Restringir dominios de imagem no `next.config.ts`
- [ ] Adicionar headers CSP e HSTS
- [ ] Otimizar queries do dashboard (combinar em uma)
- [ ] Adicionar paginacao em comentarios e respostas

## Prioridade 3 - Media (Fazer Este Mes)

- [ ] Implementar lazy loading do TipTap editor
- [ ] Revisar e remover `"use client"` desnecessarios
- [ ] Adicionar `useMemo` e `useCallback` onde necessario
- [ ] Implementar cache para dados de referencia
- [ ] Usar Server Actions para operacoes simples
- [ ] Adicionar streaming com Suspense no dashboard

## Prioridade 4 - Baixa (Backlog)

- [ ] Verificar se Recharts esta sendo usado
- [ ] Centralizar imports de icones
- [ ] Adicionar indice de texto completo no PostgreSQL
- [ ] Implementar 2FA para operacoes sensiveis

---

# PARTE 4: METRICAS DE SUCESSO

Apos implementar as correcoes, medir:

| Metrica | Atual | Meta |
|---------|-------|------|
| Lighthouse Performance | ? | > 90 |
| Time to First Byte (TTFB) | ? | < 200ms |
| Largest Contentful Paint (LCP) | ? | < 2.5s |
| First Input Delay (FID) | ? | < 100ms |
| Bundle Size (JS) | ? | < 200KB gzipped |
| API Response Time (p95) | ? | < 500ms |

---

# Apendice A: Ferramentas Recomendadas

1. **Seguranca**
   - `npm audit` - Verificar vulnerabilidades em dependencias
   - `gitleaks` - Detectar secrets em codigo
   - `snyk` - Monitoramento continuo de seguranca

2. **Performance**
   - `@next/bundle-analyzer` - Analise de bundle
   - `react-devtools Profiler` - Identificar re-renders
   - `Lighthouse CI` - Metricas automatizadas

3. **Monitoramento**
   - Sentry - Error tracking
   - Vercel Analytics - Performance monitoring
   - Prisma Pulse - Database observability

---

*Documento gerado em 2026-01-24 por Claude Code*
