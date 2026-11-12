// Apps Script do formulário "Novo card do portfólio".
// A cada envio, grava pendentes/<data>-<slug>.json no repositório; o workflow novo-card.yml
// transforma isso em card + imagem e publica o site. Instalação: automacao/README.md.
// O token do GitHub fica em Configurações do projeto → Propriedades do script → GITHUB_TOKEN.

const REPO = 'Erguimaraes30/Rafaella-Gama';
const BRANCH = 'main';
const AUTORIZADOS = ['enzorafael211205@gmail.com', 'sourafagama@gmail.com'];
const PERGUNTAS = {
  categoria: 'Categoria',
  titulo: 'Título',
  subtitulo: 'Subtítulo',
  link: 'Link',
  imagem: 'Imagem de capa'
};

// Rodar uma vez, pelo editor, para ligar o gatilho "ao enviar formulário".
function instalar() {
  ScriptApp.getProjectTriggers()
    .filter(gatilho => gatilho.getHandlerFunction() === 'aoEnviar')
    .forEach(gatilho => ScriptApp.deleteTrigger(gatilho));
  ScriptApp.newTrigger('aoEnviar').forForm(FormApp.getActiveForm()).onFormSubmit().create();
  testarConexao();
}

// Confere se o token consegue acessar o repositório. Pode ser rodado a qualquer momento pelo editor.
function testarConexao() {
  const resposta = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO, {
    headers: cabecalhosGitHub(),
    muteHttpExceptions: true
  });
  if (resposta.getResponseCode() !== 200) {
    throw new Error('GitHub respondeu ' + resposta.getResponseCode() + ': ' + resposta.getContentText());
  }
  Logger.log('Tudo certo: o token acessa ' + REPO + '.');
}

function aoEnviar(e) {
  let titulo = '(sem título)';
  try {
    const email = (e.response.getRespondentEmail() || '').toLowerCase();
    if (AUTORIZADOS.indexOf(email) === -1) {
      avisar('Envio ignorado: e-mail não autorizado',
        'O formulário recebeu um envio de "' + (email || 'e-mail não coletado') + '", que não está na lista de autorizados. Nada foi publicado.');
      return;
    }

    const respostas = {};
    e.response.getItemResponses().forEach(item => {
      respostas[item.getItem().getTitle()] = item.getResponse();
    });
    titulo = String(respostas[PERGUNTAS.titulo] || '').trim() || titulo;

    const arquivos = respostas[PERGUNTAS.imagem];
    if (!arquivos || !arquivos.length) throw new Error('Nenhuma imagem foi enviada.');
    const blob = DriveApp.getFileById(arquivos[0]).getBlob();

    const pendente = {
      categoria: respostas[PERGUNTAS.categoria],
      title: respostas[PERGUNTAS.titulo],
      subtitle: respostas[PERGUNTAS.subtitulo] || '',
      href: respostas[PERGUNTAS.link],
      enviadoPor: email,
      enviadoEm: new Date().toISOString(),
      imagem: { nome: blob.getName(), mime: blob.getContentType(), base64: Utilities.base64Encode(blob.getBytes()) }
    };

    const carimbo = Utilities.formatDate(new Date(), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH-mm-ss");
    const caminho = 'pendentes/' + carimbo + '-' + slugify(titulo) + '.json';
    const resposta = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO + '/contents/' + caminho, {
      method: 'put',
      contentType: 'application/json',
      headers: cabecalhosGitHub(),
      payload: JSON.stringify({
        message: 'Novo card: ' + titulo,
        content: Utilities.base64Encode(JSON.stringify(pendente), Utilities.Charset.UTF_8),
        branch: BRANCH
      }),
      muteHttpExceptions: true
    });
    if (resposta.getResponseCode() >= 300) {
      throw new Error('GitHub respondeu ' + resposta.getResponseCode() + ': ' + resposta.getContentText());
    }
  } catch (erro) {
    avisar('Falha ao enviar o card "' + titulo + '"',
      'O card não foi publicado.\n\nMotivo: ' + erro.message +
      '\n\nA resposta continua salva no formulário. Depois de corrigir, envie o formulário de novo.');
  }
}

function cabecalhosGitHub() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('A propriedade GITHUB_TOKEN não está configurada no projeto do Apps Script.');
  return {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function avisar(assunto, corpo) {
  MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[Portfólio] ' + assunto, corpo);
}

// Mesmo critério do scripts/processar-pendentes.mjs; aqui só nomeia o arquivo pendente.
function slugify(texto) {
  const slug = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘`´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  return slug || 'card';
}
