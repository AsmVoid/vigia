# Guia de Publicação no GitHub — V.I.G.I.A v1.0.0

Este guia contém as instruções exatas para o mantenedor (**AsmVoid**) realizar a publicação inicial do repositório no GitHub.

---

## ⚠️ Passo 1: Criar o Repositório no GitHub

1. Acesse sua conta no GitHub e crie um novo repositório em: **[https://github.com/new](https://github.com/new)**.
2. Defina os campos exatamente como abaixo:
   - **Repository name**: `vigia`
   - **Owner**: `AsmVoid`
   - **Description**: `Vigilância Integrada e Gestão de Informações Analíticas — Modern OSINT Platform`
   - **Visibility**: `Public` (ou `Private`, conforme sua preferência)
   - **Initialize this repository with**:
     - ❌ **NÃO** marque "Add a README file"
     - ❌ **NÃO** adicione .gitignore
     - ❌ **NÃO** adicione licença
     *(O repositório DEVE ser criado completamente vazio para receber o commit local existente)*.

---

## 🚀 Passo 2: Comandos de Publicação no Terminal

No seu terminal local dentro da pasta `~/vigia`, execute os comandos abaixo:

```bash
# 1. Certifique-se de que está na raiz do projeto
cd ~/vigia

# 2. Conecte o repositório remoto oficial
git remote add origin https://github.com/AsmVoid/vigia.git

# 3. Garanta que a branch principal chama-se main
git branch -M main

# 4. Envie todos os arquivos e a tag v1.0.0
git push -u origin main --tags
```

---

## 🏷️ Passo 3: Configurar os Tópicos do Repositório (Topics)

Na página principal do repositório no GitHub (`https://github.com/AsmVoid/vigia`), clique no ícone de engrenagem ⚙️ ao lado de "About" e adicione os seguintes **Topics**:

```text
osint, intelligence, investigation, surveillance, nextjs, prisma, postgresql, leaflet, react-flow, self-hosted, cybersecurity, typescript, tailwindcss
```

---

## 🖼️ Passo 4: Configurar a Imagem de Social Preview

Ainda na seção "Settings" > "General" do repositório no GitHub:
1. Role até **Social preview**.
2. Clique em **Edit** > **Upload an image**.
3. Selecione a captura de tela do dashboard: `docs/screenshots/02-dashboard.png`.
4. Isso garantirá um card visual premium ao compartilhar o link do V.I.G.I.A em redes sociais, Discord ou mensageiros.

---

## 📦 Passo 5: Criar a Release v1.0.0

1. Acesse: `https://github.com/AsmVoid/vigia/releases/new`.
2. Em **Choose a tag**, selecione a tag `v1.0.0`.
3. **Release title**: `V.I.G.I.A v1.0.0 — Plataforma Moderna de Inteligência & OSINT`.
4. **Description**: Copie o conteúdo da seção `[1.0.0]` do arquivo [docs/CHANGELOG.md](CHANGELOG.md).
5. Clique em **Publish release**.
