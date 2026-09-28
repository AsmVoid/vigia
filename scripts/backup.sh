#!/usr/bin/env bash
# ==============================================================================
# V.I.G.I.A — Backup de Banco de Dados, Uploads e Esquema
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

trap 'echo -e "\n${RED}${BOLD}[ERRO] Falha na criação do backup na linha ${LINENO}: comando \"${BASH_COMMAND}\"${NC}" >&2' ERR

INCLUDE_ENV=false
for arg in "$@"; do
  case "$arg" in
    --include-env)
      INCLUDE_ENV=true
      shift
      ;;
    -h|--help)
      echo -e "Uso: $0 [OPÇÕES]"
      echo -e "Opções:"
      echo -e "  --include-env    Inclui o arquivo .env no backup (ATENÇÃO: contém credenciais secretas)"
      echo -e "  -h, --help       Exibe esta ajuda"
      exit 0
      ;;
  esac
done

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backups/vigia-${TIMESTAMP}"

echo -e "\n${CYAN}${BOLD}🛡️  V.I.G.I.A — Gerando Backup do Sistema${NC}"
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}"
echo -e "Destino: ${BOLD}${BACKUP_DIR}${NC}"

mkdir -p "${BACKUP_DIR}"

# 1. Dump do banco de dados PostgreSQL (formato Custom/comprimido pg_dump -Fc)
echo -e "\n${BOLD}[1/4] Realizando dump do PostgreSQL...${NC}"
docker compose exec -T db pg_dump -U vigia -d vigia_db -Fc > "${BACKUP_DIR}/database.dump"
echo -e "${GREEN}✓ Dump do banco salvo em ${BACKUP_DIR}/database.dump ($(du -h "${BACKUP_DIR}/database.dump" | cut -f1))${NC}"

# 2. Compactação dos arquivos de uploads
echo -e "\n${BOLD}[2/4] Compactando arquivos de uploads...${NC}"
tar -czf "${BACKUP_DIR}/uploads.tar.gz" -C public uploads
echo -e "${GREEN}✓ Uploads compactados em ${BACKUP_DIR}/uploads.tar.gz ($(du -h "${BACKUP_DIR}/uploads.tar.gz" | cut -f1))${NC}"

# 3. Cópia do schema Prisma
echo -e "\n${BOLD}[3/4] Copiando schema Prisma...${NC}"
cp prisma/schema.prisma "${BACKUP_DIR}/schema.prisma"
echo -e "${GREEN}✓ prisma/schema.prisma copiado com sucesso.${NC}"

# 4. Arquivo .env (opcional)
if [ "$INCLUDE_ENV" = true ]; then
  echo -e "\n${YELLOW}${BOLD}[4/4] Copiando .env (--include-env ativado)...${NC}"
  if [ -f .env ]; then
    cp .env "${BACKUP_DIR}/.env.backup"
    echo -e "${YELLOW}⚠️  ATENÇÃO: O arquivo .env contém chaves mestras e segredos! Guarde este backup em local seguro e cifrado.${NC}"
  else
    echo -e "${RED}[AVISO] Arquivo .env não encontrado para backup.${NC}"
  fi
else
  echo -e "\n${BOLD}[4/4] Ignorando .env por segurança (use --include-env se desejar incluir).${NC}"
fi

# Metadados do backup
cat <<EOF > "${BACKUP_DIR}/metadata.json"
{
  "timestamp": "${TIMESTAMP}",
  "version": "1.0.0",
  "database": "vigia_db",
  "engine": "PostgreSQL 18.6",
  "includeEnv": ${INCLUDE_ENV}
}
EOF

echo -e "\n${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   ✓ BACKUP CONCLUÍDO COM SUCESSO!                             ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════════════${NC}"
echo -e "Arquivos gerados em ${BOLD}${BACKUP_DIR}/${NC}:"
ls -lh "${BACKUP_DIR}"
echo -e "${BLUE}────────────────────────────────────────────────────────────────${NC}\n"
