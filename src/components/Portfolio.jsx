import { useEffect, useRef, useState } from 'react';
import OptionWheel from './OptionWheel/OptionWheel';
import ReflectiveCard from './ReflectiveCard/ReflectiveCard';
import GhostFibers from './GhostFibers/GhostFibers';
import Noise from './Noise/Noise';
import PortfolioModal from './PortfolioModal';
import useMatchMedia from '../hooks/useMatchMedia';
import { PORTFOLIO } from '../data/portfolio';

const NOMES = PORTFOLIO.map(c => c.nome);
const MOBILE = '(max-width: 860px)';
// Largura do rótulo mais longo (em negrito), em "em": a fonte da roda se ajusta para ele caber.
const ROTULO_EM = 12.6;
// Tom mais forte de cada cor do site, para as fibras aparecerem sobre o fundo claro.
const FIBRA = { pink: '#e0457f', yellow: '#d39b00', blue: '#2f86d4' };

export default function Portfolio() {
  const [ativo, setAtivo] = useState(0);
  const [montado, setMontado] = useState(false);
  const modalRef = useRef(null);
  const mobile = useMatchMedia(MOBILE);
  const [wheelW, setWheelW] = useState(0);
  const wheelRef = useRef(null);
  const categoria = PORTFOLIO[ativo];

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setWheelW(entry.contentRect.width));
    ro.observe(wheelRef.current);
    return () => ro.disconnect();
  }, []);

  const inset = mobile ? 16 : 24;
  const fontSize = wheelW ? Math.min(2.6, Math.max(0.95, (wheelW - inset - 12) / ROTULO_EM / 16)) : 1;

  const abrir = () => {
    setMontado(true);
    modalRef.current?.showModal();
  };

  return (
    <section id="trabalhos" className="portfolio" aria-labelledby="portfolio-titulo">
      <div className={`portfolio__bg portfolio__bg--${categoria.cor}`} aria-hidden="true">
        <GhostFibers
          lightMode
          glowColor={FIBRA[categoria.cor]}
          threads={mobile ? 48 : 64}
          rotation={-14}
          speed={0.35}
          flow={0.3}
          particles={0.4}
          sparkle={0.3}
          depthOfField={0.6}
          brightness={1.1}
          vignette={0.4}
          grain={0}
          hoverEffect="part"
          pulseOnClick={false}
        />
        <Noise opacity={0.14} fps={12} blendMode="soft-light" />
      </div>
      <div className="section portfolio__inner">
        <h2 id="portfolio-titulo" className="section__title">Portfólio</h2>
        <div className="portfolio__layout">
          <div ref={wheelRef} className="portfolio__wheel" style={{ '--hl': `var(--${categoria.cor})` }}>
            <OptionWheel
              items={NOMES}
              defaultSelected={0}
              onChange={setAtivo}
              ariaLabel="Categorias do portfólio"
              textColor="#1c1917"
              activeColor="#1c1917"
              fontSize={fontSize}
              spacing={mobile ? 1.9 : 1.75}
              tilt={mobile ? 7 : 9}
              blur={1.5}
              fade={0.3}
              inset={inset}
              smoothing={180}
              scrollable={false}
              draggable={false}
            />
          </div>
          <div
            key={ativo}
            className={`portfolio__card portfolio__card--${categoria.cor}${categoria.logo ? ' portfolio__card--logo' : ''}`}
            onClick={abrir}
          >
            <ReflectiveCard theme="light" width="100%" height="100%" radius={10} intro={false}>
              <img className="portfolio__cover" src={categoria.capa} alt={categoria.nome} />
            </ReflectiveCard>
            <button
              type="button"
              className="portfolio__cta"
              aria-haspopup="dialog"
              aria-label={`Clique aqui: ${categoria.nome}`}
              onClick={event => {
                event.stopPropagation();
                abrir();
              }}
            >
              Clique Aqui
            </button>
          </div>
        </div>
      </div>
      <PortfolioModal ref={modalRef} categoria={categoria} montado={montado} compacto={mobile} />
    </section>
  );
}
