// Transforma os envios do formulário (pendentes/*.json, gravados pelo Apps Script) em cards do portfólio:
// converte a imagem para .webp em public/portfolio/<pasta>/ e insere o card em src/data/portfolio.json.
// Uso: node scripts/processar-pendentes.mjs — imprime um título por linha; sai com código 1 se algo for inválido.
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
  const arquivoDados = path.join(raiz, 'src/data/portfolio.json');
  const arquivos = fs.existsSync(dirPendentes)
    ? fs.readdirSync(dirPendentes).filter(f => f.endsWith('.json')).sort().map(f => path.join(dirPendentes, f))
    : [];
  if (arquivos.length === 0) return [];

  const categorias = JSON.parse(fs.readFileSync(arquivoDados, 'utf8'));

  // Valida tudo antes de gravar qualquer arquivo: um envio inválido não deixa o repositório pela metade.
  const pendentes = arquivos.map(arquivo => lerPendente(arquivo, categorias));

  const reservados = new Set();
  const imagens = [];
  for (const p of pendentes) {
    const pasta = path.join(raiz, 'public/portfolio', p.categoria.pasta);
    const nome = nomeLivre(pasta, slugify(p.title), reservados);
    const destino = path.join(pasta, nome);
    reservados.add(destino);
    let buffer;
    try {
      const semBordas = await sharp(p.imagem).trim({ background: '#000', threshold: 20 }).toBuffer();
      buffer = await sharp(semBordas)
        .resize(LADO_MAXIMO, LADO_MAXIMO, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALIDADE_WEBP })
        .toBuffer();
    } catch (erro) {
      throw new Error(`${path.basename(p.arquivo)}: não foi possível ler a imagem (${erro.message})`);
    }
    imagens.push({ destino, buffer });
    const card = { title: p.title, ...(p.subtitle ? { subtitle: p.subtitle } : {}), href: p.href, image: `/portfolio/${p.categoria.pasta}/${nome}` };
    if (p.categoria.novas === 'inicio') p.categoria.trabalhos.unshift(card);
    else p.categoria.trabalhos.push(card);
  }

  for (const { destino, buffer } of imagens) {
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, buffer);
  }
  fs.writeFileSync(arquivoDados, JSON.stringify(categorias, null, 2) + '\n');
  for (const p of pendentes) fs.rmSync(p.arquivo);

  return pendentes.map(p => p.title);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const titulos = await processarPendentes({ raiz: process.cwd() });
    for (const titulo of titulos) console.log(titulo);
  } catch (erro) {
    console.error(erro.message);
    process.exit(1);
  }
}
