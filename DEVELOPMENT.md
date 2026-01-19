# 🛠️ Desenvolvimento - Dottorio

## 🚀 Setup Inicial

```bash
# 1. Clonar e instalar
git clone <repo>
cd dottorio
yarn install

# 2. Configurar .env
cp .env.example .env

# 3. Subir banco + migrations + seed
make setup

# 4. Iniciar dev server
make dev
```

## ⚡ Comandos Principais

```bash
# Desenvolvimento
make dev              # Dev server (http://localhost:3000)
make studio           # Prisma Studio (http://localhost:5555)
make help             # Ver todos os comandos

# Database
make db-fresh         # Reset + seed completo
make db-migrate       # Nova migration

# Qualidade
make validate         # TypeScript + ESLint + Prettier
make format           # Auto-format código

# Docker
make docker-up        # Subir PostgreSQL + pgAdmin
make docker-down      # Parar containers
```

### Ou use Yarn diretamente

```bash
yarn dev              # Dev server
yarn db:studio        # Prisma Studio
yarn db:fresh         # Reset DB + seed
yarn validate         # Verificar tudo
```

## 🗄️ Database

**PostgreSQL via Docker:**
- Host: `localhost:5435`
- Database: `dottorio`
- User/Pass: `dottorio` / `dottorio_dev_2024`

**pgAdmin:** http://localhost:5050
- Email: `admin@dottorio.local`
- Password: `admin123`

## 🔑 Variáveis de Ambiente (.env)

```env
DATABASE_URL="postgresql://dottorio:dottorio_dev_2024@localhost:5435/dottorio"
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🎨 VS Code/Cursor

Extensões recomendadas em `.vscode/extensions.json` - o editor vai sugerir instalar automaticamente.

**Snippets disponíveis:**
- `rsc` → React Server Component
- `rcc` → React Client Component
- `naget/napost` → Next.js API Routes
- `pquery` → Prisma query

## 🐛 Troubleshooting

```bash
# Porta em uso
lsof -i :3000 && kill -9 <PID>
lsof -i :5435 && kill -9 <PID>

# DB não conecta
make docker-restart

# Prisma desatualizado
yarn db:generate

# Cache corrompido
make clean

# Reset total
make reset && make setup
```

## 📂 Estrutura

```
dottorio/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   └── lib/              # Utilitários
├── prisma/
│   ├── schema.prisma     # Schema DB
│   ├── migrations/       # Migrations
│   └── seed.ts           # Seeds
├── scripts/
│   └── scrape-sapienza.ts # Scraper
└── data/                 # Dados extraídos
```

## 🔄 Workflow

```bash
# 1. Manhã
make docker-up && make dev

# 2. Antes de commit
make validate
git add . && git commit -m "feat: nova funcionalidade"

# 3. Mudanças no schema
# Editar prisma/schema.prisma
make db-migrate
make db-fresh  # testar seed
```

---

**Dica:** Digite `make help` para ver todos os comandos com cores! 🌈
