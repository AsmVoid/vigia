# Arquitetura Técnica — V.I.G.I.A

Este documento descreve a arquitetura interna, estrutura de diretórios, convenções de código, modelo de dados e mecanismos de segurança do **V.I.G.I.A**.

---

## 🏗️ Visão Geral da Arquitetura

O V.I.G.I.A foi construído sobre uma arquitetura moderna orientada a serviços locais (*self-hosted*):

```
┌─────────────────────────────────────────────────────────────┐
│                 Navegador Web / Cliente                     │
│  Next.js 16 (App Router) + React 19 + TailwindCSS v4       │
│  React Flow (Grafos) + Leaflet (Mapas) + Motion (Animação) │
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTP / JSON                  │ Server Actions
┌──────────────▼──────────────────────────────▼───────────────┐
│               Servidor Next.js (Node.js 22)                │
│  - Middleware de Autenticação (proxy.ts + Better Auth)      │
│  - Server Actions & API Routes                              │
│  - Camada Criptográfica (lib/encryption.ts, AES-256-GCM)   │
│  - Filas de Processamento Assíncrono (BullMQ)               │
└──────────────┬──────────────────────────────┬───────────────┘
               │ SQL                          │ TCP / Cache
┌──────────────▼─────────────┐ ┌──────────────▼───────────────┐
│       PostgreSQL 18        │ │           Redis 8            │
│  - Schema Prisma Relacional│ │  - Filas de tarefas BullMQ   │
│  - Views SQL Analíticas    │ │  - Rate Limiting & Cache     │
└────────────────────────────┘ └──────────────────────────────┘
```

---

## 📂 Estrutura de Diretórios Comentada

```
~/vigia/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas públicas de autenticação (login, register)
│   ├── (dashboard)/            # Rotas protegidas da aplicação
│   │   ├── dashboard/          # Painel principal com widgets analíticos
│   │   ├── tree/               # Árvore de entidades e grupos
│   │   ├── entity/             # Dossiês ([id]) e grafos ([id]/graph)
│   │   ├── person/             # Formulários de criação e edição de pessoas
│   │   ├── gallery/            # Galeria de fotos e evidências
│   │   ├── notes/              # Canvas livre de notas e cofre
│   │   ├── groups/             # Gerenciamento de facções/organizações
│   │   ├── logs/               # Trilha de auditoria imutável
│   │   └── settings/           # Configurações de conta e 2FA TOTP
│   ├── api/                    # Rotas de API HTTP (auth, webhooks, upload)
│   ├── layout.tsx              # Layout raiz com provedores de tema e contexto
│   └── globals.css             # Design system OLED e tokens de estilização
├── components/                 # Componentes React modulares
│   ├── dashboard/              # Widgets analíticos arrastáveis
│   ├── entity/                 # Componentes de dossiê e visualização de dados
│   │   └── graph/              # Nós customizados, conexões e canvas React Flow
│   ├── person/                 # 11 seções temáticas do formulário de pessoa
│   ├── tree/                   # Cards da árvore e barras de completude
│   ├── gallery/                # Masonry grid e modal de lightbox
│   ├── notes/                  # Widgets de notas, checklists e cofre
│   ├── layout/                 # Sidebar, cabeçalho, paleta Cmd+K e navegação
│   ├── shared/                 # Shader WebGL, botões, modais e componentes base
│   └── ui/                     # Primitivos shadcn/ui estilizados
├── lib/                        # Camada de regras de negócio e infraestrutura
│   ├── auth.ts                 # Configuração do Better Auth (sessões, 2FA, passkeys)
│   ├── auth-client.ts          # Cliente de autenticação para componentes React
│   ├── encryption.ts           # Motor de criptografia AES-256-GCM com IV dinâmico
│   ├── prisma.ts               # Instância singleton do Prisma Client com Adapter
│   ├── queue.ts                # Inicialização de filas BullMQ sobre Redis
│   └── osint.ts                # Conectores externos (ViaCEP, BrasilAPI, Nominatim)
├── prisma/                     # Camada de banco de dados
│   ├── schema.prisma           # Modelagem relacional completa
│   ├── migrations/             # Histórico sequencial de migrações SQL
│   ├── views.sql               # Definição das Views analíticas em PostgreSQL
│   └── seed.ts                 # Script de dados de demonstração (opcional)
├── public/                     # Ativos estáticos e uploads locais
│   └── uploads/people/         # Mídias enviadas (preserva .gitkeep)
├── scripts/                    # Scripts de automação operacional (chmod +x)
│   ├── setup.sh                # Bootstrap idempotente do ambiente
│   ├── reset.sh                # Factory reset completo
│   ├── backup.sh               # Geração de dumps compactados
│   ├── restore.sh              # Restauração integral de banco e mídias
│   └── update.sh               # Sincronização e rebuild de versão
├── docs/                       # Documentação técnica e manuais de uso
├── proxy.ts                    # Middleware e proteção de rotas Next.js
├── prisma.config.ts            # Configuração do Prisma 7 (Datasource URL e Seeds)
└── docker-compose.yml          # Definição dos contêineres PostgreSQL 18 e Redis 8
```

