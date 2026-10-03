# Registro de Alterações (Changelog) — V.I.G.I.A

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-10-03

### 🚀 Lançamento Inicial Definitivo (Release v1.0.0)

Primeira versão pública estável e definitiva da plataforma **V.I.G.I.A** (*Vigilância Integrada e Gestão de Informações Analíticas*), sucessora moderna da linhagem A.E.G.I.S (2024), totalmente desenvolvida em Next.js 16, TypeScript, PostgreSQL 18, Redis 8 e TailwindCSS v4.

#### ✨ Principais Módulos & Recursos Implementados:
- **Autenticação Avançada & Isolamento Multi-Tenant**:
  - Sistema de contas via Better Auth com sessões persistentes e isolamento estrito de dados por usuário (`userId` em entidades, grupos e logs de atividade).
  - Segundo Fator de Autenticação (**2FA TOTP**) nativo com geração de QR Code dinâmico e suporte a códigos de backup de emergência.
  - Proteção de rotas em middleware unificado (`proxy.ts`).
  - Redirecionamento automático pós-cadastro direto para o `/dashboard`.

- **Dashboard Analítico Modular**:
  - 10 widgets interativos com ordenação livre via Drag-and-Drop (`@dnd-kit`).
  - Indicador Gauge de Risco Médio das pessoas investigadas.
  - Gráfico de Rosca de Distribuição por Organizações/Facções.
  - Gráfico de Barras com Série Temporal de Cadastros dos últimos 30 dias.
  - Modo Sigilo (*Privacy Eye*) com ocultação instantânea de números sensíveis na interface.
  - Persistência e restauração do layout no navegador do operador.

- **Árvore de Dados & Organizações (`/tree`)**:
  - Agrupamento visual das entidades por facções e empresas com código de cores personalizável.
  - Cards detalhados com foto, vulgo, cargo, cidade e barra percentual de completude cadastral.
  - Mapeamento e atalhos diretos para 20 redes sociais e mensageiros.

- **Dossiê Unificado & CRUD Completo de Pessoas**:
  - Formulário especializado dividido em 11 seções temáticas (identificação, documentos, contatos, endereços, veículos c/ RENAVAM, empregos, escolaridade, finanças e genealogia).
  - Três abas de visualização detalhada: Informações Gerais, Dados Financeiros & Segredos e Linha do Tempo.
  - Mapa interativo Leaflet com camada CartoDB Dark embutido no endereço principal.
  - Criptografia em repouso (`AES-256-GCM`) para chaves PIX, cartões de crédito e carteiras de criptomoedas com botão de revelação pontual.

- **Grafo Genealógico & Sociométrico Interativo (`/entity/[id]/graph`)**:
  - Canvas construído com React Flow (`@xyflow/react`) com nós e conexões estilizados.
  - Algoritmos de auto-layout hierárquico vertical (TB), horizontal (LR) e radial/concêntrico via Dagre.
  - Criação rápida de relacionamentos arrastando conectores entre nós (*Drag-to-Connect*).
  - Vínculos categorizados por cor (Afetivo/Amoroso, Família, Profissional, Social, Investigativo/Alerta).
  - Persistência das coordenadas de arrasto no `localStorage` por entidade com recarga suave.
  - Exportação direta do grafo em formato PNG de alta resolução.
  - Modo tela cheia (*Fullscreen*) imersivo.

- **Galeria de Mídias & Evidências (`/gallery`)**:
  - Layout em alvenaria (*masonry*) com suporte a fotos (até 25 MB) e vídeos (até 100 MB).
  - Lightbox interativo com zoom, visualizador de metadados e navegação por teclado.
  - Player embutido para reprodução nativa de vídeos MP4 e WEBM.

- **Canvas Livre de Anotações & Hipóteses (`/notes`)**:
  - Quadro de investigação com 7 tipos de cartões: Notas Rápidas, Hipóteses, Checklists de Diligências, Alertas Críticos, Mídias Anexadas, Lembretes e Cofre Confidencial protegido por senha própria.

- **Enriquecimento OSINT Automatizado**:
  - Conectores nativos para ViaCEP (autocompletar endereço), BrasilAPI (dados cadastrais de CNPJ) e OpenStreetMap Nominatim (geocodificação reversa).

- **Excelência Visual & UI Motion Pass**:
  - Fundo dinâmico com Shader WebGL de alta fidelidade e gradiente VIGIA.
  - Temas **BLACK OLED** (preto `#000000` absoluto) e **WHITE OLED** com suporte a alternância em tempo real.
  - Microinterações e animações de transição suaves alimentadas por `motion/react`.

- **Automação Operacional & Scripts**:
  - `scripts/bootstrap.sh`: Inicialização rápida *one-command* com instalação automática de dependências, geração de chaves via OpenSSL, subida de contêineres Docker, migrações e Prisma Client com `--no-hints`.
  - `scripts/setup.sh`: Assistente detalhado de setup e verificação de pré-requisitos.
  - `scripts/reset.sh`: Factory reset com limpeza de banco, uploads e Redis.
  - `scripts/backup.sh` & `scripts/restore.sh`: Rotinas automatizadas de dump e restauração compactada.
  - `scripts/update.sh`: Script de atualização automatizada via Git.

#### 🐛 Correções & Estabilização da Versão Definitiva:
- **Portabilidade pós-clone**:
  - Criação de `scripts/bootstrap.sh` para configuração imediata do projeto a partir de um clone limpo.
  - Adição de `postinstall: "prisma generate --no-hints || true"` no `package.json`, garantindo a existência do cliente Prisma logo após o `npm install`.
  - Correção no Better Auth (`additionalFields`): mapeamento de `username` no sign-up resolvendo o erro 422.
  - Criação da migração relacional `20260927020000_add_multitenant_user_id` adicionando as colunas `userId` em `Group`, `Entity` e `ActivityLog`.
  - Resolução de distorção de fuso horário (UTC vs UTC-3) na exibição de datas de nascimento e contagem de aniversário via utilitário `lib/date-utils.ts`.
  - Definição do nome do projeto no `docker-compose.yml` (`name: vigia`) para evitar conflito de contêineres entre diretórios clonados distintos.
  - Supressão de prompts interativos na compilação do Prisma Client (`--no-hints`).
  - Higienização da documentação pública, removendo notas internas de engenharia e arquivos desnecessários.
