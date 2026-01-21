# 🚀 Guia de Deploy - Dottorio

Este guia detalha o processo de deploy do Dottorio para produção usando **Vercel** (hospedagem) e **Supabase** (banco de dados PostgreSQL).

## 📋 Pré-requisitos

- [ ] Conta no [GitHub](https://github.com)
- [ ] Conta na [Vercel](https://vercel.com)
- [ ] Conta no [Supabase](https://supabase.com)
- [ ] Conta na [OpenAI](https://platform.openai.com) (para respostas IA)

---

## 1️⃣ Configurar Banco de Dados no Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Configure:
   - **Name**: `dottorio-prod`
   - **Database Password**: Escolha uma senha forte e **anote em local seguro**
   - **Region**: `South America (São Paulo)` ou região mais próxima
   - **Pricing Plan**: Free (para início) ou Pro (para produção)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o banco ser provisionado

### 1.2 Obter Connection String (Transaction Pooler)

⚠️ **IMPORTANTE**: Para Next.js/Vercel, você **DEVE** usar o Transaction Pooler (porta 6543), não a conexão direta (porta 5432).

1. No painel do projeto, vá em **Settings** → **Database**
2. Role até **Connection String**
3. Selecione a aba **"Transaction"** (não "URI"!)
4. Copie a connection string no formato Transaction Pooler:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
   ```
5. **Substitua `[YOUR-PASSWORD]`** pela senha que você definiu no passo 1.1
6. **Anote esta string** - você vai precisar dela na Vercel

**Exemplo final:**
```
postgresql://postgres.abcdefgh:MinhaSenhaSegura123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Por que Transaction Pooler?**
- Vercel/Next.js são ambientes serverless
- Cada request cria uma nova conexão com o banco
- Transaction Pooler gerencia conexões de forma eficiente
- Porta 5432 (conexão direta) pode esgotar o limite de conexões

### 1.3 Configurar Conexões (Importante!)

No Supabase, vá em **Settings** → **Database** → **Connection Pooling**:
- **Pool Mode**: `Transaction`
- **Default Pool Size**: `15` (Free tier) ou `50+` (Pro)

---

## 2️⃣ Deploy na Vercel

### 2.1 Importar do GitHub

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Autorize a Vercel a acessar seu GitHub (se ainda não fez)
5. Selecione o repositório `dottorio`
6. Clique em **"Import"**

### 2.2 Configurar Projeto

Na tela de configuração:

**Framework Preset**: Next.js (detectado automaticamente)

**Root Directory**: `.` (raiz do projeto)

**Build Command**:
```bash
prisma generate && prisma migrate deploy && next build
```

**Install Command**:
```bash
npm install
```

**Output Directory**: `.next` (padrão Next.js)

### 2.3 Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

#### Database
```bash
DATABASE_URL=postgresql://postgres.xxxxx:[SUA-SENHA]@aws-0-region.pooler.supabase.com:6543/postgres
```
⚠️ **ATENÇÃO**: Use porta **6543** (Transaction Pooler), não 5432!

(Usar a connection string do passo 1.2)

#### NextAuth

**NEXTAUTH_SECRET** - Gerar novo valor:
```bash
openssl rand -base64 32
```
Copie o resultado e adicione como variável.

**NEXTAUTH_URL** - Deixe vazio por enquanto, vamos preencher após o deploy.

#### OpenAI
```bash
OPENAI_API_KEY=sk-proj-...
```
(Obtenha em [platform.openai.com/api-keys](https://platform.openai.com/api-keys))

#### App URL
**NEXT_PUBLIC_APP_URL** - Deixe vazio por enquanto, vamos preencher após o deploy.

### 2.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde ~3-5 minutos
3. ✅ Após conclusão, você verá a URL do projeto (ex: `dottorio-xyz.vercel.app`)

---

## 3️⃣ Atualizar URLs de Produção

### 3.1 Anotar URL do Projeto

Após o deploy, anote a URL do projeto:
```
https://dottorio-xyz.vercel.app
```

### 3.2 Atualizar Variáveis de Ambiente

1. No painel da Vercel, vá em **Settings** → **Environment Variables**
2. Edite/adicione as variáveis que deixamos vazias:

```bash
NEXTAUTH_URL=https://dottorio-xyz.vercel.app
NEXT_PUBLIC_APP_URL=https://dottorio-xyz.vercel.app
```

3. Clique em **"Save"**

### 3.3 Re-deploy

1. Vá em **Deployments**
2. Clique nos **três pontos** do último deploy
3. Selecione **"Redeploy"**
4. Confirme com **"Redeploy"**

Aguarde ~2 minutos e pronto! 🎉

---

## 4️⃣ Executar Migrations do Banco

### 4.1 Via Vercel CLI (Recomendado)

Se você tem a [Vercel CLI](https://vercel.com/docs/cli) instalada:

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Entrar no projeto
vercel link

# Executar migrations
vercel env pull .env.production
npm run db:migrate:deploy
```

### 4.2 Via GitHub Actions (Automático)

As migrations serão executadas automaticamente no build da Vercel através do comando:
```bash
prisma migrate deploy
```

### 4.3 Seed Inicial (Opcional)

Para popular o banco com dados iniciais:

```bash
# Localmente, apontando para produção
DATABASE_URL="sua-connection-string-do-supabase" npm run db:seed
```

⚠️ **ATENÇÃO**: Execute o seed apenas uma vez!

---

## 5️⃣ Configurar Domínio Customizado (Opcional)

### 5.1 Adicionar Domínio

1. Na Vercel, vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `dottorio.com`)
4. Siga as instruções para configurar DNS

### 5.2 Atualizar Variáveis de Ambiente

Após configurar o domínio, atualize:

```bash
NEXTAUTH_URL=https://dottorio.com
NEXT_PUBLIC_APP_URL=https://dottorio.com
```

E faça um re-deploy.

---

## 6️⃣ Monitoramento e Logs

### Vercel Logs
- Acesse **Deployments** → Clique no deploy → **Function Logs**
- Monitore erros e performance

### Supabase Logs
- Acesse **Database** → **Logs**
- Monitore queries e conexões

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] `NEXTAUTH_SECRET` é único e forte (32+ caracteres)
- [ ] `OPENAI_API_KEY` está protegida (não commitada no git)
- [ ] Senha do Supabase é forte e única
- [ ] Connection string não está exposta publicamente
- [ ] CORS configurado corretamente (se usar APIs externas)
- [ ] Rate limiting ativo nas rotas de API
- [ ] Migrations testadas antes do deploy

### Variáveis de Ambiente

✅ **NUNCA** commite arquivos `.env` no git
✅ Use `.env.example` como template
✅ Todas as secrets devem estar na Vercel Environment Variables

---

## 🚨 Troubleshooting

### Erro: "Can't reach database server"

**Solução**: Verifique se:
1. Connection string do Supabase está correta
2. Senha não tem caracteres especiais sem encoding
3. Região do Supabase está acessível

### Erro: "Missing environment variable"

**Solução**:
1. Verifique se todas as variáveis estão configuradas na Vercel
2. Faça um re-deploy após adicionar variáveis

### Erro: "Prisma migration failed"

**Solução**:
1. Execute migrations manualmente via Vercel CLI
2. Verifique logs do Supabase para erros de schema

### Build Timeout na Vercel

**Solução**:
1. Verifique se o plano da Vercel tem limite de tempo adequado
2. Otimize migrations grandes (rodar separadamente)

---

## 📊 Custos Estimados

### Free Tier (Início)

| Serviço | Plano | Custo | Limites |
|---------|-------|-------|---------|
| Vercel | Hobby | **$0/mês** | 100GB bandwidth, 100 builds |
| Supabase | Free | **$0/mês** | 500MB database, 2GB bandwidth |
| OpenAI | Pay as you go | **~$5-20/mês** | Varia conforme uso |

**Total estimado**: $5-20/mês

### Produção (Recomendado)

| Serviço | Plano | Custo | Limites |
|---------|-------|-------|---------|
| Vercel | Pro | **$20/mês** | 1TB bandwidth, unlimited builds |
| Supabase | Pro | **$25/mês** | 8GB database, 250GB bandwidth |
| OpenAI | Pay as you go | **~$50-200/mês** | Varia conforme uso |

**Total estimado**: $95-245/mês

---

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. [ ] Configurar monitoramento (Sentry, LogRocket, etc.)
2. [ ] Configurar backups automáticos do Supabase
3. [ ] Configurar CI/CD para testes automatizados
4. [ ] Configurar analytics (Google Analytics, Plausible, etc.)
5. [ ] Revisar checklist de segurança
6. [ ] Testar fluxos críticos em produção
7. [ ] Configurar domínio customizado
8. [ ] Documentar processos de deploy para o time

---

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

**Última atualização**: 2026-01-21
