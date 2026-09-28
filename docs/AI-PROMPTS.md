# Roteiro de Prompts para o Agente de IA

> Cole o PROMPT 0 primeiro. Depois as tasks em ordem, testando com
> `npm run dev` antes de avançar.

## PROMPT 0 — Contexto
Você é o dev principal do V.I.G.I.A, plataforma OSINT self-hosted.
Leia docs/PRD.md e prisma/schema.prisma antes de escrever código.
Regras: temas BLACK/WHITE OLED, gradiente Instagram como cor primária,
glassmorphism + rounded-3xl + glow, Motion.dev em todas as interações,
PROIBIDO scraping de redes sociais, TypeScript rigoroso.
Confirme que entendeu e aguarde as tasks.

## TASK 1 — Auth
Better Auth em app/api/auth + /login e /register. Card glass, botão
bg-ig-gradient. 2FA TOTP opcional. Middleware protegendo rotas.

## TASK 2 — Layout + Dashboard
Sidebar (Painel, Árvore de Dados, Grupos, Nova Pessoa, Logs, Config) +
header com relógio/avatar. Dashboard com widgets do PRD (Recharts),
arrastáveis (dnd-kit + spring). Views SQL via $queryRaw.

## TASK 3 — Árvore de Dados + CRUD
/tree: accordion de grupos, person-cards (foto, nome, idade, gênero,
nascimento, progresso, sociais, VER DADOS). Busca em tempo real.
Server Actions para CRUD.

## TASK 4 — Dossiê
/entity/[id]: person-profile (ESQ) + info-view abas Informações | Galeria |
NOTAS. Upload drag-and-drop em app/api/upload. Canvas de NOTAS com
widgets dnd-kit salvos em Note (JSONB).

## TASK 5 — Grafo + OSINT + Polimento
Grafo genealógico (@xyflow/react) via Relationship. Conectores OSINT
(ViaCEP, BrasilAPI CNPJ, IPinfo, Nominatim) em lib/osint + BullMQ.
Command Palette, toggle de tema, Panic Button, Burner Mode.
