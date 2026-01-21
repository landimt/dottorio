# ✅ Projeto Pronto para Deploy!

## 📦 Status: Tudo Configurado

### ✅ Ambiente Local (Desenvolvimento)
- **Arquivo**: `.env.development`
- **Banco**: Docker PostgreSQL (localhost:5435)
- **Status**: ✅ Funcionando

### ✅ Ambiente Produção (Supabase)
- **Arquivo**: `.env.production`
- **Projeto Supabase**: `dottorio` (org: Minervie)
- **Status**: ✅ Ativo e rodando
- **Transaction Pooler**: ✅ Habilitado (IPv4 compatible)
- **Região**: EU West (Irlanda)

---

## 🔑 Credenciais Confirmadas

### Connection String (Transaction Pooler - Porta 6543)
```bash
postgresql://postgres.iebgiudqkduvvcrgftmp:CkKXoOUKT7U6saaf@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

**Detalhes**:
- **Host**: `aws-1-eu-west-1.pooler.supabase.com`
- **Porta**: `6543` ⚠️ (Transaction Pooler para serverless)
- **User**: `postgres.iebgiudqkduvvcrgftmp`
- **Password**: `CkKXoOUKT7U6saaf`
- **Database**: `postgres`

---

## 🚀 Deploy na Vercel - Passo a Passo

### 1️⃣ Conectar Repositório GitHub

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Escolha o repositório **`dottorio`**
5. Clique em **"Import"**

---

### 2️⃣ Configurar Build

Na tela de configuração, deixe assim:

**Framework**: Next.js (auto-detectado)
**Root Directory**: `.` (raiz)
**Build Command**: `prisma generate && next build` (ou deixe default)
**Install Command**: `npm install` (default)

---

### 3️⃣ Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione **TODAS** estas variáveis:

#### 📊 Database (Supabase)
```bash
DATABASE_URL
```
**Valor**:
```
postgresql://postgres.iebgiudqkduvvcrgftmp:CkKXoOUKT7U6saaf@aws-1-eu-west-1.pooler.supabase.com:6543/postgres
```

#### 🔐 NextAuth Secret

**Variável**: `NEXTAUTH_SECRET`

**Como gerar**:
```bash
openssl rand -base64 32
```

Copie o resultado e cole como valor da variável.

**Exemplo de resultado**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0==
```

#### 🌐 URLs do Projeto

**IMPORTANTE**: No primeiro deploy, deixe em branco ou use um placeholder. Depois do primeiro deploy, você vai atualizar com a URL real.

```bash
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL
```

**Valor temporário** (ou deixe vazio):
```
https://seu-projeto.vercel.app
```

#### 🤖 OpenAI (Opcional)

Se você tem API key da OpenAI:

```bash
OPENAI_API_KEY
```
**Valor**: `sk-proj-...`

Se não tiver, **pule esta variável** (não é obrigatória para o deploy funcionar).

---

### 4️⃣ Primeiro Deploy

1. Clique em **"Deploy"**
2. Aguarde ~3-5 minutos
3. ✅ Vercel vai executar:
   - `npm install`
   - `prisma generate`
   - `next build`
   - Deploy da aplicação

4. **Anote a URL gerada**:
   - Exemplo: `dottorio-xyz.vercel.app`
   - Ou: `dottorio.vercel.app` (se tiver sorte!)

---

### 5️⃣ Atualizar URLs (Importante!)

Após o primeiro deploy com sucesso:

1. Vá em **Settings** → **Environment Variables**
2. **Edite** as variáveis:

```bash
NEXTAUTH_URL=https://dottorio-xyz.vercel.app
NEXT_PUBLIC_APP_URL=https://dottorio-xyz.vercel.app
```

(Substitua `dottorio-xyz.vercel.app` pela URL real do projeto)

3. Clique em **"Save"**

---

### 6️⃣ Re-deploy com URLs Corretas

1. Vá em **Deployments**
2. Clique nos **três pontos** (...) do último deploy
3. Selecione **"Redeploy"**
4. Confirme **"Redeploy"**

Aguarde ~2 minutos.

✅ **Pronto! Aplicação no ar!**

---

