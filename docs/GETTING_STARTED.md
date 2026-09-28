# Guia de Inicialização Rápida — V.I.G.I.A

Este guia detalha o processo de instalação, configuração e primeiro uso da plataforma **V.I.G.I.A** em diferentes sistemas operacionais e distribuições Linux, além de Windows via WSL2.

---

## 📋 Pré-requisitos Gerais

Antes de iniciar, certifique-se de que sua máquina atende aos requisitos mínimos:
- **Node.js**: `>= 22.0.0`
- **npm**: `>= 10.0.0`
- **Docker**: `>= 24.0.0` e **Docker Compose v2**
- **Memória RAM**: Mínimo de 4 GB (recomendado 8 GB para Docker + compilação Next.js)
- **Portas Livres**: `3000` (Aplicação Next.js), `5432` (PostgreSQL), `6379` (Redis)

---

## 🚀 Instalação por Sistema Operacional

### 1. Arch Linux

No Arch Linux, todas as dependências estão disponíveis nos repositórios oficiais:

```bash
# 1. Instalar pacotes essenciais
sudo pacman -Syu docker docker-compose nodejs npm git openssl

# 2. Habilitar e iniciar o daemon do Docker
sudo systemctl enable --now docker

# 3. (Opcional) Adicionar seu usuário ao grupo docker para rodar sem sudo
sudo usermod -aG docker $USER
newgrp docker

# 4. Clonar o repositório e entrar na pasta
git clone https://github.com/AsmVoid/vigia.git
cd vigia

# 5. Executar o script de configuração automática
npm run setup
```

---

### 2. Ubuntu / Debian

Em sistemas Debian/Ubuntu modernos (Ubuntu 22.04+, 24.04+, Debian 12):

```bash
# 1. Atualizar repositórios
sudo apt update && sudo apt install -y curl git openssl ca-certificates gnupg

# 2. Instalar Docker oficial via script da Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# 3. Instalar Node.js 22 LTS via repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Clonar e inicializar
git clone https://github.com/AsmVoid/vigia.git
cd vigia
npm run setup
```

---

### 3. Fedora / RHEL

```bash
# 1. Instalar dependências
sudo dnf install -y git openssl nodejs npm moby-engine docker-compose-plugin

# 2. Iniciar Docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER

# 3. Clonar e inicializar
git clone https://github.com/AsmVoid/vigia.git
cd vigia
npm run setup
```

---

### 4. Windows 11 / 10 via WSL2 (Recomendado)

O V.I.G.I.A roda com máxima performance no Windows utilizando o WSL2 com Ubuntu. **Não é obrigatório utilizar o Docker Desktop**: você pode rodar o daemon do Docker diretamente dentro do Ubuntu no WSL2 com systemd habilitado.

#### Passo 1: Instalar o WSL2
No PowerShell como Administrador:
```powershell
wsl --install -d Ubuntu-24.04
```
Reinicie o computador se solicitado pelo Windows.

#### Passo 2: Habilitar o systemd no WSL2
Dentro do terminal Ubuntu do WSL2, edite `/etc/wsl.conf`:
```bash
sudo bash -c 'cat <<EOF > /etc/wsl.conf
[boot]
systemd=true
EOF'
```
No PowerShell do Windows, encerre o WSL para aplicar: `wsl --shutdown`, e abra o terminal do Ubuntu novamente.

#### Passo 3: Instalar Docker e Node.js no WSL2
```bash
# Docker oficial no WSL2
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git openssl

# Clone do repositório
git clone https://github.com/AsmVoid/vigia.git
cd vigia

# Setup automático
npm run setup
```

---

## 🛠️ Passo a Passo Manual (Alternativa ao Script)

Caso prefira configurar os serviços etapa por etapa sem executar `npm run setup`:

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Gerar chaves criptográficas seguras
# Altere no arquivo .env:
# BETTER_AUTH_SECRET com: openssl rand -hex 32
# ENCRYPTION_KEY com: openssl rand -hex 32

# 3. Subir os serviços de infraestrutura (PostgreSQL 18 + Redis 8)
npm run db:up

# 4. Instalar pacotes
npm install

# 5. Aplicar schema do banco de dados e views analíticas
npx prisma migrate dev
npm run db:views

# 6. Iniciar o servidor de desenvolvimento
npm run dev
```

---

## 🧪 Dados de Demonstração (Seed Opcional)

Para desenvolvedores ou analistas que queiram explorar a plataforma imediatamente com registros realistas de pessoas, relacionamentos familiares, conexões sociométricas e veículos:

```bash
npx prisma db seed
```

> [!TIP]
> Caso queira limpar os dados de teste e retornar a um estado 100% zerado posteriormente, execute:
> ```bash
> npm run reset
> ```

---

## 🔐 Primeiro Acesso e Cadastro

1. Abra seu navegador em **[http://localhost:3000](http://localhost:3000)**.
2. Você será direcionado para a tela de login. Clique em **"Não tem conta? Criar conta"** ou acesse diretamente `/register`.
3. Registre seu e-mail e senha de administrador (mínimo de 8 caracteres contendo maiúsculas, minúsculas, números e caracteres especiais).
4. O primeiro usuário registrado tem controle pleno de seus próprios dossiês e dados.
5. Recomendamos ativar o **Segundo Fator de Autenticação (2FA TOTP)** imediatamente em **Configurações > Segurança**.

---

## 🧭 Tour Rápido pelos Módulos

- **Dashboard (`/dashboard`)**: Painel de comando com 10 widgets interativos e arrastáveis, medidor de risco, estatísticas analíticas em tempo real e atalho rápido de busca.
- **Árvore de Dados (`/tree`)**: Organização visual das entidades monitoradas agrupadas por categorias e facções, com barras de completude e status.
- **Dossiê da Entidade (`/entity/[id]`)**: Ficha detalhada contendo informações pessoais, contatos, dados cadastrais, financeiros e mapa de localização geográfica.
- **Grafo Genealógico & Sociométrico (`/entity/[id]/graph`)**: Canvas interativo construído com React Flow para correlacionar pessoas, vínculos familiares, conexões profissionais e casos afetivos.
- **Galeria de Mídias (`/gallery`)**: Repositório seguro de fotos, documentos escaneados e vídeos de monitoramento com visualização em Lightbox.
- **Canvas de Notas (`/notes`)**: Espaço livre com post-its, checklists, quadros de hipóteses e cofre de anotações confidenciais protegido por senha independente.
