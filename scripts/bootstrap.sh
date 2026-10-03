#!/usr/bin/env bash
# ==============================================================================
# V.I.G.I.A — Setup & Bootstrap Idempotente Pós-Clone
# Copyright (C) 2026 AsmVoid — AGPL-3.0-only
# ==============================================================================
set -Eeuo pipefail

# Cores e Formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Tratamento de erro com linha
trap 'echo -e "\n${RED}${BOLD}[ERRO] Falha na linha ${LINENO}: comando \"${BASH_COMMAND}\" retornou código $?${NC}" >&2' ERR

echo -e "\n${CYAN}${BOLD}🛡️  V.I.G.I.A — Bootstrap Automatizado${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"

WITH_SEED=false
for arg in "$@"; do
  case "$arg" in
    --with-seed)
      WITH_SEED=true
      shift
      ;;
    -h|--help)
      echo -e "Uso: $0 [OPÇÕES]"
      echo -e "Opções:"
      echo -e "  --with-seed    Popula o banco de dados com dados de teste"
      echo -e "  -h, --help     Exibe esta ajuda"
      exit 0
      ;;
  esac
done

# 1. Verificar Docker e Docker Compose
echo -e "\n${BOLD}[1/6] Verificando Docker e Docker Compose...${NC}"
if ! command -v docker &>/dev/null; then
  echo -e "${RED}[ERRO] Docker não está instalado.${NC}"
  echo -e "Por favor, instale o Docker (>= 24.0.0): https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo -e "${RED}[ERRO] O daemon do Docker não está em execução ou o usuário não tem permissão.${NC}"
  echo -e "Inicie o daemon do Docker (ex: 'sudo systemctl start docker') e certifique-se de estar no grupo 'docker'."
  exit 1
fi

if ! docker compose version &>/dev/null; then
  echo -e "${RED}[ERRO] Docker Compose v2 não foi encontrado.${NC}"
  echo -e "Instale o plugin docker-compose: https://docs.docker.com/compose/install/"
  exit 1
fi
echo -e "${GREEN}✓ Docker e Docker Compose operacionais.${NC}"

# 2. Configurar variáveis de ambiente (.env)
echo -e "\n${BOLD}[2/6] Verificando arquivo de ambiente (.env)...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado a partir de .env.example.${NC}"
  else
    echo -e "${RED}[ERRO] Arquivo .env.example não encontrado!${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ Arquivo .env existente detectado.${NC}"
fi

# Gerar chaves se vazias ou com placeholders
if grep -q "BETTER_AUTH_SECRET=.*gere-com-openssl" .env || grep -q 'BETTER_AUTH_SECRET=""' .env || grep -q 'BETTER_AUTH_SECRET=$' .env || ! grep -q 'BETTER_AUTH_SECRET=' .env; then
  AUTH_SECRET=$(openssl rand -base64 32)
  if grep -q 'BETTER_AUTH_SECRET=' .env; then
    sed -i "s#BETTER_AUTH_SECRET=.*#BETTER_AUTH_SECRET=\"${AUTH_SECRET}\"#g" .env
  else
    echo "BETTER_AUTH_SECRET=\"${AUTH_SECRET}\"" >> .env
  fi
  echo -e "${GREEN}✓ BETTER_AUTH_SECRET gerado com OpenSSL (base64).${NC}"
fi

if grep -q "ENCRYPTION_KEY=.*gere-com-openssl" .env || grep -q 'ENCRYPTION_KEY=""' .env || grep -q 'ENCRYPTION_KEY=$' .env || ! grep -q 'ENCRYPTION_KEY=' .env; then
  ENC_KEY=$(openssl rand -hex 32)
  if grep -q 'ENCRYPTION_KEY=' .env; then
    sed -i "s#ENCRYPTION_KEY=.*#ENCRYPTION_KEY=\"${ENC_KEY}\"#g" .env
  else
    echo "ENCRYPTION_KEY=\"${ENC_KEY}\"" >> .env
  fi
  echo -e "${GREEN}✓ ENCRYPTION_KEY gerada com OpenSSL (hex 256 bits).${NC}"
fi

# 3. Subir contêineres do Docker
echo -e "\n${BOLD}[3/6] Inicializando serviços (PostgreSQL 18 + Redis 8)...${NC}"
docker compose up -d --wait --wait-timeout 180
echo -e "${GREEN}✓ Contêineres iniciados e saudáveis.${NC}"

# 4. Instalar dependências npm (se necessário)
echo -e "\n${BOLD}[4/6] Verificando dependências do projeto (npm install)...${NC}"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/prisma" ]; then
  echo -e "Instalando dependências via npm..."
  npm install
  echo -e "${GREEN}✓ Dependências instaladas com sucesso.${NC}"
else
  echo -e "${GREEN}✓ Dependências já instaladas em node_modules.${NC}"
fi

# 5. Migrations, Views e Prisma Client
echo -e "\n${BOLD}[5/6] Aplicando migrações e gerando Prisma Client...${NC}"
export PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes"

PRISMA_BIN="./node_modules/.bin/prisma"
if [ -f "$PRISMA_BIN" ]; then
  "$PRISMA_BIN" migrate deploy
else
  npx prisma migrate deploy
fi
echo -e "${GREEN}✓ Migrações aplicadas com sucesso.${NC}"

if [ -f prisma/views.sql ]; then
  docker compose exec -T db psql -U vigia -d vigia_db < prisma/views.sql >/dev/null 2>&1 || true
  echo -e "${GREEN}✓ Views SQL analíticas atualizadas.${NC}"
fi

if [ -f "$PRISMA_BIN" ]; then
  "$PRISMA_BIN" generate --no-hints
else
  npx prisma generate --no-hints
fi
echo -e "${GREEN}✓ Prisma Client gerado em generated/prisma.${NC}"

# Seed opcional
if [ "$WITH_SEED" = true ]; then
  echo -e "\n${CYAN}[SEED] Populando banco com dados de demonstração...${NC}"
  if [ -f "$PRISMA_BIN" ]; then
    "$PRISMA_BIN" db seed
  else
    npx prisma db seed
  fi
  echo -e "${GREEN}✓ Dados de demonstração inseridos com sucesso.${NC}"
fi

# 6. Resumo e Próximos Passos
echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   🛡️  V.I.G.I.A PRONTO PARA USO!                              ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "  ${BOLD}Para iniciar o servidor de desenvolvimento:${NC}"
echo -e "  $ ${CYAN}npm run dev${NC}"
echo -e ""
echo -e "  ${BOLD}URL do Sistema:${NC} ${CYAN}http://localhost:3000${NC}"
echo -e "  ${BOLD}Primeiro Acesso:${NC} Acesse ${CYAN}http://localhost:3000/register${NC} para criar sua conta."
echo -e "  ${YELLOW}(Não há usuário padrão pré-configurado por motivos de segurança.)${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}\n"
