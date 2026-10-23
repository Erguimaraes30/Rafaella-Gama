import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import OptionWheel from './OptionWheel/OptionWheel';
import ReflectiveCard from './ReflectiveCard/ReflectiveCard';
import Noise from './Noise/Noise';
import PortfolioModal from './PortfolioModal';
import useMatchMedia from '../hooks/useMatchMedia';
import { DPR_DESTAQUE, DPR_FUNDO, MODESTO } from '../lib/perf';
import { PORTFOLIO } from '../data/portfolio';

// Fundo decorativo: chunk próprio, carregado depois do conteúdo principal.
const GhostFibers = lazy(() => import('./GhostFibers/GhostFibers'));

const NOMES = PORTFOLIO.map(c => c.nome);
const MOBILE = '(max-width: 860px)';
// Largura do rótulo mais longo (em negrito), em "em": a fonte da roda se ajusta para ele caber.
const ROTULO_EM = 12.6;
// Tom mais forte de cada cor do site, para as fibras aparecerem sobre o fundo claro.
const FIBRA = { pink: '#e0457f', yellow: '#d39b00', blue: '#2f86d4' };

export default function Portfolio() {
  const [ativo, setAtivo] = useState(0);
  const [montado, setMontado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const modalRef = useRef(null);
  const mobile = useMatchMedia(MOBILE);
  const [wheelW, setWheelW] = useState(0);
  const wheelRef = useRef(null);
  const cardRef = useRef(null);
  const primeiraRef = useRef(true);
  const categoria = PORTFOLIO[ativo];

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setWheelW(entry.contentRect.width));
    ro.observe(wheelRef.current);
    return () => ro.disconnect();
  }, []);

  // Com o modal aberto por cima, as fibras do fundo pausam (ficam escondidas atrás dele).
  useEffect(() => {
    const dialog = modalRef.current;
    const fechar = () => setAberto(false);
    dialog.addEventListener('close', fechar);
    return () => dialog.removeEventListener('close', fechar);
  }, []);

  // As capas são leves: pré-carregadas para a troca de categoria ser instantânea.
  useEffect(() => {
    PORTFOLIO.forEach(c => {
      new Image().src = c.capa;
    });
  }, []);

  // O card fica montado (o ReflectiveCard mantém o mesmo WebGL); só a animação de entrada se repete.
  useEffect(() => {
    if (primeiraRef.current) {
      primeiraRef.current = false;
      return;
    }
    const card = cardRef.current;
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  }, [ativo]);

  const inset = mobile ? 16 : 24;
  const fontSize = wheelW ? Math.min(2.6, Math.max(0.95, (wheelW - inset - 12) / ROTULO_EM / 16)) : 1;

  const abrir = () => {
    setMontado(true);
    setAberto(true);
    modalRef.current?.showModal();
  };

  return (
    <section id="trabalhos" className="portfolio" aria-labelledby="portfolio-titulo">
      <div className={`portfolio__bg portfolio__bg--${categoria.cor}`} aria-hidden="true">
        <Suspense fallback={null}>
          <GhostFibers
            lightMode
            glowColor={FIBRA[categoria.cor]}
            threads={MODESTO ? 40 : mobile ? 48 : 64}
            dpr={DPR_FUNDO}
            paused={aberto}
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
        </Suspense>
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
            ref={cardRef}
            className={`portfolio__card portfolio__card--${categoria.cor}${categoria.logo ? ' portfolio__card--logo' : ''}`}
            onClick={abrir}
          >
            <ReflectiveCard theme="light" width="100%" height="100%" radius={10} intro={false} maxDpr={DPR_DESTAQUE}>
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
