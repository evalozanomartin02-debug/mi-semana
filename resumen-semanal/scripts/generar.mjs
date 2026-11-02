// Busca noticias por tema y escribe la edición del día. Sin dependencias ni claves.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as esperar } from 'node:timers/promises';
import { BUSQUEDAS, EXCLUIR, EXCLUIR_MARCAS, FEEDS, HORAS, HORAS_PRINCIPALES, LIMITES, MAX_POR_MEDIO, MAX_POR_TEMA, MEDIOS, PRINCIPALES } from './fuentes.mjs';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const HORA = 3600000;
const DIAS_SIN_REPETIR = 30;
const NEERLANDES = /\b(de|het|een|van|voor|met|niet|naar|ook|zijn|wordt|bij)\b/gi;
const MAX_PALABRAS_NEERLANDES = 2;
const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»' };
const ACENTOS = { acute: '́', grave: '̀', tilde: '̃', uml: '̈', circ: '̂', cedil: '̧' };

function decodificar(texto) {
  return texto.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (original, cod) => {
    const letra = cod.match(/^([a-z])(acute|grave|tilde|uml|circ|cedil)$/i);
    if (letra) return (letra[1] + ACENTOS[letra[2].toLowerCase()]).normalize('NFC');
    if (cod[0] !== '#') return ENTIDADES[cod.toLowerCase()] ?? original;
    const numero = /^#x/i.test(cod) ? parseInt(cod.slice(2), 16) : parseInt(cod.slice(1), 10);
    return Number.isFinite(numero) ? String.fromCodePoint(numero) : original;
  });
}

function limpiar(html) {
  const sinCdata = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  const texto = decodificar(sinCdata).replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  return decodificar(texto).replace(/\s+/g, ' ').trim();
}

function etiqueta(bloque, ...nombres) {
  for (const nombre of nombres) {
    const m = bloque.match(new RegExp(`<${nombre}(?:\\s[^>]*)?>([\\s\\S]*?)</${nombre}>`, 'i'));
    if (m) return m[1];
  }
  return '';
}

// Bing envuelve el enlace real en el parámetro url.
function enlaceReal(bruto) {
  const url = limpiar(bruto);
  try {
    return new URL(url).searchParams.get('url') ?? url;
  } catch { return url; }
}

