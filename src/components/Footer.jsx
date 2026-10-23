import { useRef } from 'react';
import LegalModal from './LegalModal';
import { PRIVACIDADE, TERMOS } from '../data/legal';

export default function Footer() {
  const privacidadeRef = useRef(null);
  const termosRef = useRef(null);

  return (
    <footer className="footer">
      <p>© 2026 — fim da matéria · por Rafaella Gama </p>
      <ul className="footer__links">
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => privacidadeRef.current?.showModal()}>
            Privacidade
          </button>
        </li>
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => termosRef.current?.showModal()}>
            Termos de uso
          </button>
        </li>
      </ul>
      <LegalModal ref={privacidadeRef} id="privacidade-titulo" doc={PRIVACIDADE} />
      <LegalModal ref={termosRef} id="termos-titulo" doc={TERMOS} />
    </footer>
  );
}
