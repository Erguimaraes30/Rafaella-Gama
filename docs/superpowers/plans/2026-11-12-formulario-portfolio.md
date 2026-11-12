# Formulário de novos cards do portfólio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um envio do Google Forms vira um card novo no carrossel do portfólio e o site é publicado sozinho.

**Architecture:** O Apps Script do formulário grava um `pendentes/<id>.json` (dados + imagem em base64) no repositório pela API do GitHub. Um workflow dispara com esse push, roda `scripts/processar-pendentes.mjs` (sharp → `.webp`, insere no `src/data/portfolio.json`), faz o commit e dispara o `deploy.yml`.

**Tech Stack:** Node 22 (ESM, `node:test`), sharp, Vite/React (site existente), GitHub Actions, Google Apps Script.

**Spec:** `docs/superpowers/specs/2026-11-12-formulario-portfolio-design.md`

## Global Constraints

- Imagens: `trim` de bordas pretas uniformes, caber em 1000×1000 sem ampliar, `.webp` qualidade 80, em `public/portfolio/<pasta>/<slug>.webp`.
- Regras por categoria: Substack `substack`/`fim`; Em Todo Lugar `emtodolugar`/`inicio`; Além do Hype `alemdohype`/`fim`; Coberturas `coberturas`/`inicio`.
- Card gravado: `{ title, subtitle?, href, image }` — `subtitle` só quando preenchido; `image` sem prefixo de base.
- Perguntas do formulário (títulos exatos): `Categoria`, `Título`, `Subtítulo`, `Link`, `Imagem de capa`.
- E-mails autorizados: `enzorafael211205@gmail.com`, `sourafagama@gmail.com`. Repositório `Erguimaraes30/Rafaella-Gama`, branch `main`.
- Token só em Propriedades do script (`GITHUB_TOKEN`), nunca no código.
- Tudo em planos gratuitos; nenhum serviço novo.
- Textos, nomes e comentários em português, no estilo do código existente.

## Review Focus

1. Título com acentos, aspas tipográficas ou emoji → slug só com `[a-z0-9-]`, não vazio (cai para `card` se ficar vazio). Teste na Task 2.
2. Dois pendentes na mesma execução para a mesma categoria → ambos entram, na ordem de envio, com nomes de imagem distintos. Teste na Task 2.
3. Pendente inválido no meio de outros → nenhum arquivo do repositório é alterado (validar todos antes de gravar qualquer coisa). Teste na Task 2.
4. Imagem PNG com transparência ou muito pequena (< 1000px) → vira `.webp` sem ampliar e sem erro. Teste na Task 2.
5. Push concorrente em `main` enquanto a Action roda → `git pull --rebase` antes do push; não perde commit. Coberto pelo passo do workflow (Task 3), verificado na Task 5.

---

### Task 1: Migrar os dados para `portfolio.json`

**Files:**
- Create: `src/data/portfolio.json`
- Modify: `src/data/portfolio.js` (passa a só importar o JSON)

**Interfaces:**
- Produces: `src/data/portfolio.json` — array de categorias `{ nome, cor, capa, logo?, pasta, novas, trabalhos: [{ title, subtitle?, href, image }] }`, caminhos sem base. `PORTFOLIO` exportado por `portfolio.js` com o formato atual (caminhos com `withBase`, sem expor diferenças aos componentes; `pasta`/`novas` podem passar adiante).

- [ ] **Step 1:** Antes de mudar, gerar uma fotografia do `PORTFOLIO` atual: script temporário no scratchpad que importa `src/data/portfolio.js` com `import.meta.env` simulado (`BASE_URL='/Rafaella-Gama/'`) e grava JSON. (Alternativa simples: `vite-node` não está instalado — usar `node --input-type=module` lendo o arquivo e substituindo `withBase(` por uma função local.)
- [ ] **Step 2:** Criar `portfolio.json` com os mesmos dados, na mesma ordem, acrescentando `pasta` e `novas` conforme Global Constraints. A categoria Coberturas mantém `capa: "/retrato-sobremim.webp"`.
- [ ] **Step 3:** Reescrever `portfolio.js`: manter o comentário de cabeçalho atualizado, `import dados from './portfolio.json'`, exportar `PORTFOLIO = dados.map(c => ({ ...c, capa: withBase(c.capa), trabalhos: c.trabalhos.map(t => ({ ...t, image: withBase(t.image) })) }))`.
- [ ] **Step 4:** Repetir a fotografia e comparar com a do Step 1 ignorando `pasta`/`novas`. Esperado: idênticas.
- [ ] **Step 5:** `npm run build`. Esperado: `✓ built`.
- [ ] **Step 6:** Commit `Move os dados do portfólio para JSON`.

