.PHONY: help dev install setup clean db-* docker-*

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostra este help
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  🩺 DOTTORIO - Comandos Disponíveis$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

# ============================================
# 🚀 Setup & Instalação
# ============================================

install: ## Instala as dependências
	@echo "$(BLUE)📦 Instalando dependências...$(NC)"
	@yarn install
	@echo "$(GREEN)✅ Dependências instaladas!$(NC)"

setup: install docker-up db-setup ## Setup completo do projeto (install + docker + db)
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)✅ Setup completo finalizado!$(NC)"
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)🎯 Próximos passos:$(NC)"
	@echo "  1. $(GREEN)make dev$(NC) - Iniciar servidor de desenvolvimento"
	@echo "  2. $(GREEN)make studio$(NC) - Abrir Prisma Studio"
	@echo "  3. Acessar $(BLUE)http://localhost:3000$(NC)"
	@echo ""

clean: ## Limpa cache e build
	@echo "$(YELLOW)🧹 Limpando cache...$(NC)"
	@rm -rf .next
	@rm -rf node_modules/.cache
	@echo "$(GREEN)✅ Cache limpo!$(NC)"

reset: ## Reset completo (⚠️ apaga node_modules e DB)
	@echo "$(RED)⚠️  ATENÇÃO: Isso vai apagar node_modules e resetar o banco!$(NC)"
	@read -p "Continuar? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Removendo node_modules...$(NC)"; \
		rm -rf node_modules; \
		echo "$(YELLOW)🗑️  Resetando banco...$(NC)"; \
		docker compose down -v; \
		echo "$(GREEN)✅ Reset completo!$(NC)"; \
		echo "$(BLUE)Execute 'make setup' para reconfigurar tudo$(NC)"; \
	fi

# ============================================
# 💻 Desenvolvimento
# ============================================

dev: ## Inicia o servidor de desenvolvimento
	@echo "$(BLUE)🚀 Iniciando servidor...$(NC)"
	@yarn dev

dev-turbo: ## Dev server com Turbopack
	@yarn dev:turbo

build: ## Build para produção
	@echo "$(BLUE)🏗️  Fazendo build...$(NC)"
	@yarn build
	@echo "$(GREEN)✅ Build finalizado!$(NC)"

start: ## Inicia servidor de produção
	@yarn start

# ============================================
# 🗄️ Database (Prisma)
# ============================================

db-setup: ## Setup completo do DB (migrate + seed)
	@echo "$(BLUE)🗄️  Configurando banco de dados...$(NC)"
	@yarn db:setup
	@echo "$(GREEN)✅ Banco configurado!$(NC)"

db-migrate: ## Cria e aplica migration
	@echo "$(BLUE)📝 Criando migration...$(NC)"
	@yarn db:migrate

db-push: ## Push schema (dev rápido, sem migration)
	@echo "$(YELLOW)⚡ Fazendo push do schema...$(NC)"
	@yarn db:push

db-seed: ## Roda seeds
	@echo "$(BLUE)🌱 Rodando seeds...$(NC)"
	@yarn db:seed
	@echo "$(GREEN)✅ Seeds aplicados!$(NC)"

db-reset: ## Reset do DB (⚠️ apaga tudo)
	@echo "$(RED)⚠️  ATENÇÃO: Isso vai apagar TODOS os dados!$(NC)"
	@read -p "Continuar? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Resetando banco...$(NC)"; \
		yarn db:reset; \
		echo "$(GREEN)✅ Banco resetado!$(NC)"; \
	fi

db-fresh: db-reset db-seed ## Reset + Seed (banco limpo)

studio: ## Abre Prisma Studio
	@echo "$(BLUE)🎨 Abrindo Prisma Studio...$(NC)"
	@echo "$(YELLOW)→ http://localhost:5555$(NC)"
	@yarn db:studio

# ============================================
# 🐳 Docker
# ============================================

docker-up: ## Inicia containers (PostgreSQL + pgAdmin)
	@echo "$(BLUE)🐳 Iniciando containers...$(NC)"
	@docker compose up -d
	@echo "$(GREEN)✅ Containers iniciados!$(NC)"
	@echo "$(YELLOW)→ PostgreSQL: localhost:5435$(NC)"
	@echo "$(YELLOW)→ pgAdmin: http://localhost:5050$(NC)"

docker-down: ## Para containers
	@echo "$(YELLOW)🛑 Parando containers...$(NC)"
	@docker compose down
	@echo "$(GREEN)✅ Containers parados!$(NC)"

docker-logs: ## Mostra logs dos containers
	@docker compose logs -f

docker-restart: ## Reinicia containers
	@docker compose restart

docker-ps: ## Lista containers
	@docker compose ps

# ============================================
# 🧪 Qualidade de Código
# ============================================

lint: ## Roda lint
	@yarn lint

lint-fix: ## Roda lint com auto-fix
	@yarn lint:fix

format: ## Formata código com Prettier
	@echo "$(BLUE)✨ Formatando código...$(NC)"
	@yarn format
	@echo "$(GREEN)✅ Código formatado!$(NC)"

format-check: ## Verifica formatação
	@yarn format:check

type-check: ## Verifica tipos TypeScript
	@echo "$(BLUE)🔍 Verificando tipos...$(NC)"
	@yarn type-check

validate: type-check lint format-check ## Valida tudo (tipos + lint + format)
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)✅ Tudo validado com sucesso!$(NC)"
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

# ============================================
# 🛠️ Utilitários
# ============================================

scrape: ## Roda scraper da Sapienza
	@echo "$(BLUE)🕷️  Rodando scraper...$(NC)"
	@yarn scrape
	@echo "$(GREEN)✅ Scraping finalizado!$(NC)"
	@echo "$(YELLOW)→ Dados salvos em data/sapienza-medicina.json$(NC)"

psql: ## Conecta ao PostgreSQL via psql
	@docker exec -it dottorio-db psql -U dottorio -d dottorio

# ============================================
# 📊 Informações
# ============================================

info: ## Mostra info do ambiente
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  📊 Informações do Ambiente$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)Node:$(NC)        $$(node --version)"
	@echo "$(GREEN)Yarn:$(NC)        $$(yarn --version)"
	@echo "$(GREEN)Next.js:$(NC)     $$(node -p "require('./package.json').dependencies.next")"
	@echo "$(GREEN)Docker:$(NC)      $$(docker --version | cut -d' ' -f3 | tr -d ',')"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)🔗 URLs:$(NC)"
	@echo "  App:        $(BLUE)http://localhost:3000$(NC)"
	@echo "  Studio:     $(BLUE)http://localhost:5555$(NC)"
	@echo "  pgAdmin:    $(BLUE)http://localhost:5050$(NC)"
	@echo ""
