// Textos do aviso de privacidade e dos termos de uso, abertos pelo rodapé.
// Revisar com um profissional de direito antes de publicar e sempre que o site mudar
// (ex.: se entrar formulário, analytics, cookies ou incorporação de vídeos).
const EMAIL = 'sourafagama@gmail.com';
const ATUALIZADO = 'Atualizado em outubro de 2026.';

export const PRIVACIDADE = {
  titulo: 'Aviso de privacidade',
  atualizado: ATUALIZADO,
  secoes: [
    {
      titulo: 'O que este site coleta',
      texto: [
        'Este é um portfólio pessoal. Ele não tem formulários, cadastro, cookies de rastreamento nem ferramentas de análise de audiência, e não coleta dados pessoais de quem visita.',
        'As fontes, imagens e demais arquivos são servidos pelo próprio site: abrir a página não envia seus dados a outras empresas.'
      ]
    },
    {
      titulo: 'Hospedagem',
      texto: [
        'Como em qualquer site, o serviço de hospedagem pode registrar dados técnicos de acesso (como endereço IP, navegador e horário) para segurança e funcionamento, de acordo com as políticas desse provedor.'
      ]
    },
    {
      titulo: 'Quando você entra em contato',
      texto: [
        'Se você escrever por e-mail, WhatsApp ou redes sociais, as informações que enviar serão usadas apenas para responder à sua mensagem e não serão compartilhadas com terceiros.',
        `Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode pedir acesso, correção ou exclusão desses dados pelo e-mail ${EMAIL}.`
      ]
    },
    {
      titulo: 'Links para outros sites',
      texto: [
        'Os links para WhatsApp, Instagram, LinkedIn, TikTok, Substack e veículos onde os trabalhos foram publicados levam a serviços de terceiros, que têm políticas de privacidade próprias.'
      ]
    }
  ]
};

export const TERMOS = {
  titulo: 'Termos de uso',
  atualizado: ATUALIZADO,
  secoes: [
    {
      titulo: 'Autoria',
      texto: [
        'Os textos, reportagens, críticas e demais materiais apresentados aqui são de autoria de Rafaella Gama, salvo indicação em contrário, e são protegidos pela Lei de Direitos Autorais (Lei nº 9.610/1998).',
        'A coluna Além do Hype é escrita em parceria por Rafaella Gama e Leticia Alves, coautoras dos textos publicados nela.',
        'Não é permitido reproduzir, copiar ou republicar esse conteúdo, no todo ou em parte, sem autorização. Citações curtas são bem-vindas, desde que com crédito à autoria e link para a fonte.'
      ]
    },
    {
      titulo: 'Conteúdo e marcas de terceiros',
      texto: [
        'Logotipos, nomes de veículos e plataformas (como Substack e Em Todo Lugar), capas de matérias e fotografias de terceiros pertencem aos seus respectivos titulares.',
        'Eles aparecem apenas para identificar onde cada trabalho foi publicado e não indicam patrocínio, parceria comercial ou endosso.'
      ]
    },
    {
      titulo: 'Pessoas retratadas',
      texto: [
        'As imagens de coberturas mostram eventos acompanhados em contexto jornalístico e são exibidas como registro do trabalho realizado.',
        `Se você aparece em alguma imagem, é titular de algum conteúdo exibido aqui ou quer corrigir um crédito, escreva para ${EMAIL} e o pedido será analisado e respondido.`
      ]
    },
    {
      titulo: 'Opinião e links externos',
      texto: [
        'Textos de opinião e crítica refletem a visão da autora na data em que foram publicados.',
        'Os links levam a sites de terceiros, cujo conteúdo e disponibilidade não são de responsabilidade deste portfólio.'
      ]
    },
    {
      titulo: 'Alterações',
      texto: ['Estes termos podem ser atualizados a qualquer momento; a data da última versão aparece abaixo do título.']
    }
  ]
};
