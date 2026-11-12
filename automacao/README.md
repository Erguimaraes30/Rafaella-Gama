# Formulário de novos cards do portfólio

Como funciona: um envio do Google Forms grava `pendentes/<data>-<título>.json` no repositório
(`apps-script/Codigo.gs`). O workflow `.github/workflows/novo-card.yml` converte a imagem, insere o
card em `src/data/portfolio.json` (`scripts/processar-pendentes.mjs`) e dispara o deploy. Em poucos
minutos o card aparece no site.

Só aceita envios de `enzorafael211205@gmail.com` e `sourafagama@gmail.com` (lista `AUTORIZADOS` no
`Codigo.gs`).

## Configuração (uma vez)

### Etapa 1 — criar o formulário

1. Em https://forms.google.com, crie um formulário **Em branco** chamado `Novo card do portfólio`.
2. **Configurações** → **Respostas** → **Coletar endereços de e-mail**: **Verificado**.
3. Crie as perguntas. Os títulos e as opções precisam ser **exatamente** estes (com acento e
   maiúsculas), porque o script procura as perguntas pelo título e as categorias pelo nome usado em
   `src/data/portfolio.json`:

   | Título da pergunta | Tipo | Configuração | Obrigatória |
   |---|---|---|---|
   | `Categoria` | Múltipla escolha | opções `Substack`, `Em Todo Lugar`, `Além do Hype`, `Coberturas` | sim |
   | `Título` | Resposta curta | | sim |
   | `Subtítulo` | Resposta curta | | não |
   | `Link` | Resposta curta | ⋮ → Validação de resposta → Texto → URL | sim |
   | `Imagem de capa` | Upload de arquivo | Permitir apenas tipos específicos → Imagem; máx. 1 arquivo; 10 MB | sim |

4. Na pergunta `Imagem de capa`, ⋮ → **Descrição**: `JPG, PNG ou WebP (fotos HEIC do iPhone não
   funcionam)`.

### Etapa 2 — criar o token do GitHub

1. https://github.com/settings/personal-access-tokens/new
2. **Token name**: `Formulário portfólio`; **Expiration**: a maior data permitida.
3. **Repository access**: **Only select repositories** → `Rafaella-Gama`.
4. **Permissions** → **Repository permissions** → **Contents**: **Read and write**.
5. **Generate token** e copie (começa com `github_pat_`; só aparece uma vez). Não cole o token em
   nenhum arquivo do repositório.

### Etapa 3 — colar o script e guardar o token

1. Abra o formulário no modo de edição.
2. Clique nos **três pontinhos (⋮)** no canto superior direito → **Editor de script**. Abre o
   Apps Script num projeto novo, já ligado ao formulário.
3. Clique em "Projeto sem título" e renomeie para `Portfólio - novos cards`.
4. Apague o conteúdo do arquivo `Código.gs` e cole todo o conteúdo de
   [`apps-script/Codigo.gs`](apps-script/Codigo.gs). Salve (Ctrl+S).
5. No menu da esquerda, clique na **engrenagem (Configurações do projeto)** → role até
   **Propriedades do script** → **Adicionar propriedade do script**:
   - Propriedade: `GITHUB_TOKEN`
   - Valor: o token que começa com `github_pat_`
6. Clique em **Salvar propriedades do script**.

### Etapa 4 — ativar

1. Volte para o **Editor** (ícone `< >` na esquerda).
2. Na barra de cima, escolha a função **`instalar`** e clique em **Executar**.
3. O Google pede autorização: **Revisar permissões** → escolha sua conta.
   - Vai aparecer "O Google não verificou este app". É normal, porque o app é seu: clique em
     **Avançado** → **Acessar Portfólio - novos cards (não seguro)** → **Permitir**.
4. No **Registro de execução**, deve aparecer `Tudo certo: o token acessa Erguimaraes30/Rafaella-Gama.`
   Se aparecer erro, confira o token (Etapa 3, passo 5).

Pronto. O link do formulário (botão **Enviar** → ícone de link) pode ser salvo nos favoritos.

## Uso no dia a dia

- Envie o formulário. Em 2–4 minutos o card aparece no site (às vezes precisa de Ctrl+F5).
- Ordem no carrossel: **Em Todo Lugar** e **Coberturas** recebem as novas no começo;
  **Além do Hype** e **Substack**, no fim.
- Para remover ou editar um card: apague ou altere a entrada em `src/data/portfolio.json` e a imagem
  em `public/portfolio/<pasta>/`.

## Quando algo dá errado

- **E-mail "[Portfólio] Falha ao enviar o card"**: o envio não chegou ao GitHub (token vencido,
  GitHub fora do ar…). Corrija o motivo indicado e envie o formulário de novo. Token vencido: gere um
  novo e troque o valor de `GITHUB_TOKEN` (Etapa 3, passos 5–6).
- **E-mail do GitHub "Run failed: Novo card do formulário"**: algum envio chegou, mas foi rejeitado
  (categoria ou link inválido, imagem em formato não suportado como HEIC). Os outros envios são
  publicados normalmente. O motivo está no log do passo `processar`, e o envio rejeitado fica em
  `pendentes/rejeitados/`: apague esse arquivo pelo GitHub e envie o formulário de novo, corrigido.
- **Formato da imagem**: use JPG, PNG ou WebP. Fotos do iPhone em HEIC não são aceitas; ao escolher
  a foto pelo celular, o iPhone normalmente já converte para JPG.
- **Renomeou uma pergunta do formulário?** O script procura as perguntas pelo título exato; volte
  ao nome original ou ajuste `PERGUNTAS` no `Codigo.gs`.
