.PHONY: help dev install setup clean db-* docker-*

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Shows this help
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  🩺 DOTTORIO - Available Commands$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

# ============================================
# 🚀 Setup & Installation
# ============================================

install: ## Install dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	@yarn install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

setup: install docker-up db-setup ## Complete project setup (install + docker + db)
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)✅ Setup completed successfully!$(NC)"
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)🎯 Next steps:$(NC)"
	@echo "  1. $(GREEN)make dev$(NC) - Start development server"
	@echo "  2. $(GREEN)make studio$(NC) - Open Prisma Studio"
	@if [ -f .env ]; then \
		DEV_PORT=$$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		DEV_PORT=$${DEV_PORT:-3000}; \
		echo "  3. Access $(BLUE)http://localhost:$$DEV_PORT$(NC)"; \
	else \
		echo "  3. Access $(BLUE)http://localhost:3000$(NC)"; \
	fi
	@echo ""

clean: ## Clean cache and build
	@echo "$(YELLOW)🧹 Cleaning cache...$(NC)"
	@rm -rf .next
	@rm -rf node_modules/.cache
	@echo "$(GREEN)✅ Cache cleaned!$(NC)"

reset: ## Complete reset (⚠️ removes node_modules and DB)
	@echo "$(RED)⚠️  WARNING: This will remove node_modules and reset the database!$(NC)"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Removing node_modules...$(NC)"; \
		rm -rf node_modules; \
		echo "$(YELLOW)🗑️  Resetting database...$(NC)"; \
		docker compose down -v; \
		echo "$(GREEN)✅ Complete reset done!$(NC)"; \
		echo "$(BLUE)Run 'make setup' to reconfigure everything$(NC)"; \
	fi

# ============================================
# 💻 Development
# ============================================

dev: ## Start development server (with Docker verification)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)🚀 Starting development environment...$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)1/5 Checking Docker...$(NC)"
	@if ! docker info >/dev/null 2>&1; then \
		echo "$(RED)❌ Docker is not running!$(NC)"; \
		echo "$(YELLOW)🔄 Attempting to start Docker...$(NC)"; \
		if [ "$$(uname)" = "Darwin" ]; then \
			open -a Docker && echo "$(BLUE)⏳ Waiting for Docker to start...$(NC)"; \
			for i in 1 2 3 4 5 6 7 8 9 10 11 12; do \
				if docker info >/dev/null 2>&1; then \
					echo "$(GREEN)✅ Docker started!$(NC)"; \
					break; \
				fi; \
				printf "$(YELLOW).$(NC)"; \
				sleep 2; \
			done; \
			if ! docker info >/dev/null 2>&1; then \
				echo ""; \
				echo "$(RED)❌ Timeout starting Docker. Please start it manually.$(NC)"; \
				exit 1; \
			fi; \
		else \
			echo "$(RED)❌ Please start Docker manually.$(NC)"; \
			exit 1; \
		fi; \
	else \
		echo "$(GREEN)✅ Docker is running$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)2/5 Checking project containers...$(NC)"
	@if ! docker compose ps | grep -q "dottorio-db.*running"; then \
		echo "$(YELLOW)🐳 Starting containers...$(NC)"; \
		docker compose up -d; \
		echo "$(GREEN)✅ Containers started!$(NC)"; \
	else \
		echo "$(GREEN)✅ Containers already running$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)3/5 Waiting for PostgreSQL to be ready...$(NC)"
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		if docker exec dottorio-db pg_isready -U dottorio -d dottorio >/dev/null 2>&1; then \
			echo "$(GREEN)✅ PostgreSQL is ready!$(NC)"; \
			break; \
		fi; \
		printf "$(YELLOW).$(NC)"; \
		sleep 1; \
	done
	@echo ""
	@echo "$(YELLOW)4/5 Checking database schema...$(NC)"
	@yarn db:push --skip-generate >/dev/null 2>&1 || true
	@echo "$(GREEN)✅ Schema synchronized!$(NC)"
	@echo ""
	@echo "$(YELLOW)5/6 Checking if port is in use...$(NC)"
	@if [ -f .env ]; then \
		DEV_PORT=$$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		DEV_PORT=$${DEV_PORT:-3000}; \
		if lsof -ti:$$DEV_PORT >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Port $$DEV_PORT is in use. Killing process...$(NC)"; \
			lsof -ti:$$DEV_PORT | xargs kill -9 2>/dev/null || true; \
			sleep 1; \
			echo "$(GREEN)✅ Port cleared!$(NC)"; \
		else \
			echo "$(GREEN)✅ Port $$DEV_PORT is available$(NC)"; \
		fi; \
	else \
		if lsof -ti:3000 >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Port 3000 is in use. Killing process...$(NC)"; \
			lsof -ti:3000 | xargs kill -9 2>/dev/null || true; \
			sleep 1; \
			echo "$(GREEN)✅ Port cleared!$(NC)"; \
		else \
			echo "$(GREEN)✅ Port 3000 is available$(NC)"; \
		fi; \
	fi
	@echo ""
	@echo "$(YELLOW)6/6 Starting Next.js server...$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)✨ All set! Starting application...$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@yarn dev

