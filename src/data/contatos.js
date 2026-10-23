import { InstagramIcon, Linkedin01Icon, Mail01Icon, TiktokIcon, WhatsappIcon } from '@hugeicons/core-free-icons';

// Canais de contato: usados na seção Contato e no menu.
export const CONTATOS = [
  { title: 'WhatsApp', icon: WhatsappIcon, href: 'https://wa.link/xtgc7c' },
  {
    title: 'E-mail',
    icon: Mail01Icon,
    href: 'mailto:sourafagama@gmail.com?body=Ol%C3%A1%2C%20Rafaella%21%21',
    ariaLabel: 'Enviar e-mail'
  },
  { title: 'LinkedIn', icon: Linkedin01Icon, href: 'https://www.linkedin.com/in/rafaella-gama-4275413b8/' },
  { title: 'Instagram', icon: InstagramIcon, href: 'https://www.instagram.com/rafagwma' },
  { title: 'TikTok', icon: TiktokIcon, href: 'https://www.tiktok.com/@rafwaella' }
].map(c => ({ ...c, ariaLabel: c.ariaLabel ?? `${c.title} (abre em nova aba)` }));
