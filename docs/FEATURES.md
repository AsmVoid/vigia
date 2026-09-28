# Manual de Funcionalidades — V.I.G.I.A

Este documento apresenta uma visão detalhada de cada módulo do **V.I.G.I.A**, descrevendo seus recursos analíticos, atalhos, arquitetura de interface e mecanismos de proteção.

---

## 1. 📊 Dashboard Analítico (`/dashboard`)

O painel principal consolida as métricas da operação de forma visual e adaptativa:

- **10 Widgets Modulares Arrastáveis**:
  - *Métricas Principais*: Total de entidades monitoradas, grupos ativos, contatos cadastrados e fotos indexadas.
  - *Distribuição por Grupos/Organizações*: Gráfico de rosca proporcional com código de cores por grupo.
  - *Nível de Risco Médio*: Medidor estilo Gauge indicando a severidade média das pessoas sob custódia analítica.
  - *Fluxo de Cadastros (30 dias)*: Gráfico de barras temporais mostrando o volume de novas informações ao longo do último mês.
  - *Ações Rápidas*: Atalhos imediatos para novo cadastro, novo grupo, busca global e exportação.
  - *Entidades Recentes*: Acesso direto aos últimos dossiês visualizados ou editados.
  - *Log de Atividades*: Linha do tempo imutável das últimas ações do investigador.
- **Drag-and-Drop Livre**: Os cartões do dashboard podem ser reorganizados livremente pelo usuário via dnd-kit.
- **Persistência de Layout**: A ordem dos widgets é memorizada por usuário no navegador (`localStorage`).
- **Botão de Reset de Layout**: Permite retornar ao arranjo padrão a qualquer momento com animação suave.
- **Modo Privacidade (Olho de Sigilo)**: Oculta valores numéricos sensíveis e identificadores na tela com um clique, prevenindo que pessoas ao redor visualizem dados confidenciais (*shoulder surfing*).

---

## 2. 🌳 Árvore de Dados e Organizações (`/tree`)

A visualização em árvore agrupa as entidades sob monitoramento em categorias e estruturas organizadas:

- **Agrupamento Dinâmico**: Segmentação por grupos/facções, empresas ou alvos sem filiação declarada.
- **Cards Informativos Ricos**: Exibição da foto do perfil, nome completo, vulgo/apelido, cargo, cidade/estado e idade.
- **Barra de Progresso do Dossiê**: Indicador percentual que calcula automaticamente o nível de completude cadastral da pessoa (contatos, documentos, veículos, finanças, endereços).
- **Vínculos com 20 Redes e Plataformas**: Suporte a identificadores de redes sociais e mensageiros (WhatsApp, Telegram, Instagram, Facebook, LinkedIn, X/Twitter, TikTok, YouTube, GitHub, Discord, Reddit, etc.).
- **Filtro Rápido e Pesquisa**: Busca instantânea por nome, CPF ou apelido sem recarregar a página.

---

## 3. 👤 Cadastro & Edição de Pessoas (`/person/new`, `/person/[id]/edit`)

Formulário completo dividido em **11 seções temáticas especializadas**:

1. **Identificação Básica**: Foto de perfil (upload local), Nome Completo, Vulgos/Codinomes, Gênero, Estado Civil, Nível de Risco (1 a 5 estrelas).
2. **Dados Pessoais & Nascimento**: Data de Nascimento, Idade calculada, Signo Zodiacal, Naturalidade e Nacionalidade.
3. **Documentos Oficiais**: CPF, RG, CNH (com Categoria), Título de Eleitor, Passaporte, Certidão de Nascimento/Casamento e NIS/PIS.
4. **Contatos Telefônicos**: Múltiplos números com marcação de WhatsApp, Telegram e etiquetas (Pessoal, Trabalho, Recado).
5. **E-mails**: Endereços eletrônicos com verificação de vazamento OSINT integrada.
6. **Endereços & Geolocalização**: Logradouro, Número, Complemento, Bairro, CEP (com busca automática ViaCEP), Cidade, Estado, Latitude e Longitude (com marcação direta no mapa Leaflet).
7. **Veículos & Transportes**: Placa do veículo, Marca/Modelo, Ano, Cor e código RENAVAM.
8. **Histórico Profissional**: Cargo atual, Empresa, Período e Histórico de ocupações anteriores.
9. **Formação Acadêmica**: Escolaridade, Instituição de ensino, Curso e ano de conclusão.
10. **Dados Financeiros & Criptoativos**: Chaves PIX, Dados bancários, Cartões de Crédito e Carteiras de Criptomoedas (BTC, ETH, Monero, USDT) — **armazenados com criptografia de ponta a ponta**.
11. **Relações Familiares & Genealógicas**: Pai, Mãe, Cônjuge/Parceiro, Filhos e Irmãos, com vínculo direto a outras entidades cadastradas.

---

## 4. 🗂️ Dossiê Completo da Entidade (`/entity/[id]`)

A interface de dossiê condensa todo o dossiê da pessoa sob três abas analíticas:

- **Aba "Informações Gerais"**:
  - Resumo de identificação, vulgos, idade e documentos oficiais.
  - Vínculos telefônicos com botão de ação rápida para WhatsApp Web.
  - Mapa interativo (Leaflet) renderizando a localização geográfica exata do endereço principal em tema dark OLED.
  - Veículos vinculados e informações profissionais.
- **Aba "Financeiro & Segredos"**:
  - Todos os dados bancários, chaves PIX e carteiras de criptoativos são gravados no banco em formato cifrado (AES-256-GCM).
  - **Botão Revelar / Ocultar**: Permite ao investigador autorizado descriptografar temporariamente uma chave ou número na tela mediante ação deliberada.