dev-simple: ## Start server without checks (faster)
	@echo "$(BLUE)🚀 Starting server...$(NC)"
	@if [ -f .env ]; then \
		DEV_PORT=$$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		DEV_PORT=$${DEV_PORT:-3000}; \
		if lsof -ti:$$DEV_PORT >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Killing process on port $$DEV_PORT...$(NC)"; \
			lsof -ti:$$DEV_PORT | xargs kill -9 2>/dev/null || true; \
			sleep 1; \
		fi; \
	else \
		lsof -ti:3000 | xargs kill -9 2>/dev/null || true; \
	fi
	@yarn dev

dev-turbo: ## Dev server with Turbopack (with Docker verification)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)🚀 Starting development environment (Turbopack)...$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)1/4 Checking Docker...$(NC)"
	@if ! docker info >/dev/null 2>&1; then \
		echo "$(RED)❌ Docker is not running!$(NC)"; \
		echo "$(YELLOW)🔄 Attempting to start Docker...$(NC)"; \
		if [ "$$(uname)" = "Darwin" ]; then \
			open -a Docker && echo "$(BLUE)⏳ Waiting for Docker to start...$(NC)"; \
			for i in 1 2 3 4 5 6 7 8 9 10 11 12; do \
				if docker info >/dev/null 2>&1; then \
					echo "$(GREEN)✅ Docker started!$(NC)"; \
					break; \
				fi; \
				printf "$(YELLOW).$(NC)"; \
				sleep 2; \
			done; \
		fi; \
	else \
		echo "$(GREEN)✅ Docker is running$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)2/4 Checking project containers...$(NC)"
	@if ! docker compose ps | grep -q "dottorio-db.*running"; then \
		echo "$(YELLOW)🐳 Starting containers...$(NC)"; \
		docker compose up -d; \
	else \
		echo "$(GREEN)✅ Containers already running$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)3/4 Waiting for PostgreSQL to be ready...$(NC)"
	@for i in 1 2 3 4 5 6 7 8 9 10; do \
		if docker exec dottorio-db pg_isready -U dottorio -d dottorio >/dev/null 2>&1; then \
			echo "$(GREEN)✅ PostgreSQL is ready!$(NC)"; \
			break; \
		fi; \
		printf "$(YELLOW).$(NC)"; \
		sleep 1; \
	done
	@echo ""
	@echo "$(YELLOW)4/5 Checking if port is in use...$(NC)"
	@if [ -f .env ]; then \
		DEV_PORT=$$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		DEV_PORT=$${DEV_PORT:-3000}; \
		if lsof -ti:$$DEV_PORT >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Port $$DEV_PORT is in use. Killing process...$(NC)"; \
			lsof -ti:$$DEV_PORT | xargs kill -9 2>/dev/null || true; \
			sleep 1; \
			echo "$(GREEN)✅ Port cleared!$(NC)"; \
		else \
			echo "$(GREEN)✅ Port $$DEV_PORT is available$(NC)"; \
		fi; \
	else \
		if lsof -ti:3000 >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Port 3000 is in use. Killing process...$(NC)"; \
			lsof -ti:3000 | xargs kill -9 2>/dev/null || true; \
			sleep 1; \
			echo "$(GREEN)✅ Port cleared!$(NC)"; \
		else \
			echo "$(GREEN)✅ Port 3000 is available$(NC)"; \
		fi; \
	fi
	@echo ""
	@echo "$(YELLOW)5/5 Starting Next.js server (Turbopack)...$(NC)"
	@echo "$(GREEN)✨ All set!$(NC)"
	@echo ""
	@yarn dev:turbo

