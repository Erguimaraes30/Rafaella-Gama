import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { scrollToPath } from './components/NavLink';
import { stripBase } from './lib/base';

export default function App() {
  useEffect(() => {
    const sync = () => scrollToPath(stripBase(location.pathname), location.hash);
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Marquee />
        <About />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
