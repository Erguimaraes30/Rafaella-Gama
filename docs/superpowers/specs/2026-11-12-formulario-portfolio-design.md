# Formulário para novos cards do portfólio

Data: 2026-11-12

## Objetivo

Adicionar matérias ao portfólio sem editar código: alguém autorizado preenche um Google Forms e,
alguns minutos depois, o card aparece no carrossel da categoria certa, no mesmo estilo dos atuais,
e o site é publicado sozinho.

Fora do escopo por enquanto: remover ou editar cards, revisão antes de publicar, criar categorias.

## Visão geral

```
Google Forms ──(ao enviar)──> Apps Script ──(API do GitHub, 1 commit)──> pendentes/<id>.json
                                                                              │
                                     .github/workflows/novo-card.yml <────────┘ (push em pendentes/**)
                                       │ scripts/processar-pendentes.mjs
                                       │   ├─ imagem -> public/portfolio/<pasta>/<slug>.webp
                                       │   ├─ card   -> src/data/portfolio.json
                                       │   └─ apaga o pendente
                                       │ npm run build (verificação)
                                       │ commit + push
                                       └─> dispara deploy.yml -> GitHub Pages
```

Tudo roda em planos gratuitos: Google Forms/Apps Script, GitHub Actions (repositório público) e
GitHub Pages.

## 1. Formulário (criado manualmente)

Título: "Novo card do portfólio". Configurações → Respostas → Coletar endereços de e-mail: **Verificado**.

| Título da pergunta (exato) | Tipo | Obrigatória | Observação |
|---|---|---|---|
| `Categoria` | Múltipla escolha | sim | `Substack`, `Em Todo Lugar`, `Além do Hype`, `Coberturas` |
| `Título` | Resposta curta | sim | |
| `Subtítulo` | Resposta curta | não | usado no Além do Hype |
| `Link` | Resposta curta | sim | validação: URL |
| `Imagem de capa` | Upload de arquivo | sim | só imagem, máx. 1 arquivo, 10 MB |

O script localiza as perguntas pelo título; renomear uma pergunta quebra a automação.

## 2. Dados do portfólio

Os dados saem de `src/data/portfolio.js` para `src/data/portfolio.json`. Cada categoria ganha os
campos `pasta` (subpasta de `public/portfolio/` usada para as imagens novas) e `novas`
(`"inicio"` ou `"fim"`). Caminhos de imagem ficam sem o prefixo de base.

```json
[
  {
    "nome": "Em Todo Lugar",
    "cor": "blue",
    "capa": "/portfolio/logo-emtodolugar.webp",
    "logo": true,
    "pasta": "emtodolugar",
    "novas": "inicio",
    "trabalhos": [
      { "title": "...", "href": "...", "image": "/portfolio/emtodolugar/flim.webp" }
    ]
  }
]
```

Regras atuais:

| Categoria | `pasta` | `novas` |
|---|---|---|
| Substack | `substack` | `fim` |
| Em Todo Lugar | `emtodolugar` | `inicio` |
| Além do Hype | `alemdohype` | `fim` |
| Coberturas | `coberturas` | `inicio` |

`src/data/portfolio.js` passa a importar o JSON e aplicar `withBase` em `capa` e `image`,
exportando `PORTFOLIO` com o mesmo formato de hoje. Os componentes não mudam. `subtitle` só é
gravado quando preenchido.

## 3. Apps Script (`automacao/apps-script/Codigo.gs`)

Versionado no repositório e colado no editor de script do formulário.

Propriedades do script (configuradas manualmente, nunca no código):
- `GITHUB_TOKEN`: token fine-grained com acesso só a `Erguimaraes30/Rafaella-Gama`, permissão
  Contents: read and write.

Constantes no código: repositório (`Erguimaraes30/Rafaella-Gama`), branch (`main`) e e-mails
autorizados (`enzorafael211205@gmail.com`, `sourafagama@gmail.com`).

Funções:
- `instalar()`: executada uma vez; cria o gatilho instalável "ao enviar formulário" apontando para
  `aoEnviar` (removendo gatilhos antigos da mesma função, para não duplicar).
