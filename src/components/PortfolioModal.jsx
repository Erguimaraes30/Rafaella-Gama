import { lazy, Suspense } from 'react';

// gsap só é baixado quando o carrossel aparece pela primeira vez.
const DepthCarousel = lazy(() => import('./DepthCarousel/DepthCarousel'));

// Mesmo <dialog> (e mesma animação) do modal "Minha Trajetória".
export default function PortfolioModal({ ref, categoria, montado, compacto }) {
  const close = () => ref.current?.close();
  const { nome, trabalhos } = categoria;
  // Cards maiores no desktop, sem passar da altura da tela (sobra espaço para a barra de progresso).
  const cardHeight = compacto ? 440 : Math.max(360, Math.min(500, Math.round(window.innerHeight * 0.72) - 110));
  const cardWidth = compacto ? 250 : Math.round(cardHeight * 0.8);

  return (
    <dialog
      ref={ref}
      className={`modal modal--wide portfolio__modal portfolio__modal--${categoria.cor}`}
      aria-label={nome}
      // Sem o fundo da caixa, clicar na área escura ao redor também fecha.
      onClick={event => event.target.matches('.modal, .modal__box, .modal__head') && close()}
    >
      <div className="modal__box">
        <div className="modal__head">
          <button type="button" className="modal__close" onClick={close} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className="portfolio__carousel">
          {montado && trabalhos.length > 0 ? (
            <Suspense fallback={null}>
              <DepthCarousel
                key={nome}
                items={trabalhos}
                ariaLabel={`Trabalhos: ${nome}`}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                radius={10}
                tint="#1c1917"
                depth={200}
                spread={compacto ? 24 : 80}
                tilt={18}
                visibleCards={3}
                falloff={0.15}
                blur={3}
              />
            </Suspense>
          ) : (
            <div className="portfolio__empty" />
          )}
        </div>
      </div>
    </dialog>
  );
}
