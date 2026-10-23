const TOPICS = ['crítica cultural', 'coluna', 'análise de mídia', 'cultura pop', 'gênero', 'redes sociais', 'artes cênicas'];

const List = props => (
  <ul className="marquee__list" {...props}>
    {TOPICS.map(topic => <li key={topic}>{topic}</li>)}
  </ul>
);

export default function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee__track">
        <List />
        <List aria-hidden="true" />
      </div>
    </div>
  );
}
