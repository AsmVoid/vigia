# Guia de Contribuição — V.I.G.I.A

Agradecemos profundamente o seu interesse em contribuir com a evolução do **V.I.G.I.A**! Como um projeto focado em inteligência e investigação com tecnologia de ponta, valorizamos contribuições que preservem a estabilidade, a segurança e a excelência visual da plataforma.

---

## 🧭 Princípios de Desenvolvimento

Antes de submeter código, leia o Documento de Requisitos do Produto em [docs/PRD.md](PRD.md). O V.I.G.I.A segue diretrizes estritas:
1. **Design OLED First**: Interfaces focadas em preto absoluto (`#000000`), alto contraste e ausência de ruído visual.
2. **Segurança por Padrão**: Todos os dados sensíveis devem ser cifrados e todas as rotas protegidas pelo middleware `proxy.ts`.
3. **Privacidade e Ética**: O sistema é desenhado para dados públicos e cooperação legal; **não implementamos web scrapers evasivos** nem ferramentas de invasão de privacidade.

---

## 🌿 Fluxo de Trabalho (Fork & Pull Request)

1. **Faça um Fork** do repositório no GitHub: `https://github.com/AsmVoid/vigia`.
2. **Clone** o seu fork localmente:
   ```bash
   git clone https://github.com/SEU_USUARIO/vigia.git
   cd vigia
   ```
3. **Crie uma Branch de Tópico** com nome semântico:
   ```bash
   git checkout -b feat/novo-conector-osint
   # ou: git checkout -b fix/layout-grafo
   ```
4. **Instale e Inicialize o Ambiente**:
   ```bash
   npm run setup
   ```
5. **Faça suas Alterações e Teste Localmente**:
   - Certifique-se de que a aplicação compila sem erros (`npm run build`).
   - Execute a verificação de tipos TypeScript (`npx tsc --noEmit`).
   - Execute o linter (`npm run lint`).

---

## 💬 Convenção de Commits (Conventional Commits)

Adotamos a especificação [Conventional Commits](https://www.conventionalcommits.org/):

Formato: `<tipo>(<escopo opcional>): <descrição no imperativo>`

### Tipos Permitidos:
- `feat`: Adiciona uma nova funcionalidade (ex: `feat(graph): adiciona layout radial concêntrico`).
- `fix`: Corrige um bug (ex: `fix(auth): resolve loop de redirecionamento no login 2FA`).
- `docs`: Alterações exclusivas na documentação (ex: `docs: atualiza instruções para WSL2`).
- `style`: Formatação, ponto e vírgula, sem alteração de lógica de código.
- `refactor`: Refatoração de código que não adiciona recurso nem corrige bug.
- `perf`: Mudança de código que melhora a performance de renderização ou consulta.
- `test`: Adição ou correção de testes.
- `chore`: Atualizações de build, dependências ou ferramentas de infraestrutura.

---

## 🎨 Padrões de Código

- **TypeScript Estrito**: Evite `any` arbitrário; utilize interfaces tipadas para dados analíticos.
- **Componentes React**: Prefira Server Components onde aplicável; Client Components (`"use client"`) apenas quando houver estado interativo, animações ou eventos de mouse.
- **TailwindCSS**: Utilize as classes do design system OLED configuradas em `app/globals.css`.
- **Imports**: Utilize o alias `@/` para importar a partir da raiz (ex: `@/components/...`, `@/lib/...`).

---

## 🚀 Submissão do Pull Request

1. Envie suas alterações para o seu fork remoto:
   ```bash
   git push origin feat/sua-feature
   ```
2. Abra o Pull Request apontando para a branch `main` do repositório oficial `AsmVoid/vigia`.
3. Preencha o template de Pull Request descrevendo claramente o que foi modificado e como testar.
4. Os mantenedores revisarão o PR e fornecerão feedback ou aprovação.
