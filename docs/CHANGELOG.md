# Registro de Alterações (Changelog) — V.I.G.I.A

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-09-28

### 🚀 Lançamento Inicial (Release v1.0.0)

Primeira versão pública estável da plataforma **V.I.G.I.A** (*Vigilância Integrada e Gestão de Informações Analíticas*), sucessora moderna da linhagem A.E.G.I.S (2024), totalmente reescrita em Next.js 16, TypeScript, PostgreSQL 18 e TailwindCSS v4.

#### ✨ Principais Módulos & Recursos Implementados:
- **Autenticação Avançada & Segurança de Acesso**:
  - Sistema de contas via Better Auth com sessões persistentes e isoladas por usuário.
  - Segundo Fator de Autenticação (**2FA TOTP**) nativo com geração de QR Code dinâmico e suporte a códigos de backup de emergência.
  - Proteção de rotas em middleware unificado (`proxy.ts`).
  - Isolamento estrito de base de dados por conta (*multi-tenant*): cada investigador visualiza e manipula exclusivamente seus próprios registros.

- **Dashboard Analítico Modular (EvilCharts Redesign)**:
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
  - Conectores nativos para ViaCEP (autocompletar endereço), BrasilAPI (dados cadastrais de CNPJ), OpenStreetMap Nominatim (geocodificação reversa), IPinfo e Have I Been Pwned.

- **Excelência Visual & UI Motion Pass**:
  - Fundo dinâmico com Shader WebGL de alta fidelidade e gradiente VIGIA/Instagram.
  - Temas **BLACK OLED** (preto `#000000` absoluto) e **WHITE OLED** com suporte a alternância em tempo real.
  - Microinterações e animações de transição suaves alimentadas por `motion/react`.

- **Automação Operacional & Scripts**:
  - `scripts/setup.sh`: Bootstrap completo e idempotente do ambiente.
  - `scripts/reset.sh`: Factory reset com limpeza de banco, uploads e Redis.
  - `scripts/backup.sh` & `scripts/restore.sh`: Rotinas automatizadas de dump e restauração compactada.
  - `scripts/update.sh`: Script de atualização automatizada via Git.

#### 🐛 Correções Realizadas durante o Ciclo de Testes:
- Correção de loop de redirecionamento no fluxo de login após ativação do 2FA.
- Resolução do problema de isolamento de dados entre diferentes contas cadastradas.
- Correção de sobreposição de botões de zoom e controles no canvas do grafo.
- Eliminação do pânico de compilação em loop do Turbopack e desativação do indicador "Rendering...".
- Eliminação do recuo cíclico de nós arrastados no Grafo, assegurando estabilidade permanente da posição customizada pelo usuário.
