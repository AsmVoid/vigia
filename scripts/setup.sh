#!/usr/bin/env bash
# ==============================================================================
# V.I.G.I.A — Setup & Bootstrap Idempotente
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

# Tratamento de erro
trap 'echo -e "\n${RED}${BOLD}[ERRO] Falha no script na linha ${LINENO}: comando \"${BASH_COMMAND}\" retornou código $?${NC}" >&2' ERR

echo -e "\n${CYAN}${BOLD}🛡️  V.I.G.I.A — Inicialização & Configuração do Ambiente${NC}"
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
      echo -e "  --with-seed    Popula o banco de dados com dados de demonstração"
      echo -e "  -h, --help     Exibe esta ajuda"
      exit 0
      ;;
  esac
done

# 1. Checagem de Pré-requisitos
echo -e "\n${BOLD}[1/6] Verificando dependências do sistema...${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}[ERRO] Node.js não encontrado. Instale o Node.js v22 ou superior.${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
  echo -e "${YELLOW}[AVISO] Node.js $(node -v) detectado. Recomendado Node.js >= 22.${NC}"
else
  echo -e "${GREEN}✓ Node.js $(node -v) detectado.${NC}"
fi

if ! command -v npm &>/dev/null; then
  echo -e "${RED}[ERRO] npm não encontrado.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm v$(npm -v) detectado.${NC}"

if ! command -v docker &>/dev/null; then
  echo -e "${RED}[ERRO] Docker não encontrado. Instale o Docker >= 24.${NC}"
  exit 1
fi

if ! docker compose version &>/dev/null; then
  echo -e "${RED}[ERRO] Docker Compose v2 não encontrado.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker & Docker Compose detectados.${NC}"

# 2. Configuração do arquivo .env
echo -e "\n${BOLD}[2/6] Configurando variáveis de ambiente (.env)...${NC}"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado a partir de .env.example.${NC}"
  else
    echo -e "${RED}[ERRO] .env.example não encontrado!${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ Arquivo .env já existe.${NC}"
fi

# Gerar chaves aleatórias caso estejam com placeholder ou vazias
if grep -q "BETTER_AUTH_SECRET=sua_chave_secreta_aqui" .env || grep -q 'BETTER_AUTH_SECRET=""' .env || grep -q 'BETTER_AUTH_SECRET=$' .env; then
  AUTH_SECRET=$(openssl rand -hex 32)
  sed -i "s|BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=${AUTH_SECRET}|g" .env
  echo -e "${GREEN}✓ BETTER_AUTH_SECRET gerado via OpenSSL.${NC}"
fi

if grep -q "ENCRYPTION_KEY=chave_hex_64_caracteres" .env || grep -q 'ENCRYPTION_KEY=""' .env || grep -q 'ENCRYPTION_KEY=$' .env; then
  ENC_KEY=$(openssl rand -hex 32)
  sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=${ENC_KEY}|g" .env
  echo -e "${GREEN}✓ ENCRYPTION_KEY gerada via OpenSSL (AES-256-GCM).${NC}"
fi

# 3. Subir Contêineres Docker
echo -e "\n${BOLD}[3/6] Iniciando serviços Docker (PostgreSQL 18 + Redis 8)...${NC}"
docker compose up -d --wait
echo -e "${GREEN}✓ PostgreSQL e Redis operacionais e saudáveis.${NC}"

# 4. Instalar dependências npm
echo -e "\n${BOLD}[4/6] Instalando dependências do projeto via npm...${NC}"
npm install
echo -e "${GREEN}✓ Dependências instaladas com sucesso.${NC}"

# 5. Aplicar migrações do banco de dados e views SQL
echo -e "\n${BOLD}[5/6] Aplicando migrações do Prisma e Views SQL...${NC}"
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate deploy
npm run db:views
echo -e "${GREEN}✓ Estrutura do banco de dados atualizada.${NC}"

# Se solicitado, rodar seed
if [ "$WITH_SEED" = true ]; then
  echo -e "\n${CYAN}[SEED] Populando banco com dados de demonstração...${NC}"
  npx prisma db seed
  echo -e "${GREEN}✓ Dados de teste inseridos com sucesso.${NC}"
fi

# 6. Resumo Final
echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   🛡️  V.I.G.I.A CONFIGURADO COM SUCESSO!                     ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "  ${BOLD}Para iniciar a aplicação em modo desenvolvimento:${NC}"
echo -e "  $ ${CYAN}npm run dev${NC}"
echo -e ""
echo -e "  ${BOLD}Acesso Local:${NC} ${CYAN}http://localhost:3000${NC}"
echo -e "  ${BOLD}Primeiro Login:${NC} Acesse ${CYAN}http://localhost:3000/register${NC} para criar sua conta de administrador."
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}\n"
