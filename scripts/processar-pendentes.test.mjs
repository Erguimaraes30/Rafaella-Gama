import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { slugify, processarPendentes } from './processar-pendentes.mjs';

const PORTFOLIO_MINIMO = [
  {
    nome: 'Em Todo Lugar', cor: 'blue', capa: '/portfolio/logo.webp', logo: true,
    pasta: 'emtodolugar', novas: 'inicio',
    trabalhos: [{ title: 'Antiga', href: 'https://exemplo.com/antiga', image: '/portfolio/emtodolugar/antiga.webp' }]
  },
  {
    nome: 'Além do Hype', cor: 'pink', capa: '/portfolio/logo-adh.webp', logo: true,
    pasta: 'alemdohype', novas: 'fim',
    trabalhos: [{ title: '#1 Além do Hype', href: 'https://exemplo.com/1', image: '/portfolio/alemdohype/1.webp' }]
  }
];

// Monta um repositório falso num diretório temporário, só com o que o script usa.
function criarRaiz() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'pendentes-'));
  fs.mkdirSync(path.join(raiz, 'src/data'), { recursive: true });
  fs.mkdirSync(path.join(raiz, 'pendentes'));
  fs.writeFileSync(path.join(raiz, 'src/data/portfolio.json'), JSON.stringify(PORTFOLIO_MINIMO, null, 2) + '\n');
  return raiz;
}

async function imagemPng(width, height, { alpha = false } = {}) {
  const background = alpha ? { r: 200, g: 50, b: 50, alpha: 0.5 } : { r: 200, g: 50, b: 50 };
  return sharp({ create: { width, height, channels: alpha ? 4 : 3, background } }).png().toBuffer();
}

async function gravarPendente(raiz, nomeArquivo, campos, imagem) {
  const pendente = {
    categoria: 'Em Todo Lugar', title: 'Nova matéria', subtitle: '', href: 'https://exemplo.com/nova',
    enviadoPor: 'teste@exemplo.com', enviadoEm: '2026-11-12T15:30:00Z',
    ...campos,
    imagem: { nome: 'capa.png', mime: 'image/png', base64: (imagem ?? await imagemPng(1200, 800)).toString('base64') }
  };
  fs.writeFileSync(path.join(raiz, 'pendentes', nomeArquivo), JSON.stringify(pendente));
}

const lerPortfolio = raiz => JSON.parse(fs.readFileSync(path.join(raiz, 'src/data/portfolio.json'), 'utf8'));
const categoria = (raiz, nome) => lerPortfolio(raiz).find(c => c.nome === nome);

test('slugify tira acentos, pontuação e emoji', () => {
  assert.equal(slugify('Victoria’s Secret: o show!'), 'victorias-secret-o-show');
  assert.equal(slugify('Além do Hype #5'), 'alem-do-hype-5');
  assert.equal(slugify('🎃🎃'), 'card');
});

test('slugify limita a 40 caracteres sem hífen no fim', () => {
  const slug = slugify('De craque de futebol a influencer literário: como um passatempo');
  assert.ok(slug.length <= 40);
  assert.ok(!slug.endsWith('-'));
  assert.match(slug, /^[a-z0-9-]+$/);
});

test('insere no início quando novas = inicio', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, '2026-11-12T15-30-00-nova.json', {});
  const titulos = await processarPendentes({ raiz });
  const { trabalhos } = categoria(raiz, 'Em Todo Lugar');
  assert.deepEqual(titulos, ['Nova matéria']);
  assert.equal(trabalhos.length, 2);
  assert.equal(trabalhos[0].title, 'Nova matéria');
  assert.equal(trabalhos[0].href, 'https://exemplo.com/nova');
});

test('insere no fim quando novas = fim', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, 'a.json', { categoria: 'Além do Hype', title: '#2 Além do Hype' });
  await processarPendentes({ raiz });
  const { trabalhos } = categoria(raiz, 'Além do Hype');
  assert.equal(trabalhos.at(-1).title, '#2 Além do Hype');
  assert.equal(trabalhos[0].title, '#1 Além do Hype');
});

test('omite subtitle vazio e grava quando preenchido', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, 'a.json', { title: 'Sem subtítulo', subtitle: '  ' });
  await gravarPendente(raiz, 'b.json', { title: 'Com subtítulo', subtitle: 'x' });
  await processarPendentes({ raiz });
  const { trabalhos } = categoria(raiz, 'Em Todo Lugar');
  const sem = trabalhos.find(t => t.title === 'Sem subtítulo');
  const com = trabalhos.find(t => t.title === 'Com subtítulo');
  assert.ok(!('subtitle' in sem));
  assert.equal(com.subtitle, 'x');
});

test('converte para webp dentro de 1000px', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, 'a.json', { title: 'Imagem grande' }, await imagemPng(2000, 1500));
  await processarPendentes({ raiz });
  const card = categoria(raiz, 'Em Todo Lugar').trabalhos[0];
  assert.equal(card.image, '/portfolio/emtodolugar/imagem-grande.webp');
  const meta = await sharp(path.join(raiz, 'public', card.image)).metadata();
  assert.equal(meta.format, 'webp');
  assert.equal(meta.width, 1000);
  assert.equal(meta.height, 750);
});

