# 🎓 Dottorio

**La piattaforma collaborativa per studenti universitari italiani**

Dottorio è un'applicazione web che permette agli studenti universitari di condividere, studiare e prepararsi per gli esami attraverso un database collaborativo di domande d'esame. La piattaforma è pensata principalmente per studenti di Medicina, ma può essere utilizzata da qualsiasi facoltà.

---

## 🌟 Caratteristiche Principali

- 📝 **Gestione Domande d'Esame** - Registra e cerca domande per materia, professore e canale
- 🤖 **Risposte IA** - Risposte generate dall'IA con sistema di valutazione
- ✍️ **Risposte Personali** - Scrivi e condividi le tue risposte (pubbliche o private)
- 💬 **Esperienze d'Esame** - Condividi consigli ed esperienze con altri studenti
- 👥 **Sistema Collaborativo** - Link condivisibili per rappresentanti di classe

---

## 🛠️ Stack Tecnologico

- **Next.js 16** (App Router) + TypeScript
- **Prisma** + PostgreSQL
- **NextAuth.js** per autenticazione
- **TailwindCSS** + Radix UI
- **TipTap** (rich text editor)
- **React Query** + Zod

---

## 🚀 Installazione

### Prerequisiti
- Node.js 20+
- Yarn
- Docker
- Make (opcional)

### Setup Rápido

```bash
# 1. Clone e instale
git clone <repo>
cd dottorio
yarn install

# 2. Configure .env
cp .env.example .env

# 3. Setup completo
make setup

# 4. Inicie o servidor
make dev
```

Acesse http://localhost:3000

> 📖 **Guia completo de desenvolvimento:** [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## ⚡ Comandos Principais

```bash
make dev              # Dev server
make studio           # Prisma Studio (GUI do DB)
make db-fresh         # Reset + seed do banco
make validate         # Verificar código (TS + lint + format)
make help             # Ver todos os comandos
```

**Ou use Yarn:**

```bash
yarn dev              # Dev server
yarn db:studio        # Prisma Studio
yarn db:fresh         # Reset DB + seed
yarn scrape           # Scraper Sapienza
```

---

## 📂 Estrutura

```
dottorio/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   └── lib/              # Utilitários
├── prisma/               # Schema + migrations + seeds
├── scripts/              # Scripts (scraper, etc)
└── data/                 # Dados extraídos
```

---

## 🗄️ Database

PostgreSQL via Docker na porta **5435**

- **Prisma Studio:** http://localhost:5555
- **pgAdmin:** http://localhost:5050 (admin@dottorio.local / admin123)

---

## 🌐 Internazionalização

- 🇮🇹 **Italiano** (default)
- 🇬🇧 **English**

---

## 🤝 Contribuire

1. Fork do repositório
2. Crie um branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'feat: nova funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licenza

**Progetto privato.** Tutti i diritti riservati.

---

**Fatto con ❤️ per gli studenti universitari italiani**