## 🗄️ Executar Migrations no Supabase

Depois do deploy, você precisa criar as tabelas no banco.

### Opção 1: Via Vercel Function (Automático)

As migrations já são executadas automaticamente no build command. Se o deploy foi bem-sucedido, as tabelas já foram criadas.

### Opção 2: Manualmente (Se precisar)

No terminal local:

```bash
# Usar arquivo de produção
NODE_ENV=production npm run db:migrate:deploy
```

Ou executar direto no Supabase via SQL Editor:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/iebgiudqkduvvcrgftmp/editor)
2. Vá em **SQL Editor**
3. Cole o schema do Prisma ou execute migrations manualmente

---

## 🧪 Testar Aplicação em Produção

### URLs para Testar

```
https://seu-projeto.vercel.app/
https://seu-projeto.vercel.app/login
https://seu-projeto.vercel.app/register
https://seu-projeto.vercel.app/questions
```

### Checklist de Teste

- [ ] Homepage carrega
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Listar questões funciona
- [ ] Criar questão funciona
- [ ] Responder questão funciona
- [ ] IA Answer funciona (se tiver OpenAI key)

---

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

**Causa**: DATABASE_URL incorreta ou Supabase inacessível

**Solução**:
1. Verifique se a DATABASE_URL está correta na Vercel
2. Confirme que a porta é **6543** (não 5432)
3. Verifique se o projeto Supabase está ativo

---

### Erro: "NextAuth configuration error"

**Causa**: NEXTAUTH_URL ou NEXTAUTH_SECRET incorretos

**Solução**:
1. Certifique-se que `NEXTAUTH_URL` aponta para a URL correta do Vercel
2. Confirme que `NEXTAUTH_SECRET` foi gerado com `openssl rand -base64 32`
3. Re-deploy após atualizar

---

### Erro: "Prisma Client not generated"

**Causa**: `prisma generate` não foi executado

**Solução**:
1. Verifique o build log na Vercel
2. Adicione `postinstall: "prisma generate"` no package.json (já está!)
3. Re-deploy

---

### Erro: "Table doesn't exist"

**Causa**: Migrations não foram executadas

**Solução**:
```bash
NODE_ENV=production npm run db:migrate:deploy
```

Ou execute as migrations via SQL Editor no Supabase.

---

## 📊 Monitoramento

### Logs da Vercel

1. Acesse **Deployments** → clique no deploy
2. Vá em **Function Logs**
3. Monitore erros em tempo real

### Logs do Supabase

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard/project/iebgiudqkduvvcrgftmp)
2. Vá em **Database** → **Logs**
3. Monitore queries e conexões

---

## 🎯 Resumo das Variáveis de Ambiente

Copie e cole na Vercel:

```bash
# Database (Supabase - Transaction Pooler)
DATABASE_URL=postgresql://postgres.iebgiudqkduvvcrgftmp:CkKXoOUKT7U6saaf@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# NextAuth (gerar com: openssl rand -base64 32)
NEXTAUTH_SECRET=<GERAR_AQUI>

# URLs (atualizar após primeiro deploy)
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app

# OpenAI (opcional)
# OPENAI_API_KEY=sk-proj-...
```

---

## ⚠️ Importante: Não Commitar Credenciais

Arquivos que **NÃO** devem ser commitados (já estão no `.gitignore`):

- ✅ `.env`
- ✅ `.env.development`
- ✅ `.env.production`
- ✅ `.env.local`

Arquivo que **pode** ser versionado:

- ✅ `.env.example` (sem credenciais reais)

---

## 📞 Precisa de Ajuda?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

## ✅ Checklist Final

Antes de fazer deploy, confirme:

- [ ] Repositório commitado no GitHub
- [ ] Arquivo `.env.production` **NÃO** foi commitado (verificar!)
- [ ] Supabase projeto ativo
- [ ] Transaction Pooler habilitado
- [ ] `NEXTAUTH_SECRET` gerado
- [ ] Variáveis de ambiente prontas para copiar

**Tudo pronto? Vá para a Vercel e faça o deploy! 🚀**

---

**Preparado em**: 2026-01-21
**Status**: ✅ **PRONTO PARA DEPLOY!**
