import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import NavLink from './NavLink';
import { withBase } from '../lib/base';
import Noise from './Noise/Noise';

// three.js fica fora do bundle inicial.
const Lanyard = lazy(() => import('./Lanyard/Lanyard'));

const MOBILE = 860;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round = v => Math.round(v * 1000) / 1000;

// O canvas cobre o hero inteiro, então o crachá nunca bate numa borda ao ser puxado.
// Enquadramento medido na tela: no desktop ele pende à direita do texto, com largura
// proporcional ao espaço livre; no celular pende logo abaixo dos botões.
function enquadrar(area, texto) {
  const { width: w, height: h } = area;
  if (w > MOBILE) return { anchor: 0.74, size: round(clamp((0.48 * w) / h, 0.4, 0.62)), strapLength: 0.5 };
  const topo = (texto + 28) / h; // topo do crachá, em fração da altura
  const largura = Math.min(0.6 * w, 300) / 0.711 / h; // crachá com no máximo 300px de largura
  return {
    anchor: 0.5,
    size: round(clamp(Math.min(0.9 - topo, largura), 0.25, 0.55)),
    strapLength: round(Math.max(1, (topo - 0.12) / 0.3))
  };
}

export default function Hero() {
  const areaRef = useRef(null);
  const textRef = useRef(null);
  const [cracha, setCracha] = useState(null);

  useEffect(() => {
    const area = areaRef.current;
    const texto = textRef.current;
    const medir = () => {
      const a = area.getBoundingClientRect();
      const t = texto.getBoundingClientRect();
      const next = enquadrar(a, t.bottom - a.top);
      setCracha(prev => (prev && Object.keys(next).every(k => prev[k] === next[k]) ? prev : next));
    };
    const ro = new ResizeObserver(medir);
    ro.observe(area);
    ro.observe(texto);
    return () => ro.disconnect();
  }, []);

  return (
    <section id="inicio" className="hero">
      <div className="hero__bg" aria-hidden="true">
        <img src={withBase('/substack-imagem.webp')} alt="" fetchPriority="high" />
        <Noise opacity={0.08} fps={12} blendMode="soft-light" />
      </div>
      <div ref={areaRef} className="hero__portrait" role="img" aria-label="Retrato de Rafaella Gama em um crachá">
        {cracha && (
          <Suspense fallback={null}>
            <Lanyard frontImage={withBase('/retrato-hero.jpg')} cardColor="#fffaf0" strapColor="#ff9ec7" {...cracha} />
          </Suspense>
        )}
      </div>
      <div ref={textRef} className="hero__text">
        <p className="hero__tag">Estudante de jornalismo</p>
        <h1 className="hero__title">
          <span className="hero__line">Oi, eu sou a <mark className="hl hl--pink">Rafaella</mark></span>
          <span className="hero__line">e eu amo <mark className="hl hl--yellow">comunicação</mark>.</span>
        </h1>
        <div className="hero__actions">
          <a className="btn btn--dark" href="#trabalhos">Ver experiências</a>
          <NavLink className="btn" href="/contato">Fale comigo</NavLink>
        </div>
      </div>
    </section>
  );
}