function medioDe(url) {
  if (/\/\/(www\.)?vrt\.be\//.test(url) && !url.includes('/vrtnws/en/')) return null;
  try {
    const partes = new URL(url).hostname.replace(/^www\./, '').split('.');
    for (let i = 0; i < partes.length - 1; i += 1) {
      const medio = MEDIOS[partes.slice(i).join('.')];
      if (medio) return medio;
    }
  } catch { /* enlace no válido */ }
  return null;
}

function descripcion(texto) {
  const limpio = texto
    .replace(/The post .* appeared first on .*$/i, '')
    .replace(/La entrada .* se publicó primero en .*$/i, '')
    .replace(/\s*(\[(…|\.\.\.)\]|Leer más|Seguir leyendo|Read more).*$/i, '')
    .trim();
  return limpio.length <= 280 ? limpio : `${limpio.slice(0, 260).replace(/\s+\S*$/, '')}…`;
}

// «de» también existe en francés y español: solo cuentan las palabras de los titulares sin rasgos de esos idiomas.
function enNeerlandes(texto) {
  const propias = (texto.replace(/\bde\b/gi, '').match(NEERLANDES) ?? []).length;
  return propias >= MAX_PALABRAS_NEERLANDES;
}

function leerRSS(xml, origen) {
  const items = [];
  for (const bloque of xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? []) {
    const url = enlaceReal(etiqueta(bloque, 'link'));
    const medio = medioDe(url);
    const titular = limpiar(etiqueta(bloque, 'title'));
    const fecha = new Date(limpiar(etiqueta(bloque, 'pubDate')));
    const resumen = descripcion(limpiar(etiqueta(bloque, 'description')));
    if (!medio || !/^https?:\/\//.test(url) || titular.length < 30 || resumen.length < 30 || Number.isNaN(+fecha)) continue;
    if (EXCLUIR.test(titular) || origen.excluir?.test(resumen)) continue;
    if (origen.seccion === 'marcas' && EXCLUIR_MARCAS.test(titular)) continue;
    if (origen.seccion === 'belgica' && enNeerlandes(`${titular} ${resumen}`)) continue;
    items.push({
      id: createHash('sha1').update(url).digest('hex').slice(0, 12),
      seccion: origen.seccion, tema: origen.tema,
      titular, resumen, medio, fecha: fecha.toISOString(), url,
    });
  }
  return items;
}

async function descargar(url) {
  const respuesta = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MiSemana/1.0)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.text();
}

async function leerJSON(ruta, porDefecto) {
  try { return JSON.parse(await readFile(ruta, 'utf8')); } catch (e) {
    if (e.code === 'ENOENT') return porDefecto;
    throw e;
  }
}

async function escribirJSON(ruta, datos) {
  await mkdir(dirname(ruta), { recursive: true });
  await writeFile(ruta, `${JSON.stringify(datos, null, 1)}\n`);
}

async function recoger() {
  const items = [];
  let fallos = 0;
  for (const b of BUSQUEDAS) {
    const url = `https://www.bing.com/news/search?q=${encodeURIComponent(b.consulta)}&format=rss&setmkt=${b.mercado}`;
    try {
      items.push(...leerRSS(await descargar(url), b));
    } catch (e) {
      fallos += 1;
      console.warn(`× ${b.consulta}: ${e.message}`);
    }
    await esperar(300);
  }
  const feeds = await Promise.allSettled(FEEDS.map(async (f) => leerRSS(await descargar(f.url), f)));
  feeds.forEach((r, i) => {
    if (r.status === 'fulfilled') items.push(...r.value);
    else console.warn(`× ${FEEDS[i].url}: ${r.reason.message}`);
  });
  console.log(`${items.length} noticias de medios aceptados; ${fallos} de ${BUSQUEDAS.length} búsquedas fallidas`);
  return items;
}

const VACIAS = new Set('sobre entre para como pero desde hasta contra este esta estos estas tras porque cuando donde their there about after with from have will that this says said pour dans avec plus cette sont voor over naar deze'.split(' '));

function claves(texto) {
  const palabras = texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().match(/[a-z]{4,}/g) ?? [];
  return new Set(palabras.filter((p) => !VACIAS.has(p)));
}
const comunes = (a, b) => [...a].filter((p) => b.has(p)).length;

// Lo más reciente primero, repartido por temas y medios y sin repetir historia.
function elegir(items, limite) {
  const ordenados = items.map((i) => ({ ...i, claves: claves(i.titular) }))
    .sort((a, b) => PRINCIPALES.has(b.medio) - PRINCIPALES.has(a.medio) || b.fecha.localeCompare(a.fecha));
  const elegidos = [];
  for (const item of ordenados) {
    if (elegidos.length === limite) break;
    if (elegidos.filter((e) => e.tema === item.tema).length >= MAX_POR_TEMA) continue;
    if (elegidos.filter((e) => e.medio === item.medio).length >= MAX_POR_MEDIO) continue;
    if (elegidos.some((e) => comunes(e.claves, item.claves) >= 2)) continue;
    elegidos.push(item);
  }
  return elegidos.map(({ claves: _c, seccion: _s, ...item }) => item);
}

const ahora = new Date();
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(ahora);
const titulo = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long' }).format(ahora);

const indice = await leerJSON(join(DATA, 'indice.json'), { dias: [] });
const anteriores = (indice.dias ?? []).filter((d) => d.id !== hoy).slice(0, DIAS_SIN_REPETIR);
const yaVistas = new Set();
for (const d of anteriores) {
  const edicion = await leerJSON(join(DATA, 'dias', `${d.id}.json`), { secciones: {} });
  Object.values(edicion.secciones).flat().forEach((i) => yaVistas.add(i.id));
}

const items = await recoger();
if (!items.length) throw new Error('No se ha encontrado ninguna noticia');
const unicas = [...new Map(items.map((i) => [i.id, i])).values()];
const secciones = {};
for (const [seccion, horas] of Object.entries(HORAS)) {
  const vigente = (i) => ahora - new Date(i.fecha) <= (seccion === 'comunicacion' && PRINCIPALES.has(i.medio) ? HORAS_PRINCIPALES : horas) * HORA;
  secciones[seccion] = elegir(unicas.filter((i) => i.seccion === seccion && !yaVistas.has(i.id)
    && vigente(i) && new Date(i.fecha) <= ahora), LIMITES[seccion]);
}

await escribirJSON(join(DATA, 'dias', `${hoy}.json`), { id: hoy, titulo, publicado: ahora.toISOString(), secciones });
const noticias = Object.values(secciones).flat().length;
await escribirJSON(join(DATA, 'indice.json'), {
  dias: [{ id: hoy, titulo, noticias }, ...(indice.dias ?? []).filter((d) => d.id !== hoy)],
});
console.log(`Publicado ${hoy}: ${noticias} noticias`);
