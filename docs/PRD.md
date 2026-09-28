# V.I.G.I.A — PRD (Resumo para o Agente)

Plataforma OSINT open-source, 100% self-hosted: dossiês de pessoas físicas,
grupos, enriquecimento via APIs públicas e grafo de relações/genealogia.

## Stack
Next.js 16 (App Router) · TypeScript · TailwindCSS v4 · Shadcn/UI ·
Motion.dev · Prisma 7 + PostgreSQL 18 · Better Auth · @xyflow/react ·
Leaflet · Recharts · @dnd-kit · BullMQ + Redis

## ⚠️ Notas de Infra (já resolvidas, NÃO re-introduzir)
- Postgres 18+: volume Docker em `/var/lib/postgresql` (NÃO em /data)
- Prisma 7: NADA de `url` no datasource do schema. URL fica em
  `prisma.config.ts` (CLI/migrate) e via `PrismaPg` adapter em `lib/prisma.ts`
- Client gerado em `generated/prisma` (import "@/generated/prisma/client")
- Auto-relações (father/mother) precisam dos campos inversos
  (childrenAsFather/childrenAsMother)
- npm 12: scripts de pacotes precisam de `npm install-scripts approve`

## Design (INEGOCIÁVEL)
- Temas: BLACK OLED (#000000) e WHITE OLED (#FFFFFF)
- Cor primária: Gradiente Instagram
  (#405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d, #f56040, #f77737, #fcaf45, #ffdc80)
  → utilities prontas: bg-ig-gradient, text-ig-gradient, glass, glow-ig
- Glassmorphism + rounded-2xl/3xl + Glow + Blur
- Motion.dev: springs (stiffness 200, damping 15), smooth scroll, layout animations

## Layouts (fiéis ao A.E.G.I.S original)
### /dashboard
Widgets ARRASTÁVEIS (dnd-kit + spring): Hora do Sistema, Tempo de Sessão,
Dados da Sessão (IP/provedor/cidade/plataforma), Total de Pessoas,
Total de Grupos, Distribuição por Idade, Distribuição por Gênero,
Fluxo de Dados (30 dias), Distribuição Geográfica, Grafo Global.

### /tree
Accordion de grupos → person-cards: Foto, Nome, Idade, Gênero, Nascimento,
Barra de Progresso, ícones de Redes Sociais, botão "VER DADOS". Busca em tempo real.

### /entity/[id]
Split view:
- ESQUERDA (person-profile): foto, nome, idade+signo, gênero, profissão,
  redes sociais, observações, "Pessoas em Comum" (miniaturas clicáveis:
  pai, mãe, irmãos, amigos)
- DIREITA (info-view): abas Informações | Galeria | NOTAS
  - NOTAS: canvas infinito de widgets (texto, checklist, mini-mapa,
    link preview, code/JSON, cofre, imagem), posição em JSONB

## Features
- Grafo genealógico (@xyflow/react): pai, mãe, filho, irmão, cônjuge, avô,
  amigo, sócio — arestas rotuladas e coloridas
- Enriquecimento OSINT SÓ APIs limpas (ViaCEP, BrasilAPI, IPinfo, Nominatim,
  HIBP). PROIBIDO scraping de redes sociais.
- Redes: instagram, facebook, x, threads, youtube, tiktok, twitch, linkedin,
  reddit, discord, whatsapp, telegram, pinterest, github, roblox, spotify,
  playstation, xbox, steam ou website
- Extras: PIX, contas bancárias, cartões, RENAVAM, CIN, escolaridade,
  filiação, credenciais
- Command Palette (Cmd+K)

## Segurança
- Better Auth: senha (argon2id) + 2FA TOTP OPCIONAL + passkeys (opcional)
- AES-256-GCM (lib/encryption.ts) para dados sensíveis
- Burner Mode (expiresAt + hard delete via BullMQ)
- Panic Button: Ctrl+Shift+Esc
- AuditLog imutável

## Banco
Schema: prisma/schema.prisma · Views: prisma/views.sql (já aplicadas).
