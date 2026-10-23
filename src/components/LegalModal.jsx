// Mesmo <dialog> do "Minha Trajetória": foco preso, Esc fecha e o foco volta ao botão.
export default function LegalModal({ ref, id, doc }) {
  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="modal legal"
      aria-labelledby={id}
      onClick={event => event.target === event.currentTarget && close()}
    >
      <div className="modal__box">
        <div className="modal__head legal__head">
          <div>
            <h2 id={id} className="modal__title">{doc.titulo}</h2>
            <p className="legal__date">{doc.atualizado}</p>
          </div>
          <button type="button" className="modal__close" onClick={close} aria-label="Fechar">
            ×
          </button>
        </div>
        {doc.secoes.map(({ titulo, texto }) => (
          <section key={titulo} className="legal__section">
            <h3>{titulo}</h3>
            {texto.map(p => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </dialog>
  );
}