### Task 2: Script `processar-pendentes.mjs` com testes

**Files:**
- Create: `scripts/processar-pendentes.mjs`
- Create: `scripts/processar-pendentes.test.mjs`
- Modify: `package.json` (`sharp` em devDependencies; script `"test": "node --test scripts/"`)
- Create: `pendentes/.gitkeep`

**Interfaces:**
- Consumes: formato do `portfolio.json` (Task 1).
- Produces:
  - `slugify(texto: string): string`
  - `async processarPendentes({ raiz: string }): Promise<string[]>` — processa `<raiz>/pendentes/*.json` em ordem de nome, grava em `<raiz>/public/portfolio/...` e `<raiz>/src/data/portfolio.json`, apaga os pendentes, devolve os títulos processados. Lança `Error` com mensagem em português se algum pendente for inválido, **sem gravar nada**.
  - Executado direto (`node scripts/processar-pendentes.mjs`): usa `raiz = process.cwd()`, imprime um título por linha em stdout; sai com código 1 e mensagem em stderr no erro.
  - Formato do pendente: `{ categoria, title, subtitle, href, enviadoPor, enviadoEm, imagem: { nome, mime, base64 } }`.

- [ ] **Step 1:** `npm i -D sharp@0.33.5`.
- [ ] **Step 2: Testes falhando.** Cada teste monta um diretório temporário (`fs.mkdtemp`) com um `portfolio.json` mínimo (uma categoria `inicio`, outra `fim`, cada uma com 1 trabalho) e pendentes cuja imagem é gerada com `sharp({ create: { width, height, channels: 3|4, background } }).png().toBuffer()`.
  - `slugify`: `'Victoria’s Secret: o show!'` → `'victorias-secret-o-show'`; `'Além do Hype #5'` → `'alem-do-hype-5'`; `'🎃🎃'` → `'card'`; resultado com no máximo 40 caracteres e sem hífen no fim.
  - `insere no início quando novas = inicio`: `trabalhos[0].title === pendente.title`, tamanho 2.
  - `insere no fim quando novas = fim`: último item é o novo.
  - `omite subtitle vazio`: `!('subtitle' in card)`; e com subtítulo preenchido, `card.subtitle === 'x'`.
  - `converte para webp dentro de 1000px`: pendente 2000×1500 → metadata `format === 'webp'`, `width === 1000`, `height === 750`; `card.image === '/portfolio/<pasta>/<slug>.webp'`.
  - `não amplia imagem pequena`: 300×200 PNG com alpha → `width === 300`.
  - `corta bordas pretas`: imagem 400×600 com faixas pretas de 100px em cima e embaixo (composta com sharp) → `height === 400`.
  - `dois pendentes da mesma categoria e mesmo título`: os dois entram na ordem de envio, imagens `<slug>.webp` e `<slug>-2.webp`.
  - `apaga os pendentes processados`: `pendentes/` sem `.json` ao final.
  - `pendente inválido não altera nada`: um válido + um com categoria `'Inexistente'` → rejeita com mensagem contendo `Inexistente`; `portfolio.json` byte a byte igual ao original; nenhum `.webp` novo; os dois pendentes continuam lá.
  - `href sem http é inválido`: rejeita.
- [ ] **Step 3:** `npm test` → FAIL (módulo não existe).
- [ ] **Step 4:** Implementar. Ordem: ler e validar **todos** os pendentes primeiro; depois converter imagens; por fim gravar JSON e apagar pendentes. Slug: `normalize('NFD')`, remover diacríticos e tudo fora de `[a-z0-9]` virando hífen, colapsar hífens, cortar em 40 e aparar hífens. `trim({ background: '#000', threshold: 20 })` → `resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })` → `webp({ quality: 80 })`. JSON gravado com `JSON.stringify(dados, null, 2) + '\n'`. Detecção de execução direta via `import.meta.url === pathToFileURL(process.argv[1]).href`.
- [ ] **Step 5:** `npm test` → todos PASS.
- [ ] **Step 6:** `npm run build` → `✓ built`.
- [ ] **Step 7:** Commit `Adiciona script que processa novos cards do formulário`.