---

## 🗄️ Modelo de Dados (Prisma Schema)

O banco de dados relacional foi modelado para suportar investigações complexas com isolamento estrito por usuário (`userId`).

### 1. Modelos Principais

- **`User` & `Session`**: Gerenciamento de credenciais, auditoria de logins (IP, User-Agent, duração), e marcação de 2FA ativado.
- **`TwoFactor`**: Armazenamento do segredo TOTP e códigos de backup para segundo fator de autenticação.
- **`Entity` (Pessoa / Alvo)**: Entidade central da investigação. Possui auto-relacionamentos para árvore genealógica:
  - `fatherId` / `motherId`: Apontam recursivamente para outra `Entity`.
  - `childrenAsFather` / `childrenAsMother`: Relações de parentalidade.
  - `siblings` / `siblingOf`: Relacionamentos fraternais entre entidades.
- **`SiblingName`**: Armazena nomes de irmãos que ainda não possuem dossiê próprio cadastrado no sistema.
- **`Relationship`**: Tabela associativa direcionada para construção de grafos sociométricos (`sourceEntityId`, `targetEntityId`, `category`, `label`, `notes`).
- **`Group`**: Facções criminosas, empresas, quadrilhas ou famílias com nome, cor e descrição.
- **Tabelas Filhas Especializadas**:
  - `Phone`: Telefones com suporte a WhatsApp e Telegram.
  - `Email`: Endereços eletrônicos.
  - `Address`: Logradouros com coordenadas de geolocalização.
  - `Job`: Ocupações com empresa, cargo e período.
  - `Education`: Formação acadêmica e instituições.
  - `Vehicle`: Veículos com placa, marca e código RENAVAM.
  - `Document`: Documentos oficiais (CPF, RG, CNH, Passaporte, etc.).
  - `FinancialSecret`: Registros financeiros **criptografados com AES-256-GCM** (chaves PIX, cartões, carteiras de cripto).
  - `Media`: Fotos e vídeos de evidências.
  - `NoteWidget`: Anotações livres, hipóteses, checklists e dados de cofre confidencial.
  - `AuditLog`: Linha do tempo imutável das ações realizadas na plataforma.

---

## 📈 Views SQL Analíticas (`prisma/views.sql`)

Para alta performance no carregamento de dashboards sem sobrecarregar o ORM, criamos Views nativas no PostgreSQL:

1. **`EntityStats`**: Contabiliza totais agregados de contatos, veículos, endereços e documentos por entidade.
2. **`RiskDistribution`**: Agrupa a contagem de entidades por faixa de pontuação de risco (1 a 5).
3. **`GroupAffiliationStats`**: Totaliza entidades e distribuição de risco por organização.
4. **`RecentActivitiesSummary`**: Sumarização das ações mais recentes com identificação de alvo e autor.
5. **`MonthlyRegistrationTrends`**: Série temporal de novos cadastros nos últimos 12 meses.

---

## 🔒 Mecanismos Criptográficos (`lib/encryption.ts`)

A segurança de dados confidenciais utiliza criptografia autenticada:

- **Algoritmo**: `AES-256-GCM` (Advanced Encryption Standard com Galois/Counter Mode).
- **Vetor de Inicialização (IV)**: 12 bytes gerados aleatoriamente via `crypto.randomBytes(12)` para cada operação de escrita.
- **Tag de Autenticação**: 16 bytes verificados obrigatoriamente antes de qualquer descriptografia para prevenir adulteração de dados (*tampering*).
- **Formato em Repouso**: `iv_hex:tag_hex:ciphertext_hex`.
- **Chave Mestra (`ENCRYPTION_KEY`)**: 64 caracteres hexadecimais (32 bytes / 256 bits), carregada exclusivamente em memória no servidor a partir de variáveis de ambiente.

---

## 🛡️ Autenticação & Middleware (`proxy.ts` & Better Auth)

- Todas as requisições para rotas sob `(dashboard)/*` passam obrigatoriamente pelo middleware em `proxy.ts`.
- Validação de sessão por cookie HTTP-only assinado criptograficamente.
- Rotas de API implementam checagem estrita de autorização antes de qualquer mutação.
- Isolamento total por locatário (*tenant isolation*): nenhuma consulta permite acessar entidades ou dados criados por outro `userId`.