test('não amplia imagem pequena com transparência', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, 'a.json', { title: 'Pequena' }, await imagemPng(300, 200, { alpha: true }));
  await processarPendentes({ raiz });
  const meta = await sharp(path.join(raiz, 'public/portfolio/emtodolugar/pequena.webp')).metadata();
  assert.equal(meta.width, 300);
  assert.equal(meta.height, 200);
});

test('corta bordas pretas', async () => {
  const raiz = criarRaiz();
  const miolo = await imagemPng(400, 400);
  const comFaixas = await sharp({ create: { width: 400, height: 600, channels: 3, background: '#000' } })
    .composite([{ input: miolo, top: 100, left: 0 }]).png().toBuffer();
  await gravarPendente(raiz, 'a.json', { title: 'Com faixas' }, comFaixas);
  await processarPendentes({ raiz });
  const meta = await sharp(path.join(raiz, 'public/portfolio/emtodolugar/com-faixas.webp')).metadata();
  assert.equal(meta.width, 400);
  assert.equal(meta.height, 400);
});

test('dois pendentes com o mesmo título entram na ordem de envio com nomes distintos', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, '2026-11-12T10-00-00-a.json', { categoria: 'Além do Hype', title: 'Repetida', href: 'https://exemplo.com/1' });
  await gravarPendente(raiz, '2026-11-12T11-00-00-a.json', { categoria: 'Além do Hype', title: 'Repetida', href: 'https://exemplo.com/2' });
  await processarPendentes({ raiz });
  const novos = categoria(raiz, 'Além do Hype').trabalhos.slice(1);
  assert.deepEqual(novos.map(t => t.href), ['https://exemplo.com/1', 'https://exemplo.com/2']);
  assert.deepEqual(novos.map(t => t.image), ['/portfolio/alemdohype/repetida.webp', '/portfolio/alemdohype/repetida-2.webp']);
  assert.ok(fs.existsSync(path.join(raiz, 'public/portfolio/alemdohype/repetida-2.webp')));
});

test('dois envios numa categoria de início deixam o mais recente primeiro', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, '2026-11-12T10-00-00-a.json', { title: 'Primeira enviada' });
  await gravarPendente(raiz, '2026-11-12T11-00-00-b.json', { title: 'Segunda enviada' });
  await processarPendentes({ raiz });
  const titulos = categoria(raiz, 'Em Todo Lugar').trabalhos.map(t => t.title);
  assert.deepEqual(titulos, ['Segunda enviada', 'Primeira enviada', 'Antiga']);
});

test('não sobrescreve imagem que já existe no repositório', async () => {
  const raiz = criarRaiz();
  fs.mkdirSync(path.join(raiz, 'public/portfolio/emtodolugar'), { recursive: true });
  fs.writeFileSync(path.join(raiz, 'public/portfolio/emtodolugar/existente.webp'), 'original');
  await gravarPendente(raiz, 'a.json', { title: 'Existente' });
  await processarPendentes({ raiz });
  assert.equal(fs.readFileSync(path.join(raiz, 'public/portfolio/emtodolugar/existente.webp'), 'utf8'), 'original');
  assert.equal(categoria(raiz, 'Em Todo Lugar').trabalhos[0].image, '/portfolio/emtodolugar/existente-2.webp');
});

test('apaga os pendentes processados', async () => {
  const raiz = criarRaiz();
  fs.writeFileSync(path.join(raiz, 'pendentes/.gitkeep'), '');
  await gravarPendente(raiz, 'a.json', {});
  await processarPendentes({ raiz });
  assert.deepEqual(fs.readdirSync(path.join(raiz, 'pendentes')), ['.gitkeep']);
});

test('sem pendentes não altera nada e devolve lista vazia', async () => {
  const raiz = criarRaiz();
  const antes = fs.readFileSync(path.join(raiz, 'src/data/portfolio.json'));
  assert.deepEqual(await processarPendentes({ raiz }), []);
  assert.deepEqual(fs.readFileSync(path.join(raiz, 'src/data/portfolio.json')), antes);
});

test('pendente inválido não altera nada', async () => {
  const raiz = criarRaiz();
  const antes = fs.readFileSync(path.join(raiz, 'src/data/portfolio.json'));
  await gravarPendente(raiz, 'a.json', { title: 'Válida' });
  await gravarPendente(raiz, 'b.json', { categoria: 'Inexistente' });
  await assert.rejects(processarPendentes({ raiz }), /Inexistente/);
  assert.deepEqual(fs.readFileSync(path.join(raiz, 'src/data/portfolio.json')), antes);
  assert.ok(!fs.existsSync(path.join(raiz, 'public')));
  assert.deepEqual(fs.readdirSync(path.join(raiz, 'pendentes')).sort(), ['a.json', 'b.json']);
});

test('href sem http é inválido', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, 'a.json', { href: 'exemplo.com/sem-protocolo' });
  await assert.rejects(processarPendentes({ raiz }), /link/i);
});

test('título vazio é inválido', async () => {
  const raiz = criarRaiz();
  await gravarPendente(raiz, 'a.json', { title: '   ' });
  await assert.rejects(processarPendentes({ raiz }), /título/i);
});