### Task 3: Workflow `novo-card.yml`

**Files:**
- Create: `.github/workflows/novo-card.yml`

**Interfaces:**
- Consumes: `node scripts/processar-pendentes.mjs` (Task 2), `deploy.yml` (já aceita `workflow_dispatch`).

- [ ] **Step 1:** Escrever o workflow conforme spec §5: gatilhos `push` (branches `main`, paths `pendentes/**`) e `workflow_dispatch`; `concurrency: { group: novo-card, cancel-in-progress: false }`; `permissions: { contents: write, actions: write }`; passos: `actions/checkout@v4`, `actions/setup-node@v4` (node 22, cache npm), `npm ci`, `npm test`, processar (guardar stdout em `steps.<id>.outputs.titulos` via `$GITHUB_OUTPUT` com delimitador multilinha), `npm run build`, e — só se `git status --porcelain` não estiver vazio — configurar `github-actions[bot]`, `git add -A public/portfolio src/data/portfolio.json pendentes`, commit `Adiciona card: <títulos separados por "; ">`, `git pull --rebase origin main`, `git push`, `gh workflow run deploy.yml --ref main` com `GH_TOKEN: ${{ github.token }}`.
- [ ] **Step 2:** Validar sintaxe: `npx --yes yaml-lint .github/workflows/novo-card.yml` (ou `node -e` com o pacote `yaml`). Esperado: sem erro.
- [ ] **Step 3:** Commit `Adiciona workflow que publica cards enviados pelo formulário`.

### Task 4: Apps Script do formulário

**Files:**
- Create: `automacao/apps-script/Codigo.gs`
- Create: `automacao/README.md` (Etapas 3 e 4 da configuração manual, passo a passo, em português)

**Interfaces:**
- Produces (Apps Script, global): `instalar()`, `aoEnviar(e)`; grava `pendentes/<AAAA-MM-DDTHH-MM-SS>-<slug>.json` no formato da Task 2.

- [ ] **Step 1:** Escrever `Codigo.gs`: constantes `REPO`, `BRANCH`, `AUTORIZADOS`, `PERGUNTAS` (títulos exatos); `instalar()` apaga gatilhos existentes de `aoEnviar` e cria `ScriptApp.newTrigger('aoEnviar').forForm(FormApp.getActiveForm()).onFormSubmit().create()`; `aoEnviar(e)` segue spec §3 (e-mail via `e.response.getRespondentEmail()`, respostas por `getItem().getTitle()`, arquivo via `DriveApp.getFileById(id)`, `Utilities.base64Encode(blob.getBytes())`, `UrlFetchApp.fetch` com `method: 'put'`, `muteHttpExceptions: true`, cabeçalhos `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`; corpo `{ message: 'Novo card: <título>', content: base64(JSON do pendente), branch }`); erros → `MailApp.sendEmail(Session.getEffectiveUser().getEmail(), ...)` com título e mensagem; slug simplificado equivalente ao da Task 2 (só para o nome do arquivo pendente).
- [ ] **Step 2:** Revisão manual: conferir nomes de campos do pendente contra o formato da Task 2 e que nenhum token aparece no código.
- [ ] **Step 3:** Escrever `automacao/README.md`: como abrir o editor de script, colar o código, criar a propriedade `GITHUB_TOKEN`, rodar `instalar()` e autorizar (incluindo o aviso "app não verificado" → Avançado → Acessar), e como reprocessar pela aba Actions.
- [ ] **Step 4:** Commit `Adiciona Apps Script do formulário de novos cards`.

### Task 5: Publicar e testar fim a fim (com o usuário)

- [ ] **Step 1:** `git push origin main`; conferir que o `deploy.yml` passou e o site continua igual (as imagens existentes respondem 200).
- [ ] **Step 2:** Usuário faz as Etapas 3 e 4 do `automacao/README.md`.
- [ ] **Step 3:** Usuário envia um card de teste (categoria Coberturas, título `Teste automação`). Acompanhar: commit do Apps Script em `pendentes/`, `novo-card.yml` verde, `deploy.yml` verde, imagem nova responde 200 no site.
- [ ] **Step 4:** Remover o card de teste (entrada no JSON + imagem), commit `Remove card de teste da automação`, push.