- `aoEnviar(e)`:
  1. Lê o e-mail do respondente; se não estiver na lista autorizada, ignora o envio e avisa o dono
     do formulário por e-mail.
  2. Lê as respostas pelo título das perguntas e o arquivo enviado (`DriveApp.getFileById`).
  3. Monta o pendente `{ categoria, title, subtitle, href, enviadoPor, enviadoEm, imagem: { nome, mime, base64 } }`.
  4. Faz `PUT /repos/{repo}/contents/pendentes/<AAAA-MM-DDTHH-MM-SS>-<slug>.json` com a mensagem
     "Novo card: <título>".
  5. Em qualquer erro (resposta não 2xx, token ausente, arquivo ilegível), envia e-mail ao dono do
     formulário com o título da matéria e a mensagem de erro. Nada é publicado.

A imagem enviada é a miniatura que o Drive gera em JPG com até 1600px (`Drive.Files.get` →
`thumbnailLink`, serviço avançado Drive API), o que converte HEIC e mantém o repositório leve; se
ela não existir em ~15 s, vai o arquivo original. A imagem original permanece no Drive como backup.

## 4. Processamento (`scripts/processar-pendentes.mjs`)

Script Node (ESM) executado pela Action, também rodável localmente com `node scripts/processar-pendentes.mjs`.

Para cada `pendentes/*.json`, em ordem de nome (= ordem de envio):
1. Valida: categoria existe no `portfolio.json`; `title`, `href` e `imagem.base64` presentes;
   `href` começa com `http`; a imagem precisa ser legível (JPG, PNG ou WebP). Um pendente inválido é
   movido para `pendentes/rejeitados/` com o motivo em stderr; os válidos seguem normalmente.
2. Imagem: decodifica o base64 e passa pelo `sharp`: gira conforme o EXIF (`rotate`), corta bordas
   pretas uniformes (`trim`),
   redimensiona para caber em 1000×1000 sem ampliar, salva `.webp` com qualidade 80 em
   `public/portfolio/<pasta>/<slug>.webp`. O slug vem do título (minúsculas, sem acento, palavras
   separadas por hífen, até ~40 caracteres); se o arquivo existir, acrescenta `-2`, `-3`...
3. Card: `{ title, subtitle?, href, image }` inserido no início ou no fim de `trabalhos`,
   conforme `novas`.
4. Grava o `portfolio.json` (indentação de 2 espaços) e apaga o pendente.

Tudo é validado e convertido em memória antes de gravar. Imprime os títulos publicados (stdout)
para o log e a mensagem de commit; sai com código 2 quando houve rejeitados.

`sharp` entra em `devDependencies`.

## 5. Workflow (`.github/workflows/novo-card.yml`)

- Gatilhos: `push` em `main` com `paths: pendentes/**`, e `workflow_dispatch` (reprocessar).
- `concurrency: { group: novo-card, cancel-in-progress: false }`: envios seguidos entram em fila.
- Permissões: `contents: write`, `actions: write`.
- Passos: checkout → setup-node 22 com cache npm → `npm ci` → `node scripts/processar-pendentes.mjs`
  → `npm run build` → se houver mudanças: commit como `github-actions[bot]` com
  "Adiciona card: <título(s)>", `git pull --rebase` e push → `gh workflow run deploy.yml`.
- Pushes feitos com `GITHUB_TOKEN` não disparam outros workflows, por isso o deploy é disparado
  explicitamente; o próprio commit da Action também não redispara este workflow.

Com rejeitados: os válidos são publicados, o movimento para `pendentes/rejeitados/` entra no commit
e o último passo falha, para o GitHub notificar o dono do repositório por e-mail. O usuário apaga o
rejeitado e reenvia o formulário. Em outras falhas o pendente continua em `pendentes/` e pode ser
reprocessado com "Run workflow".

## Testes

- `scripts/processar-pendentes.mjs`: teste com `node --test` usando um pendente de exemplo (imagem
  pequena gerada no teste) num diretório temporário, verificando: arquivo `.webp` criado com até
  1000px, card inserido na posição certa para `inicio` e `fim`, `subtitle` omitido quando vazio,
  nome único quando o slug já existe, pendente apagado, categoria inválida falha sem alterar nada.
- Migração para JSON: `npm run build` passa e o `PORTFOLIO` gerado é idêntico ao atual (comparação
  feita uma vez durante a migração).
- Fim a fim: envio real pelo formulário com um card de teste, conferência no site no ar e remoção
  manual do card de teste.

## Configuração manual (usuário)

1. Criar o formulário (seção 1). ✅
2. Criar o token do GitHub. ✅
3. Colar `Codigo.gs` no editor de script do formulário e salvar o token em Propriedades do script.
4. Executar `instalar()` uma vez e autorizar.
