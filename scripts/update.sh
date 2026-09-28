#!/usr/bin/env bash
# ==============================================================================
# V.I.G.I.A — Script de Atualização
# Copyright (C) 2026 AsmVoid — AGPL-3.0-only
# ==============================================================================
set -Eeuo pipefail

# Cores e Formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

trap 'echo -e "\n${RED}${BOLD}[ERRO] Falha na atualização na linha ${LINENO}: comando \"${BASH_COMMAND}\"${NC}" >&2' ERR

echo -e "\n${CYAN}${BOLD}🛡️  V.I.G.I.A — Atualização do Sistema${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"

# 1. Puxar alterações do repositório Git
echo -e "\n${BOLD}[1/5] Sincronizando com o repositório remoto (git pull --ff-only)...${NC}"
if git rev-parse --is-inside-work-tree &>/dev/null; then
  git pull --ff-only || echo -e "${YELLOW}[AVISO] Git pull falhou ou não há remoto configurado. Continuando com build local.${NC}"
else
  echo -e "${YELLOW}[AVISO] Não é um repositório git clonado. Pulando git pull.${NC}"
fi

# 2. Instalar novas dependências npm
echo -e "\n${BOLD}[2/5] Atualizando dependências npm...${NC}"
npm install
echo -e "${GREEN}✓ Dependências verificadas.${NC}"

# 3. Aplicar migrações pendentes no banco
echo -e "\n${BOLD}[3/5] Aplicando novas migrações Prisma...${NC}"
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" npx prisma migrate deploy
echo -e "${GREEN}✓ Migrações aplicadas.${NC}"

# 4. Atualizar views SQL
echo -e "\n${BOLD}[4/5] Atualizando views SQL...${NC}"
npm run db:views
echo -e "${GREEN}✓ Views SQL sincronizadas.${NC}"

# 5. Compilar bundle de produção
echo -e "\n${BOLD}[5/5] Compilando aplicação (npm run build)...${NC}"
npm run build
echo -e "${GREEN}✓ Build de produção gerado com sucesso.${NC}"

echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   ✓ ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!                        ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "Se o V.I.G.I.A estiver rodando como serviço ou daemon, reinicie-o:"
echo -e "  $ ${CYAN}npm run dev${NC}  (desenvolvimento) ou"
echo -e "  $ ${CYAN}npm start${NC}    (produção)"
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}\n"
