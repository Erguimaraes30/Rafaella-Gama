// Transforma os envios do formulário (pendentes/*.json, gravados pelo Apps Script) em cards do portfólio:
// converte a imagem para .webp em public/portfolio/<pasta>/ e insere o card em src/data/portfolio.json.
// Uso: node scripts/processar-pendentes.mjs — imprime os títulos publicados (um por linha) e, em stderr, os
// motivos dos envios rejeitados, que vão para pendentes/rejeitados/; sai com código 2 se houve rejeitados.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const LADO_MAXIMO = 1000;
const QUALIDADE_WEBP = 80;

export function slugify(texto) {
  const slug = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘`´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  return slug || 'card';
}

function lerPendente(arquivo, categorias) {
  const nome = path.basename(arquivo);
  let pendente;
  try {
    pendente = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  } catch {
    throw new Error(`${nome}: não é um JSON válido`);
  }

  const title = pendente.title?.trim();
  const subtitle = pendente.subtitle?.trim();
  const href = pendente.href?.trim();
  const categoria = categorias.find(c => c.nome === pendente.categoria);

  if (!categoria) throw new Error(`${nome}: categoria "${pendente.categoria}" não existe no portfólio`);
  if (!title) throw new Error(`${nome}: título vazio`);
  if (!/^https?:\/\//.test(href ?? '')) throw new Error(`${nome}: link inválido ("${pendente.href}")`);
  if (!pendente.imagem?.base64) throw new Error(`${nome}: imagem ausente`);

  return { arquivo, categoria, title, subtitle, href, imagem: Buffer.from(pendente.imagem.base64, 'base64') };
}

// Gira conforme o EXIF (fotos de celular), corta bordas pretas e reduz para caber em 1000×1000.
async function converterImagem(imagem, nome) {
  try {
    const semBordas = await sharp(imagem).rotate().trim({ background: '#000', threshold: 20 }).toBuffer();
    return await sharp(semBordas)
      .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALIDADE_WEBP })
      .toBuffer();
  } catch (erro) {
    throw new Error(`${nome}: não foi possível ler a imagem; envie em JPG, PNG ou WebP (${erro.message})`);
  }
}

// Primeiro nome livre na pasta, considerando também os já reservados nesta execução.
function nomeLivre(pasta, slug, reservados) {
  for (let n = 1; ; n++) {
    const nome = n === 1 ? `${slug}.webp` : `${slug}-${n}.webp`;
    const destino = path.join(pasta, nome);
    if (!fs.existsSync(destino) && !reservados.has(destino)) return nome;
  }
}

export async function processarPendentes({ raiz }) {
  const dirPendentes = path.join(raiz, 'pendentes');
  const dirRejeitados = path.join(dirPendentes, 'rejeitados');
  const arquivoDados = path.join(raiz, 'src/data/portfolio.json');
  const arquivos = fs.existsSync(dirPendentes)
    ? fs.readdirSync(dirPendentes).filter(f => f.endsWith('.json')).sort().map(f => path.join(dirPendentes, f))
    : [];
  if (arquivos.length === 0) return { titulos: [], rejeitados: [] };

  const categorias = JSON.parse(fs.readFileSync(arquivoDados, 'utf8'));

  // Lê, valida e converte tudo em memória antes de gravar: um envio inválido vai para
  // pendentes/rejeitados/ sem deixar nada pela metade nem impedir os outros de serem publicados.
  const validos = [];
  const rejeitados = [];
  for (const arquivo of arquivos) {
    try {
      const pendente = lerPendente(arquivo, categorias);
      pendente.webp = await converterImagem(pendente.imagem, path.basename(arquivo));
      validos.push(pendente);
    } catch (erro) {
      rejeitados.push({ arquivo: path.basename(arquivo), motivo: erro.message });
    }
  }

  const reservados = new Set();
  for (const p of validos) {
    const pasta = path.join(raiz, 'public/portfolio', p.categoria.pasta);
    const nome = nomeLivre(pasta, slugify(p.title), reservados);
    p.destino = path.join(pasta, nome);
    reservados.add(p.destino);
    const card = { title: p.title, ...(p.subtitle ? { subtitle: p.subtitle } : {}), href: p.href, image: `/portfolio/${p.categoria.pasta}/${nome}` };
    if (p.categoria.novas === 'inicio') p.categoria.trabalhos.unshift(card);
    else p.categoria.trabalhos.push(card);
  }

  for (const p of validos) {
    fs.mkdirSync(path.dirname(p.destino), { recursive: true });
    fs.writeFileSync(p.destino, p.webp);
  }
  if (validos.length > 0) fs.writeFileSync(arquivoDados, JSON.stringify(categorias, null, 2) + '\n');
  for (const p of validos) fs.rmSync(p.arquivo);
  if (rejeitados.length > 0) fs.mkdirSync(dirRejeitados, { recursive: true });
  for (const { arquivo } of rejeitados) fs.renameSync(path.join(dirPendentes, arquivo), path.join(dirRejeitados, arquivo));

  return { titulos: validos.map(p => p.title), rejeitados };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { titulos, rejeitados } = await processarPendentes({ raiz: process.cwd() });
  for (const titulo of titulos) console.log(titulo);
  for (const { motivo } of rejeitados) console.error(motivo);
  if (rejeitados.length > 0) process.exit(2);
}
