import { withBase } from '../lib/base';

// Cada categoria do menu do portfólio.
// `capa`: imagem do card; logos (`logo: true`) ficam inteiros sobre fundo branco.
// `trabalhos`: slides do carrossel, no formato { title, href, image, alt }.
export const PORTFOLIO = [
  {
    nome: 'Substack',
    cor: 'yellow',
    capa: withBase('/portfolio/substacklogo.webp'),
    logo: true,
    trabalhos: [
      {
        title: 'Batom, salto alto e mini-saia: como esses três itens se relacionam diretamente à economia?',
        href: 'https://substack.com/@rafwaella/p-195911159',
        image: withBase('/portfolio/substack/materia1substack.webp')
      },
      {
        title: 'Adaptações literárias, comédias românticas e musicais: obras voltadas ao público feminino são o que realmente dá dinheiro?',
        href: 'https://substack.com/@rafwaella/p-201190585',
        image: withBase('/portfolio/substack/materia2substack.webp')
      },
      {
        title: 'Não importa quão perfeito o seu relacionamento seja: ele não vai te salvar de você mesma',
        href: 'https://substack.com/@rafwaella/p-202294930',
        image: withBase('/portfolio/substack/materia3substack.webp')
      },
      {
        title: 'Nostalgia: a maior vilã da geração Z',
        href: 'https://substack.com/@rafwaella/p-212012055',
        image: withBase('/portfolio/substack/materia4substack.webp')
      },
      {
        title: 'A Era do ‘Instagram Face’',
        href: 'https://substack.com/@rafwaella/p-214784189',
        image: withBase('/portfolio/substack/materia5substack.webp')
      },
      {
        title: 'Quem te convenceu que fofoca é algo ruim?',
        href: 'https://substack.com/@rafwaella/p-216030013',
        image: withBase('/portfolio/substack/materia6substack.webp')
      },
      {
        title: 'As pessoas não querem ler, só querem falar que leem',
        href: 'https://substack.com/@rafwaella/p-216308490',
        image: withBase('/portfolio/substack/materia7substack.webp')
      }
    ]
  },
  {
    nome: 'Em Todo Lugar',
    cor: 'blue',
    capa: withBase('/portfolio/logo-emtodolugar.webp'),
    logo: true,
    trabalhos: [
      {
        title: 'Victoria’s Secret Fashion Show 2026: veja os destaques do desfile',
        href: 'https://emtodolugar.facha.edu.br/2026/10/20/victorias-secret-fashion-show-2026-veja-os-destaques-do-desfile/',
        image: withBase('/portfolio/emtodolugar/victoriasecretfashionshow_moda.webp')
      },
      {
        title: 'Dia do Consumo Consciente: como a geração Z está mudando, aos poucos, a maneira como se consome moda nas redes sociais',
        href: 'https://emtodolugar.facha.edu.br/2026/10/15/dia-do-consumo-consciente-como-a-geracao-z-esta-mudando-aos-poucos-a-maneira-como-se-consome-moda-nas-redes-sociais/',
        image: withBase('/portfolio/emtodolugar/diadoconsumo_comportamento.webp')
      },
      {
        title: 'De craque de futebol a influencer literário: como um passatempo de Gustavo Scarpa mobilizou torcedores e reacendeu o debate sobre hábitos de leitura no Brasil',
        href: 'https://emtodolugar.facha.edu.br/2026/10/13/de-craque-de-futebol-a-influencer-literario-como-um-passatempo-de-gustavo-scarpa-mobilizou-torcedores-e-reacendeu-o-debate-sobre-habitos-de-leitura-no-brasil/',
        image: withBase('/portfolio/emtodolugar/scarpa_cultura.webp')
      },
      {
        title: 'Victoria’s Secret anuncia atrações do próximo desfile: relembre os shows mais icônicos',
        href: 'https://emtodolugar.facha.edu.br/2026/09/29/victorias-secret-anuncia-atracoes-do-proximo-desfile-relembre-os-shows-mais-iconicos/',
        image: withBase('/portfolio/emtodolugar/victoriasecretsanuncia.webp')
      },
      {
        title: 'Pedro Sampaio, Ricky Martin e as Dallas Cowboys Cheerleaders no half-time show da NFL Brasil',
        href: 'https://emtodolugar.facha.edu.br/2026/09/29/pedro-sampaio-ricky-martin-e-as-dallas-cowboys-cheerleaders-no-half-time-show-da-nfl-brasil/',
        image: withBase('/portfolio/emtodolugar/pedrosampaio_entretenimento.webp')
      },
      {
        title: 'Turismo cinematográfico: 8 filmes para inspirar a sua próxima viagem',
        href: 'https://emtodolugar.facha.edu.br/2026/09/27/turismo-cinematografico-8-filmes-para-inspirar-a-sua-proxima-viagem/',
        image: withBase('/portfolio/emtodolugar/turismocinematografico_cinema.webp')
      },
      {
        title: 'e.l.f. no Brasil: As marcas internacionais finalmente começaram a valorizar o público brasileiro?',
        href: 'https://emtodolugar.facha.edu.br/2026/09/25/e-l-f-no-brasil-as-marcas-internacionais-finalmente-comecaram-a-valorizar-o-publico-brasileiro/',
        image: withBase('/portfolio/emtodolugar/elfBrasil_beleza.webp')
      },
      {
        title: '‘O Conto da Aia’ e a importância do direito à contracepção',
        href: 'https://emtodolugar.facha.edu.br/2026/09/24/o-conto-da-aia-e-a-importancia-do-direito-a-contracepcao/',
        image: withBase('/portfolio/emtodolugar/contodaaia.webp')
      },
      {
        title: 'O limite entre a ficção e a realidade na Bienal do Livro',
        href: 'https://emtodolugar.facha.edu.br/2026/09/21/o-limite-entre-a-ficcao-e-a-realidade-na-bienal-do-livro/',
        image: withBase('/portfolio/emtodolugar/bienal.webp')
      },
      {
        title: 'Sete adaptações literárias que você precisa conhecer',
        href: 'https://emtodolugar.facha.edu.br/2026/09/07/sete-adaptacoes-literarias-que-voce-precisa-conhecer/',
        image: withBase('/portfolio/emtodolugar/sete-adaptacoes.webp')
      }
    ]
  },
  { nome: 'Além do Hype', cor: 'pink', capa: withBase('/portfolio/logo-alem-do-hype.webp'), logo: true,
    trabalhos: [
      {
        title: '#1 Além do Hype',
        subtitle: 'A forma como Lili Reinhart divulgou “A Hipótese do Amor” movimentou as redes sociais',
        href: 'https://emtodolugar.facha.edu.br/2026/09/25/1-alem-do-hype/',
        image: withBase('/portfolio/alemdohype/materia1alem.webp')
      },
      {
        title: '#2 Além do Hype',
        subtitle: 'VMA 2026: confira os destaques da premiação',
        href: 'https://emtodolugar.facha.edu.br/2026/10/02/2-alem-do-hype/',
        image: withBase('/portfolio/alemdohype/materia2alem.webp')
      },
      {
        title: '#3 Além do Hype',
        subtitle: 'Adaptações literárias com elenco confirmado',
        href: 'https://emtodolugar.facha.edu.br/2026/10/09/3-alem-do-hype/',
        image: withBase('/portfolio/alemdohype/materia3alem.webp')
      },
      {
        title: '#4 Além do Hype',
        subtitle: 'Colaborações musicais que pararam o mundo do entretenimento',
        href: 'https://emtodolugar.facha.edu.br/2026/10/16/4-alem-do-hype/',
        image: withBase('/portfolio/alemdohype/materia4alem.webp')
      }
    ]
  },
  {
    nome: 'Coberturas',
    cor: 'yellow',
    capa: withBase('/retrato-sobremim.webp'),
    trabalhos: [
      {
        title:
          'Cerimônia de posse do auditor fiscal Júlio César Carvalho de Araújo como novo chefe da Alfândega da Receita Federal no Aeroporto Internacional do Rio de Janeiro',
        href: 'https://www.instagram.com/reel/DeICscqv5rI/',
        image: withBase('/portfolio/coberturas/reportagemmanchete-2.webp')
      },
      {
        title: 'Feira Literária da Magistratura (FLIMAG), realizada no Tribunal de Justiça do Rio de Janeiro.',
        href: 'https://www.instagram.com/reel/DeMlSdAOfDM/',
        image: withBase('/portfolio/coberturas/reportagemmanchete-1.webp')
      },
      {
        title: 'Academia LED na UniFacha: Os bastidores da cobertura esportiva multiplataforma',
        href: 'https://emtodolugar.facha.edu.br/2026/10/22/academia-led-na-unifacha-os-bastidores-da-cobertura-esportiva-multiplataforma/',
        image: withBase('/portfolio/coberturas/academialednafacha.webp')
      },
      {
        title: 'Social media para o evento Moostra de cinema',
        href: 'https://www.instagram.com/mo.ostra',
        image: withBase('/portfolio/coberturas/capaCoberturas.webp')
      },
      {
        title: 'Editora do jornal InForme para a matéria Planejamento Gráfico e Visual',
        href: 'https://online.fliphtml5.com/jsyds/dmzc/#p=1',
        image: withBase('/portfolio/coberturas/editoraJornal.webp')
      }
    ]
  }
];
