import { withBase } from '../lib/base';

// As rotas /sobre e /contato apontam para seções da página única.
const SECTION_BY_PATH = { '/sobre': 'sobre', '/contato': 'contato' };

export function scrollToPath(path, hash = '', smooth = false) {
  const id = hash.slice(1) || SECTION_BY_PATH[path];
  const target = id && document.getElementById(id);
  const behavior = smooth ? 'smooth' : 'auto';
  if (target) target.scrollIntoView({ behavior });
  else if (path === '/') window.scrollTo({ top: 0, behavior });
}

export default function NavLink({ href, ...props }) {
  const handleClick = event => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, '', withBase(href));
    scrollToPath(href, '', true);
  };
  return <a href={withBase(href)} onClick={handleClick} {...props} />;
}
