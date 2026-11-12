import { withBase } from '../lib/base';
import dados from './portfolio.json';

// Os cards ficam em portfolio.json (editado à mão ou pelo formulário, via scripts/processar-pendentes.mjs).
// Cada categoria do menu do portfólio:
// `capa`: imagem do card; logos (`logo: true`) ficam inteiros sobre fundo branco.
// `pasta`: subpasta de public/portfolio/ das imagens novas; `novas`: 'inicio' ou 'fim' do carrossel.
// `trabalhos`: slides do carrossel, no formato { title, subtitle?, href, image }.
// Os caminhos no JSON são relativos à raiz do site; aqui recebem a base do GitHub Pages.
export const PORTFOLIO = dados.map(categoria => ({
  ...categoria,
  capa: withBase(categoria.capa),
  trabalhos: categoria.trabalhos.map(trabalho => ({ ...trabalho, image: withBase(trabalho.image) }))
}));
