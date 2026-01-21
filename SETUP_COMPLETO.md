# ✅ Setup Completo - Ambientes Configurados

## 📦 O que foi configurado

### 1. Arquivos de Ambiente Criados

#### `.env.development` (Desenvolvimento Local)
```bash
DATABASE_URL="postgresql://dottorio:dottorio_dev_2024@localhost:5435/dottorio"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev_secret_key_change_in_production_32chars_minimum_required"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000
```

**Uso**: Banco local via Docker

#### `.env.production` (Produção - Supabase)
```bash
DATABASE_URL="postgresql://postgres.iebgiudqkduvvcrgftmp:CkKXoOUKT7U6saaf@aws-1-eu-west-1.pooler.supabase.com:6543/postgres"
NEXTAUTH_URL="https://seu-projeto.vercel.app"
NEXTAUTH_SECRET="GERAR_NOVA_SECRET_AQUI_COM_OPENSSL"
NEXT_PUBLIC_APP_URL="https://seu-projeto.vercel.app"
```

**⚠️ IMPORTANTE**:
- Usa Transaction Pooler (porta 6543) para Next.js/Vercel
- Não commitar este arquivo no git (já está no .gitignore)

---

### 2. Scripts de Teste Criados

#### `scripts/test-db-connection.ts`
Script completo para testar conexão com banco de dados (dev e prod)

#### `scripts/check-env.ts`
Script para validar variáveis de ambiente antes do deploy

---

### 3. Comandos Disponíveis

#### Testar Conexão

```bash
# Testar banco de desenvolvimento (Docker local)
npm run db:test
make db-test

# Testar banco de produção (Supabase)
npm run db:test:prod
make db-test-prod
```

#### Verificar Variáveis de Ambiente

```bash
npm run check:env
```

---

### 4. Configuração Vercel

#### Arquivo `vercel.json` criado

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## 🚀 Próximos Passos

### Para Deploy na Vercel:

1. **Conectar GitHub com Vercel**
   - Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
   - Importe o repositório `dottorio`

2. **Configurar Variáveis de Ambiente na Vercel**

   Vá em **Settings** → **Environment Variables** e adicione:

   ```bash
   # Database (Transaction Pooler - porta 6543!)
   DATABASE_URL=postgresql://postgres.iebgiudqkduvvcrgftmp:CkKXoOUKT7U6saaf@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

   # NextAuth (gerar novo secret)
   NEXTAUTH_SECRET=<resultado-do-openssl-rand-base64-32>
   NEXTAUTH_URL=<url-do-vercel-após-primeiro-deploy>

   # App URL
   NEXT_PUBLIC_APP_URL=<url-do-vercel-após-primeiro-deploy>

   # OpenAI (opcional)
   OPENAI_API_KEY=sk-proj-...
   ```

3. **Gerar NEXTAUTH_SECRET**

   No terminal:
   ```bash
   openssl rand -base64 32
   ```

4. **Primeiro Deploy**
   - Clique em **Deploy**
   - Aguarde ~3-5 minutos
   - Anote a URL gerada (ex: `dottorio-xyz.vercel.app`)

5. **Atualizar URLs**
   - Volte em **Settings** → **Environment Variables**
   - Atualize `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` com a URL real
   - Re-deploy (Deployments → três pontos → Redeploy)

---

## 🧪 Testar Localmente Antes do Deploy

### 1. Testar Ambiente de Desenvolvimento

```bash
# Iniciar Docker e servidor
make setup

# Em outro terminal, testar conexão
npm run db:test
```

**Saída esperada:**
```
✅ Conexão estabelecida com sucesso!
📊 Host: localhost
🔌 Porta: 5435
👤 Usuário: dottorio
💾 Banco: dottorio
```

### 2. Testar Ambiente de Produção (Opcional)

```bash
# Testar conexão com Supabase
npm run db:test:prod
```

**Saída esperada:**
```
✅ Conexão estabelecida com sucesso!
📊 Host: db.iebgiudqkduvvcrgftmp.supabase.co (via pooler)
🔌 Porta: 6543
👤 Usuário: postgres
💾 Banco: postgres
```

**Se houver erro de timeout:**
- Verifique se a URL do banco está correta em `.env.production`
- Verifique se a senha está correta
- Verifique firewall/VPN

---

## 📚 Documentação Criada

1. **DEPLOY.md** - Guia completo de deploy para Vercel + Supabase
2. **AMBIENTES.md** - Explicação detalhada de ambientes e troubleshooting
3. **SETUP_COMPLETO.md** (este arquivo) - Resumo de tudo que foi configurado
4. **.env.example** - Template atualizado com instruções

---

## ⚠️ Segurança

### Arquivos que NÃO devem ser commitados (já no .gitignore):

- `.env`
- `.env.local`
- `.env.development`
- `.env.development.local`
- `.env.production`
- `.env.production.local`

### Único arquivo versionado:

- `.env.example` - Template sem credenciais reais

---

## 🔍 Troubleshooting Rápido

### Erro: "DATABASE_URL não encontrada"

**Desenvolvimento:**
```bash
cp .env.development .env
```

**Produção:**
Verifique se as variáveis estão configuradas na Vercel

### Erro: "Connection timeout" (Dev)

```bash
# Verificar se Docker está rodando
docker ps

# Iniciar containers
make docker-up
```

### Erro: "Connection timeout" (Prod)

1. Verifique se está usando porta **6543** (Transaction Pooler)
2. Verifique se a senha está correta
3. Teste no painel do Supabase se o banco está acessível

### Erro: "Nenhuma tabela encontrada"

```bash
# Desenvolvimento
npm run db:push

# Produção
npm run db:migrate:deploy
```

---

## 📞 Comandos Úteis

```bash
# Desenvolvimento
make dev                # Iniciar servidor
make db-test            # Testar banco
make studio             # Abrir Prisma Studio
make check              # Verificar ambiente

# Produção
make db-test-prod       # Testar Supabase
npm run check:env       # Validar variáveis
npm run db:migrate:deploy  # Rodar migrations

# Utilidades
make help               # Ver todos os comandos
make info               # Ver informações do ambiente
```

---

## ✅ Checklist de Deploy

- [ ] Projeto conectado no GitHub
- [ ] Vercel importou o repositório
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `NEXTAUTH_SECRET` gerado (openssl rand -base64 32)
- [ ] `DATABASE_URL` usa Transaction Pooler (porta 6543)
- [ ] Primeiro deploy realizado
- [ ] URL do projeto anotada
- [ ] `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` atualizados
- [ ] Re-deploy realizado
- [ ] Migrations executadas em produção
- [ ] Aplicação testada em produção

---

**Configurado em**: 2026-01-21

**Status**: ✅ Pronto para deploy!
