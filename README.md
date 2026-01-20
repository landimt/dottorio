# 🎓 Dottorio

**La piattaforma collaborativa per studenti universitari italiani**

Dottorio è un'applicazione web che permette agli studenti universitari di condividere, studiare e prepararsi per gli esami attraverso un database collaborativo di domande d'esame. La piattaforma è pensata principalmente per studenti di Medicina, ma può essere utilizzata da qualsiasi facoltà.

---

## 🌟 Caratteristiche Principali

- 📝 **Gestione Domande d'Esame** - Registra e cerca domande per materia, professore e università
- 🤖 **Risposte IA** - Risposte generate dall'IA con sistema di valutazione a stelle
- ✍️ **Risposte Personali** - Scrivi e condividi le tue risposte (pubbliche o private)
- 💬 **Commenti ed Esperienze** - Condividi consigli ed esperienze con altri studenti
- 👥 **Sistema Collaborativo** - Link condivisibili per rappresentanti di classe
- 🔍 **Ricerca Avanzata** - Filtra per università, corso, materia, professore e anno
- 📊 **Pannello Admin** - Gestione completa di domande, risposte e contenuti

---

## 🛠️ Stack Tecnologico

- **Next.js 16.1.4** (App Router) + TypeScript
- **Prisma** + PostgreSQL
- **NextAuth.js** per autenticazione
- **TailwindCSS** + Radix UI (shadcn/ui)
- **TipTap** (rich text editor con Markdown)
- **React Query** + Zod
- **next-intl** per internazionalizzazione

---

## 🚀 Installazione

### Prerequisiti
- Node.js 20+
- Yarn o npm
- Docker
- Make (opzionale, consigliato)

### Setup Completo

```bash
# 1. Clona il repository
git clone https://github.com/landimt/dottorio.git
cd dottorio

# 2. Installa le dipendenze
yarn install

# 3. Configura le variabili d'ambiente
cp .env.example .env
# Modifica il file .env con le tue configurazioni

# 4. Setup completo (Docker + Database)
make setup

# 5. Avvia il server di sviluppo
make dev
```

Accedi a **http://localhost:3000**

---

## ⚡ Comandi Principali

### Sviluppo

```bash
make dev              # Avvia il server di sviluppo (con verifica Docker)
make dev-turbo        # Avvia con Turbopack (più veloce)
make dev-simple       # Avvia senza verifiche (più veloce)
make dev-reset        # Reset rapido e avvio (quando qualcosa va storto)
make check            # Verifica lo stato dell'ambiente
```

### Database

```bash
make studio           # Apri Prisma Studio (GUI del database)
make db-setup         # Setup completo (migrate + seed)
make db-push          # Sincronizza schema (veloce per dev)
make db-migrate       # Crea e applica migration
make db-seed          # Esegui seeds
make db-fresh         # Reset completo + seed
make db-quick         # Reset veloce senza conferma (solo dev)
```

### Docker

```bash
make docker-up        # Avvia i container (PostgreSQL + pgAdmin)
make docker-down      # Ferma i container
make docker-restart   # Riavvia i container
make docker-logs      # Mostra i log dei container
make docker-ps        # Lista i container attivi
```

### Qualità del Codice

```bash
make validate         # Valida tutto (TypeScript + lint + format)
make type-check       # Verifica i tipi TypeScript
make lint             # Esegui lint
make lint-fix         # Correggi automaticamente gli errori di lint
make format           # Formatta il codice con Prettier
make format-check     # Verifica la formattazione
```

### Utility

```bash
make scrape           # Esegui lo scraper Sapienza
make psql             # Connettiti a PostgreSQL via psql
make info             # Mostra informazioni sull'ambiente
make help             # Mostra tutti i comandi disponibili
```

### Build e Produzione

```bash
make build            # Build per produzione
make start            # Avvia il server di produzione
```

### Manutenzione

```bash
make clean            # Pulisci cache e build
make reset            # Reset completo (rimuove node_modules e DB)
```

**Oppure usa Yarn direttamente:**