- **Aba "Linha do Tempo & Histórico"**:
  - Registro cronológico das atualizações cadastrais, notas e eventos associados àquela pessoa.
- **Botão Direto para o Grafo Genealógico**: Atalho para navegar no grafo a partir da entidade selecionada.

---

## 5. 🕸️ Grafo Genealógico & Sociométrico (`/entity/[id]/graph`)

Canvas interativo de alta performance construído com `@xyflow/react` e `@dagrejs/dagre`:

- **Nós Customizados**:
  - *Nó Central (Alvo)*: Exibe foto, moldura neon pulsante, identificação, ocupação e contador de conexões.
  - *Nós Relacionados*: Cartões estilizados com crachá da categoria, papel de relacionamento e botões de ação rápida.
- **Categorização de Vínculos com Código de Cores**:
  - ❤️ *Afetivo / Amoroso* (Rosa/Pink): Namorado(a), Esposo(a), Amante/Caso, Noivo(a).
  - 👥 *Família* (Rosa Sólido): Pai, Mãe, Filho(a), Irmão(ã), Tio(a), Primo(a).
  - 💼 *Trabalho / Profissional* (Âmbar/Laranja Tracejado): Chefe, Colega, Sócio, Empregado.
  - 🤝 *Social* (Roxo Pautado): Amigo(a), Vizinho(a), Conhecido(a).
  - ⚠️ *Investigativo / Alerta* (Vermelho Trastejado): Comparsa, Inimigo, Suspeito, Vítima.
- **Drag-to-Connect Interativo**: Arraste um conector circular de qualquer nó para outro para criar uma nova relação com modal imediato.
- **Controle Total de Layout**:
  - *Vertical Hierárquico (TB)*: Ideal para árvores genealógicas.
  - *Horizontal (LR)*: Ideal para fluxos operacionais e cadeias de comando.
  - *Radial / Concêntrico*: Posiciona o alvo no centro e os vínculos em círculos proporcionais ao redor.
- **Persistência de Posições Customizadas**: Os nós mantêm suas coordenadas gravadas no navegador mesmo após fechar a aba ou recarregar a tela (`localStorage`).
- **Exportação de Imagem em Alta Resolução**: Botão para exportar o grafo completo renderizado em formato PNG transparente.
- **Modo Tela Cheia (Fullscreen)**: Expansão do canvas para monitoramento em múltiplos displays ou salas de situação.

---

## 6. 🖼️ Galeria de Mídias e Evidências (`/gallery`)

- **Múltiplos Formatos Suportados**: Imagens (PNG, JPG, WEBP, GIF) até 25 MB e Vídeos (MP4, WEBM) até 100 MB.
- **Visualização em Alvenaria (Masonry)**: Distribuição otimizada das mídias com cards que exibem a entidade associada e a data de upload.
- **Lightbox Interativo**: Permite zoom, navegação entre mídias com as setas do teclado e download direto.
- **Player de Vídeo Embutido**: Reprodução nativa de vídeos coletados durante monitoramento.

---

## 7. 📝 Canvas Livre de Anotações & Hipóteses (`/notes`)

Espaço interativo em estilo quadro de investigação com **7 tipos de widgets**:

1. **Nota Rápida (Post-it)**: Anotações com escolha de cores neon.
2. **Quadro de Hipóteses**: Linha de raciocínio investigativo estruturada.
3. **Checklist de Diligências**: Lista de tarefas pendentes com caixas de seleção.
4. **Alerta / Suspeita Crítica**: Cartão com destaque visual em vermelho para riscos iminentes.
5. **Cofre Confidencial**: Bloco com proteção por senha independente — o texto só é descriptografado em tela após digitar a senha do cofre.
6. **Mídia Anexada**: Card com imagem de evidência associada.
7. **Lembrete de Prazo**: Card com contador de data limite para ações judiciais ou policiais.

---

## 8. 🔍 Enriquecimento OSINT Automatizado

Integradores para consultas diretas sem necessidade de cadastro em APIs pagas:

- **ViaCEP**: Preenchimento automático instantâneo de Rua, Bairro, Cidade e UF a partir do CEP.
- **BrasilAPI (CNPJ)**: Consulta de Razão Social, Nome Fantasia, CNAE e Sócios para empresas vinculadas.
- **IPinfo**: Resolução de provedor, geolocalização e ASN para endereços IP investigados.
- **OpenStreetMap / Nominatim**: Geocodificação reversa de endereços para coordenadas de latitude e longitude.
- **Have I Been Pwned (HIBP)**: Checagem de vazamentos de credenciais para e-mails cadastrados.

---

## 9. 🎨 Design System & Interface

- **Tema BLACK OLED**: Fundo `#000000` absoluto, sem tons de cinza, ideal para monitores OLED e economia de energia em ambientes escuros.
- **Tema WHITE OLED**: Modo claro de alto contraste, desenhado para ambientes com luz solar direta.
- **Gradiente Instagram / VIGIA**: Acentos visuais refinados (`#f09433`, `#e6683c`, `#dc2743`, `#cc2366`, `#bc1888`).
- **Animações Fluidas**: Microinterações com `motion/react` e glassmorphism translúcido.

---

## 10. ⌨️ Atalhos de Teclado Globais

| Atalho | Ação |
|---|---|
| `Cmd + K` ou `Ctrl + K` | Abre a Barra de Busca Global (Command Palette) |
| `Ctrl + Shift + Esc` | **Panic Button**: Bloqueia a tela imediatamente e redireciona para página inofensiva |
| `Esc` | Fecha modais, janelas suspensas e Lightbox |
| `F` | Alterna modo tela cheia no Grafo |
