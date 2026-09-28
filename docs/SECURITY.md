# Política e Diretrizes de Segurança — V.I.G.I.A

Este documento detalha o modelo de ameaças, salvaguardas criptográficas, recursos operacionais de emergência e boas práticas de *hardening* para operadores do **V.I.G.I.A**.

---

## 🎯 Modelo de Ameaças & Premissas

O V.I.G.I.A foi projetado para operações de inteligência investigativa em ambiente *self-hosted*, considerando os seguintes vetores de risco:

1. **Acesso Físico Indesejado ao Terminal (*Shoulder Surfing*)**:
   - *Mitigação*: Modo Sigilo no Dashboard (oculta valores com blur imediato) e **Panic Button** (`Ctrl + Shift + Esc`) que tranca a tela instantaneamente e redireciona o navegador.
2. **Interceptação de Tráfego de Rede (*Man-in-the-Middle*)**:
   - *Mitigação*: Cookies estritamente `HttpOnly`, `SameSite=Lax`, e diretiva obrigatória de uso de terminação TLS/HTTPS em produção.
3. **Vazamento ou Despejo do Banco de Dados (*Database Dump Leak*)**:
   - *Mitigação*: Campos altamente sensíveis (chaves PIX, cartões de crédito, carteiras de criptomoedas, notas confidenciais do cofre) são gravados cifrados com `AES-256-GCM` com IV dinâmico. Um dump puro do PostgreSQL não permite a leitura desses dados sem a `ENCRYPTION_KEY`.
4. **Violação de Isolamento entre Contas (*Multi-Tenant Leak*)**:
   - *Mitigação*: Todas as consultas de leitura e escrita filtram expressamente pelo `userId` da sessão autenticada. Uma conta de investigador nunca visualiza pessoas, grupos ou mídias criados por outro operador.
5. **Sequestro de Credenciais de Acesso (*Credential Stuffing*)**:
   - *Mitigação*: Autenticação com suporte nativo a **2FA TOTP** (RFC 6238) compatível com Google Authenticator, Aegis e 1Password.

---

## 🔐 Criptografia em Repouso (Data at Rest)

- **Algoritmo**: `AES-256-GCM` (NIST SP 800-38D).
- **Geração de Chaves**:
  - `BETTER_AUTH_SECRET`: Deve possuir no mínimo 32 bytes de entropia criptográfica (`openssl rand -hex 32`).
  - `ENCRYPTION_KEY`: Chave simétrica hexadecimal de 64 caracteres (256 bits) para encriptação da camada de aplicação.
- **Autenticidade & Integridade**: A tag de autenticação GCM (128 bits) garante que qualquer modificação indevida de dados no banco resulte em erro de descriptografia antes do dado ser processado.

---

## 🚨 Recursos de Defesa Operacional

### 1. Botão de Pânico (Panic Button)
- **Atalho**: `Ctrl + Shift + Esc` (ou botão de emergência na barra superior).
- **Ação**: Encerra a visualização analítica atual no ato, limpa o buffer de tela e redireciona o navegador para uma URL inofensiva configurável (ex: busca padrão de notícias ou página em branco).

### 2. Modo Descartável (Burner Mode)
- Permite operar sessões temporárias que não persistem dados no cache de disco do navegador, recomendadas para uso em laptops operacionais em campo.

### 3. Trilha de Auditoria Imutável (Audit Trail)
- Cada criação, visualização, edição ou exclusão de dossiê gera um registro append-only na tabela `AuditLog`.
- Registra: Timestamp UTC, ID do usuário, Tipo da ação, ID da entidade afetada, Endereço IP de origem e User-Agent.

---

## 🛡️ Guia de Hardening para Produção (Self-Hosted)

Ao hospedar o V.I.G.I.A em um servidor dedicado ou VPS, aplique rigorosamente as seguintes medidas:

### 1. Reverse Proxy com TLS Obrigatório (Nginx / Caddy)
Nunca exponha a porta `3000` diretamente à Internet. Utilize um proxy reverso com certificados SSL/TLS automáticos (Let's Encrypt):

Exemplo de configuração Caddyfile:
```caddy
vigia.sua-organizacao.org {
    reverse_proxy localhost:3000
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

### 2. Isolamento de Firewall (UFW)
Apenas as portas `80` (HTTP) e `443` (HTTPS) devem ser expostas externamente. As portas `5432` (PostgreSQL) e `6379` (Redis) devem ficar vinculadas exclusivamente a `127.0.0.1` ou à rede interna do Docker.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Rotação Periódica de Segredos
Recomenda-se rotacionar as chaves de sessão a cada 90 dias. Ao rotacionar a `ENCRYPTION_KEY`, certifique-se de executar uma migração de re-encriptação para os dados armazenados em `FinancialSecret`.

### 4. Backups Cifrados
Ao executar `npm run backup -- --include-env`, guarde os arquivos gerados em volumes criptografados com LUKS ou arquivos compactados com GPG (`gpg -c database.dump`).

---

## 📢 Relato Responsável de Vulnerabilidades

Se você descobrir uma falha de segurança no V.I.G.I.A, por favor **NÃO abra uma issue pública no GitHub**.

Envie os detalhes da vulnerabilidade para:
- **E-mail de Segurança**: `security@vigia.local` ou via mensagem privada aos mantenedores em [https://github.com/AsmVoid/vigia](https://github.com/AsmVoid/vigia).

Comprometemo-nos a responder dentro de 48 horas e a disponibilizar uma correção antes de qualquer divulgação.
