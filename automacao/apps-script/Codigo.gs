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
// A imagem vai como JPG de até este lado (o site usa até 1000px). Converte HEIC do iPhone e evita
// guardar a foto original, pesada, no histórico do repositório.
const LADO_ENVIO = 1600;

// Rodar uma vez, pelo editor, para ligar o gatilho "ao enviar formulário".
function instalar() {
  ScriptApp.getProjectTriggers()
    .filter(gatilho => gatilho.getHandlerFunction() === 'aoEnviar')
    .forEach(gatilho => ScriptApp.deleteTrigger(gatilho));
  ScriptApp.newTrigger('aoEnviar').forForm(FormApp.getActiveForm()).onFormSubmit().create();
  testarConexao();
}

// Confere o serviço do Drive e se o token consegue acessar o repositório. Pode ser rodado a qualquer
// momento pelo editor.
function testarConexao() {
  if (typeof Drive === 'undefined') {
    throw new Error('Falta adicionar o serviço "Drive API" (menu Serviços, no editor). Veja automacao/README.md.');
  }
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
    const blob = imagemParaEnvio(arquivos[0]);

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

// Versão JPG reduzida que o próprio Drive gera (a miniatura, pedida no tamanho LADO_ENVIO).
// Logo após o upload o Drive pode levar um tempo para gerá-la: tenta por até ~90 s (o gatilho pode
// rodar por 6 min) e, se não vier, envia o original.
function imagemParaEnvio(id) {
  const original = DriveApp.getFileById(id);
  try {
    const cabecalho = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
    for (let tentativa = 0; tentativa < 18; tentativa++) {
      const link = Drive.Files.get(id, { fields: 'thumbnailLink' }).thumbnailLink;
      if (link) {
        const resposta = UrlFetchApp.fetch(link.replace(/=s\d+$/, '=s' + LADO_ENVIO), {
          headers: cabecalho,
          muteHttpExceptions: true
        });
        if (resposta.getResponseCode() === 200) {
          return resposta.getBlob().setName(original.getName().replace(/\.[^.]+$/, '') + '.jpg');
        }
        Logger.log('Tentativa ' + (tentativa + 1) + ': miniatura respondeu ' + resposta.getResponseCode());
      } else {
        Logger.log('Tentativa ' + (tentativa + 1) + ': o Drive ainda não tem miniatura');
      }
      Utilities.sleep(5000);
    }
    Logger.log('Miniatura indisponível, enviando o original.');
  } catch (erro) {
    Logger.log('Miniatura indisponível, enviando o original: ' + erro.message);
  }
  return original.getBlob();
}

// Diagnóstico: mostra no registro como o Drive responde para a imagem do último envio do formulário.
// Não envia nada ao GitHub. Rodar pelo editor quando a imagem chegar sem ser reduzida.
function diagnosticarImagem() {
  const respostas = FormApp.getActiveForm().getResponses();
  const ultima = respostas[respostas.length - 1];
  const item = ultima.getItemResponses().find(r => r.getItem().getTitle() === PERGUNTAS.imagem);
  const id = item.getResponse()[0];
  const arquivo = DriveApp.getFileById(id);
  Logger.log('Arquivo: ' + arquivo.getName() + ' | ' + arquivo.getMimeType() + ' | ' + Math.round(arquivo.getSize() / 1024) + ' KB');
  const info = Drive.Files.get(id, { fields: 'thumbnailLink,hasThumbnail,mimeType' });
  Logger.log('Drive.Files.get: ' + JSON.stringify(info));
  const token = ScriptApp.getOAuthToken();
  const testar = (nome, url, comToken) => {
    try {
      const r = UrlFetchApp.fetch(url, {
        headers: comToken ? { Authorization: 'Bearer ' + token } : {},
        muteHttpExceptions: true,
        followRedirects: true
      });
      Logger.log(nome + ': ' + r.getResponseCode() + ' | ' + (r.getHeaders()['Content-Type'] || '?') + ' | ' + Math.round(r.getContent().length / 1024) + ' KB');
    } catch (erro) {
      Logger.log(nome + ': erro ' + erro.message);
    }
  };
  if (info.thumbnailLink) {
    testar('miniatura original com token', info.thumbnailLink, true);
    testar('miniatura grande com token', info.thumbnailLink.replace(/=s\d+$/, '=s' + LADO_ENVIO), true);
    testar('miniatura grande sem token', info.thumbnailLink.replace(/=s\d+$/, '=s' + LADO_ENVIO), false);
    Logger.log('Final do link: ' + info.thumbnailLink.slice(-30));
  }
  testar('drive.google.com/thumbnail', 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + LADO_ENVIO, true);
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
