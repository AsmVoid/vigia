#!/usr/bin/env bash
# ==============================================================================
# V.I.G.I.A — Factory Reset (Zerar Banco, Sessões e Uploads)
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

trap 'echo -e "\n${RED}${BOLD}[ERRO] Falha na execução na linha ${LINENO}: comando \"${BASH_COMMAND}\"${NC}" >&2' ERR

CONFIRMED=false
for arg in "$@"; do
  case "$arg" in
    -y|--yes)
      CONFIRMED=true
      shift
      ;;
    -h|--help)
      echo -e "Uso: $0 [OPÇÕES]"
      echo -e "Opções:"
      echo -e "  -y, --yes    Executa sem solicitar confirmação interativa"
      echo -e "  -h, --help   Exibe esta ajuda"
      exit 0
      ;;
  esac
done

echo -e "\n${RED}${BOLD}⚠️  ATENÇÃO: FACTORY RESET DO V.I.G.I.A ⚠️${NC}"
echo -e "${YELLOW}Esta operação irá APAGAR PERMANENTEMENTE:${NC}"
echo -e "  1. Todos os registros do banco de dados (usuários, pessoas, dossiês, logs, notas);"
echo -e "  2. Todos os arquivos de upload de fotos e mídias em public/uploads/people/;"
echo -e "  3. Todas as filas e chaves em cache no Redis (sessões e jobs BullMQ)."
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"

if [ "$CONFIRMED" = false ]; then
  read -rp "$(echo -e "${RED}${BOLD}Deseja realmente continuar? (digite 'sim' para confirmar): ${NC}")" resposta
  if [ "$resposta" != "sim" ]; then
    echo -e "${CYAN}Operação cancelada pelo usuário.${NC}\n"
    exit 0
  fi
fi

# 1. Limpeza de uploads
echo -e "\n${BOLD}[1/4] Removendo arquivos de uploads...${NC}"
rm -rf public/uploads/people/*
touch public/uploads/people/.gitkeep
echo -e "${GREEN}✓ public/uploads/people/ limpo (apenas .gitkeep preservado).${NC}"

# 2. Reset do banco de dados via Prisma Migrate
echo -e "\n${BOLD}[2/4] Resetando banco de dados PostgreSQL...${NC}"
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="yes" PRISMA_SEED=false npx prisma migrate reset --force
npm run db:views
echo -e "${GREEN}✓ Banco de dados recriado e views SQL reaplicadas com sucesso.${NC}"

# 3. Limpeza do Redis
echo -e "\n${BOLD}[3/4] Limpando dados do Redis...${NC}"
docker compose exec -T redis redis-cli FLUSHALL
echo -e "${GREEN}✓ Redis FLUSHALL executado.${NC}"

# 4. Verificação de integridade
echo -e "\n${BOLD}[4/4] Verificando integridade do banco de dados...${NC}"
COUNTS=$(docker compose exec -T db psql -U vigia -d vigia_db -tAc 'SELECT (SELECT COUNT(*) FROM "Entity"), (SELECT COUNT(*) FROM "User");' 2>/dev/null || echo "erro")

if [ "$COUNTS" = "0|0" ]; then
  echo -e "${GREEN}✓ Verificação confirmada: 0 Entidades | 0 Usuários.${NC}"
else
  echo -e "${YELLOW}[AVISO] Verificação retornou: ${COUNTS}${NC}"
fi

echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   🛡️  FACTORY RESET CONCLUÍDO COM SUCESSO!                   ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}${BOLD}LEMBRETE IMPORTANTE:${NC}"
echo -e "Limpe os cookies e o ${CYAN}localStorage${NC} de ${BOLD}http://localhost:3000${NC} no seu navegador"
echo -e "(ou use uma janela anônima) para remover tokens de sessão e layouts antigos em cache."
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}\n"
