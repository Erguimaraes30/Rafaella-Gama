import { useRef } from 'react';
import ReflectiveCard from './ReflectiveCard/ReflectiveCard';
import SoftAurora from './SoftAurora/SoftAurora';
import TrajetoriaModal from './TrajetoriaModal';
import { withBase } from '../lib/base';

export default function About() {
  const modalRef = useRef(null);

  return (
    <section id="sobre" className="about" aria-labelledby="sobre-titulo">
      <div className="about__bg" aria-hidden="true">
        <SoftAurora
          lightMode
          color1="#fff1a6"
          color2="#fff1a6"
          spectrum={0}
          speed={0.4}
          brightness={1.2}
          bandSpread={0.55}
          opacity={1}
        />
      </div>
      <div className="about__layout">
        <div className="about__card">
          <ReflectiveCard theme="light" width="100%" height="100%" radius={10}>
            <img className="about__photo" src={withBase('/retratocardsobremim.jpeg')} alt="Retrato de Rafaella Gama" />
          </ReflectiveCard>
        </div>
        <div className="about__inner">
          <h2 id="sobre-titulo" className="about__highlight">
            Extrovertida, criativa e <mark className="hl hl--blue">apaixonada</mark> por comunicação.
          </h2>
          <p className="about__text">
            Sou Rafaella do Nascimento Gama, tenho 21 anos, moro no Rio de Janeiro e estou cursando
            Jornalismo na UNIFACHA. Escrevo sobre cultura, gênero e mídia em um espaço próprio no
            Substack, onde desenvolvo uma voz autoral e crítica. Também escrevo para a coluna geral do
            Em Todo Lugar, da FACHA, e assino minha própria coluna, ‘Além do Hype’, no mesmo portal.
          </p>
          <button
            type="button"
            className="about__bar"
            aria-haspopup="dialog"
            onClick={() => modalRef.current?.showModal()}
          >
            <span>Minha Trajetória</span>
            <span className="about__bar-icon" aria-hidden="true">+</span>
          </button>
        </div>
      </div>
      <TrajetoriaModal ref={modalRef} />
    </section>
  );
}
