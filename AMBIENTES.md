# 🌍 Configuração de Ambientes - Dottorio

Este documento explica como funcionam os ambientes de desenvolvimento e produção do projeto.

---

## 📦 Estrutura de Ambientes

O projeto possui 2 ambientes configurados:

### 1. **Desenvolvimento Local**
- **Arquivo**: `.env.development`
- **Banco de dados**: PostgreSQL local (Docker)
- **Porta**: 5435
- **Uso**: Desenvolvimento local na sua máquina

### 2. **Produção Temporária (Supabase)**
- **Arquivo**: `.env.production`
- **Banco de dados**: Supabase PostgreSQL
- **Uso**: Deploy temporário para testes e validação
- **⚠️ IMPORTANTE**: Este ambiente será migrado para uma infraestrutura mais robusta no futuro

---

## 🔧 Configuração Inicial

### Desenvolvimento Local

1. O arquivo `.env.development` já está configurado para o banco local:

```bash
DATABASE_URL="postgresql://dottorio:dottorio_dev_2024@localhost:5435/dottorio"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev_secret_key_change_in_production_32chars_minimum_required"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000
```

2. Copie para `.env` se ainda não tiver:

```bash
cp .env.development .env
```

3. Inicie o ambiente:

```bash
make setup
# ou
make dev
```

### Produção (Supabase)

1. O arquivo `.env.production` já está configurado com as credenciais do Supabase

2. **NÃO** commite este arquivo no git (já está no `.gitignore`)

3. Para deploy na Vercel, configure as variáveis de ambiente diretamente no painel:
   - Vá em **Settings** → **Environment Variables**
   - Adicione cada variável do `.env.production`

---

## 🧪 Testar Conexão com Banco de Dados

### Testar ambiente de desenvolvimento

```bash
npm run db:test
# ou
make db-test
```

**Saída esperada:**
```
┌────────────────────────────────────────────────────────────┐
│  🗄️  TESTE DE CONEXÃO COM BANCO DE DADOS                  │
└────────────────────────────────────────────────────────────┘

🔌 Tentando conectar ao banco de dados...
📁 Ambiente: DEVELOPMENT
📄 Arquivo: .env.development

✅ Conexão estabelecida com sucesso!

┌────────────────────────────────────────────────────────────┐
│  📊 INFORMAÇÕES DO BANCO                                   │
└────────────────────────────────────────────────────────────┘

  🏢 Host:           localhost
  🔌 Porta:          5435
  👤 Usuário:        dottorio
  💾 Banco:          dottorio
  📦 Versão:         PostgreSQL 16.x
  🕐 Hora do Banco:  21/01/2026 15:30:00
  📋 Tabelas:        X tabelas na schema 'public'

┌────────────────────────────────────────────────────────────┐
│  ✅ CONEXÃO OK                                             │
└────────────────────────────────────────────────────────────┘
```

### Testar ambiente de produção (Supabase)

```bash
npm run db:test:prod
# ou
make db-test-prod
```

**Saída esperada:**
```
┌────────────────────────────────────────────────────────────┐
│  🗄️  TESTE DE CONEXÃO COM BANCO DE DADOS                  │
└────────────────────────────────────────────────────────────┘

🔌 Tentando conectar ao banco de dados...
📁 Ambiente: PRODUCTION
📄 Arquivo: .env.production

✅ Conexão estabelecida com sucesso!

┌────────────────────────────────────────────────────────────┐
│  📊 INFORMAÇÕES DO BANCO                                   │
└────────────────────────────────────────────────────────────┘

  🏢 Host:           db.iebgiudqkduvvcrgftmp.supabase.co
  🔌 Porta:          5432
  👤 Usuário:        postgres
  💾 Banco:          postgres
  📦 Versão:         PostgreSQL 15.x (Supabase)
  🕐 Hora do Banco:  21/01/2026 18:30:00 (UTC)
  📋 Tabelas:        X tabelas na schema 'public'

┌────────────────────────────────────────────────────────────┐
│  ✅ CONEXÃO OK                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### Erro: "DATABASE_URL não encontrada"

**Solução**: Verifique se o arquivo `.env.development` ou `.env.production` existe na raiz do projeto.

### Erro: "Connection timeout" (Desenvolvimento)

**Possíveis causas**:
1. Docker não está rodando
2. Container do PostgreSQL não foi iniciado

**Solução**:
```bash
# Verificar se Docker está rodando
docker ps

# Iniciar containers
make docker-up
# ou
docker compose up -d

# Testar novamente
npm run db:test
```

### Erro: "Connection timeout" (Produção)

**Possíveis causas**:
1. Senha incorreta na `DATABASE_URL`
2. Firewall bloqueando conexão
3. Supabase temporariamente indisponível

**Solução**:
1. Verifique se a senha em `.env.production` está correta
2. Teste a conexão via navegador no painel do Supabase
3. Verifique se sua rede permite conexões externas na porta 5432

### Erro: "Nenhuma tabela encontrada"

**Solução**: Execute as migrations:

```bash
# Desenvolvimento
npm run db:push

# Produção
npm run db:migrate:deploy
```

---

## 📊 Comandos Úteis

### Desenvolvimento
```bash
# Iniciar ambiente completo
make setup

# Iniciar servidor de desenvolvimento
make dev

# Testar conexão com banco
make db-test
npm run db:test

# Resetar banco de dados
make db-quick

# Abrir Prisma Studio
make studio
```

### Produção
```bash
# Testar conexão com Supabase
make db-test-prod
npm run db:test:prod

# Executar migrations em produção
npm run db:migrate:deploy

# Verificar status das migrations
npm run db:migrate:status
```

---

## 🔐 Segurança

### ⚠️ IMPORTANTE

1. **NUNCA** commite arquivos `.env`, `.env.development` ou `.env.production` no git
2. **SEMPRE** use variáveis de ambiente diferentes para dev e prod
3. **NUNCA** compartilhe credenciais de produção
4. Para produção, gere um novo `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### Arquivos ignorados pelo Git

Os seguintes arquivos estão no `.gitignore` e **não** serão commitados:

```
.env
.env.local
.env.development
.env.development.local
.env.production
.env.test.local
.env.production.local
```

### O que **pode** ser versionado

- `.env.example` - Template de exemplo (sem credenciais reais)

---

## 🔄 Migração Futura

Este projeto está configurado para usar Supabase temporariamente. No futuro, a infraestrutura de produção será migrada para um ambiente mais robusto.

Quando isso acontecer:

1. Criar novo arquivo `.env.production` com as novas credenciais
2. Atualizar variáveis de ambiente na Vercel
3. Executar migrations no novo banco
4. Migrar dados do Supabase para o novo ambiente

---

## 📞 Suporte

Se encontrar problemas:

1. Execute `npm run db:test` ou `npm run db:test:prod` para diagnosticar
2. Verifique os logs do Docker: `make docker-logs`
3. Verifique se todas as variáveis de ambiente estão configuradas

---

**Última atualização**: 2026-01-21