dev-reset: ## Quick reset and start dev (when something goes wrong)
	@echo "$(YELLOW)🔄 Resetting environment...$(NC)"
	@docker compose down 2>/dev/null || true
	@docker compose up -d
	@echo "$(BLUE)⏳ Waiting for PostgreSQL...$(NC)"
	@sleep 3
	@echo "$(YELLOW)🗄️  Synchronizing schema...$(NC)"
	@yarn db:push --skip-generate >/dev/null 2>&1 || true
	@echo "$(GREEN)✅ Environment reset!$(NC)"
	@echo ""
	@$(MAKE) dev-simple

port-kill: ## Kill process on dev port
	@if [ -f .env ]; then \
		DEV_PORT=$$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		DEV_PORT=$${DEV_PORT:-3000}; \
		if lsof -ti:$$DEV_PORT >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Killing process on port $$DEV_PORT...$(NC)"; \
			lsof -ti:$$DEV_PORT | xargs kill -9 2>/dev/null || true; \
			echo "$(GREEN)✅ Port $$DEV_PORT cleared!$(NC)"; \
		else \
			echo "$(GREEN)✅ Port $$DEV_PORT is already free$(NC)"; \
		fi; \
	else \
		if lsof -ti:3000 >/dev/null 2>&1; then \
			echo "$(YELLOW)⚠️  Killing process on port 3000...$(NC)"; \
			lsof -ti:3000 | xargs kill -9 2>/dev/null || true; \
			echo "$(GREEN)✅ Port 3000 cleared!$(NC)"; \
		else \
			echo "$(GREEN)✅ Port 3000 is already free$(NC)"; \
		fi; \
	fi

check: ## Check if environment is OK (without starting anything)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)🔍 Checking development environment...$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@printf "$(YELLOW)Docker daemon:        $(NC)"
	@if docker info >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Running$(NC)"; \
	else \
		echo "$(RED)❌ Not running$(NC)"; \
	fi
	@printf "$(YELLOW)PostgreSQL container: $(NC)"
	@if docker compose ps | grep -q "dottorio-db.*running"; then \
		echo "$(GREEN)✅ Running$(NC)"; \
	else \
		echo "$(RED)❌ Not running$(NC)"; \
	fi
	@printf "$(YELLOW)PostgreSQL connects:  $(NC)"
	@if docker exec dottorio-db pg_isready -U dottorio -d dottorio >/dev/null 2>&1; then \
		echo "$(GREEN)✅ Connecting$(NC)"; \
	else \
		echo "$(RED)❌ Not connecting$(NC)"; \
	fi
	@printf "$(YELLOW)Node modules:         $(NC)"
	@if [ -d "node_modules" ]; then \
		echo "$(GREEN)✅ Installed$(NC)"; \
	else \
		echo "$(RED)❌ Not installed$(NC)"; \
	fi
	@echo ""
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

build: ## Build for production
	@echo "$(BLUE)🏗️  Building...$(NC)"
	@yarn build
	@echo "$(GREEN)✅ Build completed!$(NC)"

start: ## Start production server
	@yarn start

# ============================================
# 🗄️ Database (Prisma)
# ============================================

db-setup: ## Complete DB setup (migrate + seed)
	@echo "$(BLUE)🗄️  Setting up database...$(NC)"
	@yarn db:setup
	@echo "$(GREEN)✅ Database configured!$(NC)"

db-migrate: ## Create and apply migration
	@echo "$(BLUE)📝 Creating migration...$(NC)"
	@yarn db:migrate

db-push: ## Push schema (fast dev, no migration)
	@echo "$(YELLOW)⚡ Pushing schema...$(NC)"
	@yarn db:push

db-seed: ## Run seeds
	@echo "$(BLUE)🌱 Running seeds...$(NC)"
	@yarn db:seed
	@echo "$(GREEN)✅ Seeds applied!$(NC)"

db-reset: ## Reset DB (⚠️ deletes everything)
	@echo "$(RED)⚠️  WARNING: This will delete ALL data!$(NC)"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Resetting database...$(NC)"; \
		yarn db:reset; \
		echo "$(GREEN)✅ Database reset!$(NC)"; \
	fi

db-fresh: db-reset db-seed ## Reset + Seed (fresh database)

db-quick: ## ⚡ Quick DB reset (no confirmation, for dev)
	@echo "$(YELLOW)⚡ Quick database reset...$(NC)"
	@docker compose down -v 2>/dev/null || true
	@docker compose up -d
	@echo "$(BLUE)⏳ Waiting for PostgreSQL to start...$(NC)"
	@sleep 3
	@PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="dev reset" npx prisma db push --force-reset
	@npx prisma db seed
	@echo "$(GREEN)✅ Database reset and seeded!$(NC)"

