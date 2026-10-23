import StaggeredMenu from './StaggeredMenu/StaggeredMenu';
import NavLink, { scrollToPath } from './NavLink';
import { CONTATOS } from '../data/contatos';
import { withBase } from '../lib/base';

const ITENS = [
  { label: 'Início', rota: '/' },
  { label: 'Sobre mim', rota: '/sobre' },
  { label: 'Portfólio', link: '#trabalhos' },
  { label: 'Contato', rota: '/contato' }
].map(item => (item.rota ? { ...item, link: withBase(item.rota) } : item));

const REDES = CONTATOS.map(({ title, href, ariaLabel }) => ({ label: title, link: href, ariaLabel }));

// Rotas internas (/sobre, /contato) rolam até a seção sem recarregar, como no NavLink.
const navegar = (item, event) => {
  if (!item.rota) return;
  event.preventDefault();
  history.pushState(null, '', item.link);
  scrollToPath(item.rota, '', true);
};

export default function Header() {
  return (
    <StaggeredMenu
      isFixed
      className="header"
      position="right"
      items={ITENS}
      socialItems={REDES}
      displayItemNumbering={false}
      colors={['#ff9ec7', '#fff1a6']}
      accentColor="#d6336c"
      menuButtonColor="#1c1917"
      openMenuButtonColor="#1c1917"
      changeMenuColorOnOpen={false}
      menuLabel="Menu"
      closeLabel="Fechar"
      socialsTitle="Redes"
      ariaLabel="Cabeçalho"
      onItemClick={navegar}
      logo={
        <NavLink className="header__logo" href="/" aria-label="Rafaella Gama, início">
          rafaella <span aria-hidden="true">.</span> gama
        </NavLink>
      }
    />
  );
}
