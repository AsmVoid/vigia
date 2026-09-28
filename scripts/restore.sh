#!/usr/bin/env bash
# ==============================================================================
# V.I.G.I.A — Restauração de Backup (Banco de Dados e Uploads)
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

trap 'echo -e "\n${RED}${BOLD}[ERRO] Falha na restauração do backup na linha ${LINENO}: comando \"${BASH_COMMAND}\"${NC}" >&2' ERR

CONFIRMED=false
BACKUP_TARGET=""

while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes)
      CONFIRMED=true
      shift
      ;;
    -h|--help)
      echo -e "Uso: $0 [OPÇÕES] <DIRETÓRIO_DO_BACKUP>"
      echo -e "Exemplo: $0 backups/vigia-20260928-120000"
      echo -e "Opções:"
      echo -e "  -y, --yes    Restaura sem confirmação interativa"
      echo -e "  -h, --help   Exibe esta ajuda"
      exit 0
      ;;
    *)
      BACKUP_TARGET="$1"
      shift
      ;;
  esac
done

if [ -z "$BACKUP_TARGET" ]; then
  # Se não especificado, lista backups disponíveis
  echo -e "\n${RED}[ERRO] Nenhum diretório de backup especificado!${NC}"
  echo -e "\nBackups encontrados em ./backups/:"
  if [ -d backups ]; then
    ls -dt backups/vigia-* 2>/dev/null || echo "Nenhum backup encontrado."
  fi
  echo -e "\nUso: $0 <caminho_do_backup>"
  exit 1
fi

if [ ! -d "$BACKUP_TARGET" ]; then
  echo -e "${RED}[ERRO] Diretório \"$BACKUP_TARGET\" não encontrado!${NC}"
  exit 1
fi

DUMP_FILE="${BACKUP_TARGET}/database.dump"
UPLOADS_TAR="${BACKUP_TARGET}/uploads.tar.gz"

if [ ! -f "$DUMP_FILE" ]; then
  echo -e "${RED}[ERRO] Arquivo de dump \"$DUMP_FILE\" não encontrado!${NC}"
  exit 1
fi

echo -e "\n${YELLOW}${BOLD}⚠️  ATENÇÃO: RESTAURAÇÃO DE BACKUP DO V.I.G.I.A ⚠️${NC}"
echo -e "Backup de origem: ${BOLD}${BACKUP_TARGET}${NC}"
echo -e "O banco de dados atual será substituído pelo conteúdo do backup."
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"

if [ "$CONFIRMED" = false ]; then
  read -rp "$(echo -e "${RED}${BOLD}Deseja realmente restaurar este backup? (digite 'sim' para continuar): ${NC}")" resposta
  if [ "$resposta" != "sim" ]; then
    echo -e "${CYAN}Operação cancelada pelo usuário.${NC}\n"
    exit 0
  fi
fi

# 1. Restaurar banco de dados PostgreSQL
echo -e "\n${BOLD}[1/3] Restaurando dump no PostgreSQL...${NC}"
docker compose exec -T db pg_restore -U vigia -d vigia_db --clean --if-exists --no-owner --no-privileges < "$DUMP_FILE" || true
echo -e "${GREEN}✓ Dump restaurado com sucesso.${NC}"

# Re-aplicar views estatísticas para garantir consistência
npm run db:views 2>/dev/null || true

# 2. Restaurar uploads
if [ -f "$UPLOADS_TAR" ]; then
  echo -e "\n${BOLD}[2/3] Restaurando arquivos de uploads...${NC}"
  tar -xzf "$UPLOADS_TAR" -C public/
  touch public/uploads/people/.gitkeep
  echo -e "${GREEN}✓ Uploads restaurados com sucesso em public/uploads/.${NC}"
else
  echo -e "\n${YELLOW}[2/3] uploads.tar.gz não encontrado neste backup. Pulando.${NC}"
fi

# 3. Limpeza do cache do Redis
echo -e "\n${BOLD}[3/3] Limpando cache antigo no Redis...${NC}"
docker compose exec -T redis redis-cli FLUSHALL
echo -e "${GREEN}✓ Redis limpo para evitar sessões em conflito.${NC}"

echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   ✓ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!                        ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "Recomenda-se reiniciar o servidor Next.js caso esteja em execução."
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}\n"