```bash
yarn dev              # Server di sviluppo
yarn dev:turbo        # Server con Turbopack
yarn build            # Build produzione
yarn db:studio        # Prisma Studio
yarn db:push          # Push schema
yarn db:seed          # Esegui seeds
yarn scrape           # Scraper Sapienza
```

---

## 📂 Struttura del Progetto

```
dottorio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Routes principali
│   │   ├── admin/             # Pannello admin
│   │   ├── api/               # API routes
│   │   └── share/             # Sistema di condivisione
│   ├── components/            # Componenti React
│   │   ├── ui/               # Componenti UI base (shadcn/ui)
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities e helpers
│   │   ├── api/             # API client
│   │   ├── services/        # Business logic
│   │   └── query/           # React Query hooks
│   ├── i18n/                # Traduzioni (IT/EN)
│   └── types/               # TypeScript types
├── prisma/                   # Database
│   ├── schema.prisma        # Schema del database
│   ├── migrations/          # Migrations
│   └── seed.ts             # Database seeds
├── data/                    # Dati estratti e seeds
├── scripts/                 # Scripts utility
└── public/                  # Assets statici
```

---

## 🗄️ Database

### PostgreSQL via Docker

- **Porta:** 5435
- **Database:** dottorio
- **User:** dottorio
- **Password:** dottorio123

### Strumenti

- **Prisma Studio:** [http://localhost:5555](http://localhost:5555)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050)
  - Email: `admin@dottorio.local`
  - Password: `admin123`

### Modelli Principali

- `User` - Utenti del sistema
- `University` - Università italiane
- `Course` - Corsi di laurea
- `Subject` - Materie
- `Professor` - Professori
- `Exam` - Esami
- `Question` - Domande d'esame
- `Answer` - Risposte degli studenti
- `AiAnswer` - Risposte generate dall'IA
- `AiRating` - Valutazioni delle risposte IA
- `Comment` - Commenti
- `ShareLink` - Link condivisibili

---

## 🌐 Internazionalizzazione

Supporto completo per più lingue tramite `next-intl`:

- 🇮🇹 **Italiano** (predefinito)
- 🇬🇧 **English**

Le traduzioni si trovano in `src/i18n/messages/`.

---

## 👥 Ruoli Utente

- **Student** - Può cercare domande, aggiungere risposte, valutare risposte IA
- **Representative** - Come studente + può creare esami e generare link condivisibili
- **Admin** - Accesso completo al pannello admin
- **Super Admin** - Gestione completa del sistema

---

## 🔐 Autenticazione

Sistema basato su **NextAuth.js** con:
- Login/registrazione con email e password
- Gestione sessioni
- Protezione delle route
- Ruoli e permessi

---

## 🎨 Interfaccia

### Design System
- **Shadcn/ui** - Componenti UI moderni e accessibili
- **TailwindCSS** - Styling utility-first
- **Radix UI** - Componenti headless
- **Lucide Icons** - Icone consistenti

### Editor Rich Text
- **TipTap** - Editor WYSIWYG potente
- Supporto Markdown
- Drag & drop immagini
- Formattazione avanzata (titoli, liste, codice, ecc.)
- Toolbar completa
- Compatibile con estensioni Notion-style

---

## 🚀 Features Admin

Il pannello admin include:

- **Gestione Domande**
  - Layout 20/80 con filtri avanzati
  - Ricerca e ordinamento real-time
  - Editor risposte IA con TipTap
  - Azioni bulk (nascondi, elimina, esporta)

- **Gestione Risposte**
  - Toggle visibilità (pubblica/privata)
  - Modifica e cancellazione
  - Visualizzazione statistiche

- **Gestione Commenti**
  - Moderazione commenti
  - Azioni rapide (modifica/elimina)

- **Statistiche**
  - Visualizzazioni
  - Valutazioni IA
  - Engagement utenti

---

## 📄 Licenza

**Copyright © 2026 Dottorio. Tutti i diritti riservati.**

Questo progetto è di proprietà privata. È **vietata** la distribuzione, copia, modifica o uso commerciale senza autorizzazione esplicita.

Per informazioni su licenze e permessi, contatta il proprietario del repository.

---

**Sviluppato con ❤️ per gli studenti universitari italiani**
