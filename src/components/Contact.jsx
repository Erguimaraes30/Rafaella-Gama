import { lazy, Suspense, useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import LogoLoop from './LogoLoop/LogoLoop';
import { CONTATOS } from '../data/contatos';

// Fundo decorativo: chunk próprio, carregado depois do conteúdo principal.
const MicroSlats = lazy(() => import('./MicroSlats/MicroSlats'));

// Cada ícone ocupa pelo menos 1/4.6 da largura da tela: a sequência dos 5 fica sempre
// mais larga que a tela, então o primeiro nunca reaparece no fim enquanto ainda está visível.
function useTamanho() {
  const [largura, setLargura] = useState(() => window.innerWidth);
  useEffect(() => {
    const medir = () => setLargura(window.innerWidth);
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);
  const icone = Math.round(Math.min(200, Math.max(110, largura * 0.13)));
  const passo = largura / 4.6;
  return { icone, gap: Math.round(Math.max(largura * 0.1, passo - icone)), mobile: largura <= 600 };
}

const CANAIS = CONTATOS.map(({ icon, title, href, ariaLabel }) => ({
  node: (
    <span className="contact__icon">
      <HugeiconsIcon icon={icon} strokeWidth={1.6} />
    </span>
  ),
  title,
  href,
  ariaLabel
}));

export default function Contact() {
  const { icone, gap, mobile } = useTamanho();

  return (
    <section id="contato" className="contact" aria-label="Contato">
      {/* Mesmo tom do hero: ondas creme/areia sob um véu fosco, para os ícones serem o destaque. */}
      <div className="contact__bg" aria-hidden="true">
        <Suspense fallback={null}>
          <MicroSlats
            preset="tide"
            color="#b39469"
            glintColor="#fff1a6"
            backgroundColor="#fbf3e4"
            speed={0.35}
            cursorStrength={0.5}
            introDuration={2}
          />
        </Suspense>
      </div>
      <LogoLoop
        logos={CANAIS}
        className="contact__loop"
        ariaLabel="Canais de contato"
        speed={mobile ? 22 : 28}
        logoHeight={icone}
        gap={gap}
        hoverSpeed={0}
        labels="below"
        scaleOnHover
        fadeOutWidth={mobile ? 0.08 : 0.12}
      />
    </section>
  );
}