studio: ## Open Prisma Studio
	@echo "$(BLUE)🎨 Opening Prisma Studio...$(NC)"
	@echo "$(YELLOW)→ http://localhost:5555$(NC)"
	@yarn db:studio

db-test: ## Test database connection (dev)
	@echo "$(BLUE)🔌 Testing database connection (development)...$(NC)"
	@yarn db:test

db-test-prod: ## Test database connection (prod)
	@echo "$(BLUE)🔌 Testing database connection (production)...$(NC)"
	@yarn db:test:prod

# ============================================
# 🐳 Docker
# ============================================

docker-up: ## Start containers (PostgreSQL + pgAdmin)
	@echo "$(BLUE)🐳 Starting containers...$(NC)"
	@if ! docker info >/dev/null 2>&1; then \
		echo "$(RED)❌ Docker is not running!$(NC)"; \
		if [ "$$(uname)" = "Darwin" ]; then \
			echo "$(YELLOW)🔄 Starting Docker...$(NC)"; \
			open -a Docker; \
			echo "$(BLUE)⏳ Waiting for Docker to start...$(NC)"; \
			for i in 1 2 3 4 5 6 7 8 9 10 11 12; do \
				if docker info >/dev/null 2>&1; then \
					break; \
				fi; \
				printf "$(YELLOW).$(NC)"; \
				sleep 2; \
			done; \
			echo ""; \
		else \
			echo "$(RED)Please start Docker manually and try again.$(NC)"; \
			exit 1; \
		fi; \
	fi
	@docker compose up -d
	@echo "$(GREEN)✅ Containers started!$(NC)"
	@echo "$(YELLOW)→ PostgreSQL: localhost:5435$(NC)"
	@echo "$(YELLOW)→ pgAdmin: http://localhost:5050$(NC)"

docker-down: ## Stop containers
	@echo "$(YELLOW)🛑 Stopping containers...$(NC)"
	@docker compose down
	@echo "$(GREEN)✅ Containers stopped!$(NC)"

docker-logs: ## Show container logs
	@docker compose logs -f

docker-restart: ## Restart containers
	@docker compose restart

docker-ps: ## List containers
	@docker compose ps

# ============================================
# 🧪 Code Quality
# ============================================

lint: ## Run lint
	@yarn lint

lint-fix: ## Run lint with auto-fix
	@yarn lint:fix

format: ## Format code with Prettier
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	@yarn format
	@echo "$(GREEN)✅ Code formatted!$(NC)"

format-check: ## Check formatting
	@yarn format:check

type-check: ## Check TypeScript types
	@echo "$(BLUE)🔍 Checking types...$(NC)"
	@yarn type-check

validate: type-check lint format-check ## Validate everything (types + lint + format)
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)✅ Everything validated successfully!$(NC)"
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

# ============================================
# 🛠️ Utilities
# ============================================

scrape: ## Run Sapienza scraper
	@echo "$(BLUE)🕷️  Running scraper...$(NC)"
	@yarn scrape
	@echo "$(GREEN)✅ Scraping completed!$(NC)"
	@echo "$(YELLOW)→ Data saved in data/sapienza-medicina.json$(NC)"

psql: ## Connect to PostgreSQL via psql
	@docker exec -it dottorio-db psql -U dottorio -d dottorio

# ============================================
# 📊 Information
# ============================================

info: ## Show environment info
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  📊 Environment Information$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)Node:$(NC)        $$(node --version)"
	@echo "$(GREEN)Yarn:$(NC)        $$(yarn --version)"
	@echo "$(GREEN)Next.js:$(NC)     $$(node -p "require('./package.json').dependencies.next")"
	@echo "$(GREEN)Docker:$(NC)      $$(docker --version | cut -d' ' -f3 | tr -d ',')"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)🔗 URLs:$(NC)"
	@if [ -f .env ]; then \
		DEV_PORT=$$(grep -E '^PORT=' .env | cut -d'=' -f2 | tr -d '"' | tr -d "'"); \
		DEV_PORT=$${DEV_PORT:-3000}; \
		echo "  App:        $(BLUE)http://localhost:$$DEV_PORT$(NC)"; \
	else \
		echo "  App:        $(BLUE)http://localhost:3000$(NC)"; \
	fi
	@echo "  Studio:     $(BLUE)http://localhost:5555$(NC)"
	@echo "  pgAdmin:    $(BLUE)http://localhost:5050$(NC)"
	@echo ""
