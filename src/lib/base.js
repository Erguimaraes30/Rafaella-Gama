// O site é publicado numa subpasta (GitHub Pages: /Rafaella-Gama/). Estes helpers prefixam
// arquivos de public/ e rotas com essa base, e fazem o caminho inverso ao ler a URL.
const BASE = import.meta.env.BASE_URL;

export const withBase = path => BASE + path.replace(/^\//, '');

export const stripBase = pathname => '/' + (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, ''));
