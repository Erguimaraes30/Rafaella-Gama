import { TRAJETORIA } from '../data/trajetoria';

// <dialog> nativo: foco preso no modal, Escape fecha e o foco volta ao botão.
export default function TrajetoriaModal({ ref }) {
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="trajetoria-titulo"
      onClick={event => event.target === event.currentTarget && close()}
    >
      <div className="modal__box">
        <div className="modal__head">
          <h3 id="trajetoria-titulo" className="modal__title">Minha Trajetória</h3>
          <button type="button" className="modal__close" onClick={close} aria-label="Fechar">
            ×
          </button>
        </div>
        <dl className="timeline">
          {TRAJETORIA.map(({ periodo, texto }, i) => (
            <div key={periodo} className="timeline__item" style={{ '--i': i }}>
              <dt>{periodo}</dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}
