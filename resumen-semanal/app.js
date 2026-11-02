const ICONOS = {
  mundo: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
  espana: '<path d="M6 21V4M6 5h12l-2.5 4L18 13H6"/>',
  belgica: '<path d="M4 20h16M6 20V10M18 20V10M10 20v-6M14 20v-6M3.5 10 12 4l8.5 6z"/>',
  marcas: '<path d="M12 3.500 14.600 9l6 .8-4.400 4.100 1.100 5.900L12 16.900l-5.300 2.900 1.100-5.900L3.400 9.800l6-.8z"/>',
  comunicacion: '<path d="M4 6h16v10H10l-4 4v-4H4z"/><path d="M8 10h8"/>',
};
const SECCIONES = [['mundo', 'Mundo'], ['espana', 'España'], ['belgica', 'Bélgica'], ['marcas', 'Marcas'], ['comunicacion', 'Comunicación y empresa']];
const vista = document.getElementById('vista');
const icono = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[id]}</svg>`;
const ICONO_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7.500"/></svg>';
const ICONO_FAV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4z"/></svg>';

let indice = null;
const dias = new Map();

function esc(texto = '') {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function urlSegura(url) {
  try { return ['http:', 'https:'].includes(new URL(url).protocol) ? url : '#'; } catch { return '#'; }
}
function normal(texto = '') {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
function fecha(iso, opciones = { day: 'numeric', month: 'short' }) {
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('es-ES', opciones);
}

function leerGuardado(clave, porDefecto) {
  try { return JSON.parse(localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
}
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento disponible */ }
}
const leidas = new Set(leerGuardado('leidas', []));
const favoritos = leerGuardado('favoritos', {});

async function pedirJSON(ruta) {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`${ruta}: ${respuesta.status}`);
  return respuesta.json();
}
async function cargarIndice() {
  if (!indice) indice = await pedirJSON('data/indice.json');
  return indice;
}
async function cargarDia(id) {
  if (!dias.has(id)) dias.set(id, await pedirJSON(`data/dias/${id}.json`));
  return dias.get(id);
}
// Pide todos los días: así quedan en caché para leerlos y buscarlos sin conexión.
async function cargarTodos() {
  const { dias: lista } = await cargarIndice();
  const resultados = await Promise.allSettled(lista.map((d) => cargarDia(d.id)));
  return resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

function tarjeta(item, seccion) {
  const leida = leidas.has(item.id);
  const fav = Boolean(favoritos[item.id]);
  return `<article class="tarjeta${leida ? ' leida' : ''}" data-id="${esc(item.id)}" style="--c:var(--${esc(seccion)})">
    <h3>${esc(item.titular)}</h3>
    <p class="resumen">${esc(item.resumen)}</p>
    <div class="meta">${esc(item.medio)} · ${esc(fecha(item.fecha))} · ${esc(item.tema)}</div>
    <a class="leer" href="${esc(urlSegura(item.url))}" target="_blank" rel="noopener noreferrer">Leer noticia</a>
    <div class="acciones">
      <button class="accion" data-accion="leida" aria-pressed="${leida}">${ICONO_CHECK}<span>${leida ? 'Leída' : 'Marcar leída'}</span></button>
      <button class="accion fav" data-accion="favorito" aria-pressed="${fav}">${ICONO_FAV}<span>${fav ? 'Guardada' : 'Guardar'}</span></button>
    </div>
  </article>`;
}

function htmlDia(dia) {
  const chips = SECCIONES.map(([id, nombre]) =>
    `<button class="chip" data-ir="${id}" style="--c:var(--${id})">${icono(id)}${esc(nombre.split(' ')[0])}</button>`).join('');
  const bloques = SECCIONES.map(([id, nombre]) => {
    const cuerpo = (dia.secciones[id] ?? []).map((item) => tarjeta(item, id)).join('')
      || '<p class="vacio">Hoy no hay noticias de tus temas en esta sección.</p>';
    return `<section class="seccion" id="s-${id}" style="--c:var(--${id})">
      <div class="cabecera"><span class="insignia">${icono(id)}</span><h2>${esc(nombre)}</h2></div>${cuerpo}</section>`;
  }).join('');
  return `<h1>Noticias</h1><p class="sub">${esc(dia.titulo)}</p><div class="chips">${chips}</div>${bloques}`;
}

function mostrarError() {
  vista.innerHTML = '<p class="vacio">No se han podido cargar las noticias. Abre la app una vez con conexión para guardarlas en el móvil.</p>';
}

async function verDia(id) {
  try {
    const { dias: lista } = await cargarIndice();
    const elegido = id ?? lista[0]?.id;
    if (!elegido) { vista.innerHTML = '<p class="vacio">Todavía no hay noticias.</p>'; return; }
    const dia = await cargarDia(elegido);
    vista.innerHTML = (id ? '<a class="volver" href="#/archivo">‹ Archivo</a>' : '') + htmlDia(dia);
    cargarTodos();
  } catch { mostrarError(); }
}

async function verArchivo() {
  try {
    const { dias: lista } = await cargarIndice();
    const filas = lista.map((d) => `<a class="tarjeta semana" href="#/dia/${esc(d.id)}">
      <span>${esc(d.titulo)}<small>${Number(d.noticias)} noticias</small></span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></a>`).join('');
    vista.innerHTML = `<h1>Archivo</h1><p class="sub">Días anteriores</p>${filas || '<p class="vacio">Aún no hay días guardados.</p>'}`;
  } catch { mostrarError(); }
}

function coincide(texto, palabras) {
  const n = normal(texto);
  return palabras.every((p) => n.includes(p));
}

async function buscar(consulta) {
  const destino = document.getElementById('resultados');
  const palabras = normal(consulta).split(/\s+/).filter(Boolean);
  if (!palabras.length) { destino.innerHTML = ''; return; }
  const todos = await cargarTodos();
  if (document.getElementById('resultados') !== destino) return;
  let html = '';
  let total = 0;
  for (const dia of todos) {
    let bloque = '';
    for (const [seccion, items] of Object.entries(dia.secciones)) {
      for (const item of items) {
        if (coincide(`${item.titular} ${item.resumen} ${item.medio} ${item.tema}`, palabras)) { bloque += tarjeta(item, seccion); total += 1; }
      }
    }
    if (bloque) html += `<p class="sub" style="margin-top:20px">${esc(dia.titulo)}</p>${bloque}`;
  }
  destino.innerHTML = `<p class="sub" aria-live="polite">${total} ${total === 1 ? 'resultado' : 'resultados'}</p>${html}`;
}

function verBuscar() {
  vista.innerHTML = `<h1>Buscar</h1><p class="sub">En todos los días guardados</p>
    <input class="buscador" id="consulta" type="search" placeholder="Escribe una palabra" aria-label="Buscar" autocomplete="off" enterkeyhint="search">
    <div id="resultados"></div>`;
  let espera;
  document.getElementById('consulta').addEventListener('input', (e) => {
    clearTimeout(espera);
    espera = setTimeout(() => buscar(e.target.value), 200);
  });
}

function verFavoritos() {
  const lista = Object.values(favoritos).sort((a, b) => b.fecha.localeCompare(a.fecha));
  vista.innerHTML = `<h1>Favoritos</h1><p class="sub">Guardados en este móvil</p>
    ${lista.map((f) => tarjeta(f, f.seccion)).join('') || '<p class="vacio">Pulsa «Guardar» en una noticia para tenerla aquí.</p>'}`;
}

function enrutar() {
  const [, ruta = '', id] = location.hash.split('/');
  const tab = { '': 'semana', dia: 'archivo', archivo: 'archivo', buscar: 'buscar', favoritos: 'favoritos' }[ruta] ?? 'semana';
  document.querySelectorAll('.barra a').forEach((a) => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  if (ruta === 'archivo') verArchivo();
  else if (ruta === 'buscar') verBuscar();
  else if (ruta === 'favoritos') verFavoritos();
  else verDia(ruta === 'dia' ? id : undefined);
}

async function buscarItem(id) {
  for (const dia of await cargarTodos()) {
    for (const [seccion, items] of Object.entries(dia.secciones)) {
      const item = items.find((i) => i.id === id);
      if (item) return { ...item, seccion };
    }
  }
  return null;
}

vista.addEventListener('click', async (evento) => {
  const ir = evento.target.closest('[data-ir]');
  if (ir) { document.getElementById(`s-${ir.dataset.ir}`)?.scrollIntoView({ behavior: 'smooth' }); return; }
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const nodo = boton.closest('.tarjeta');
  const id = nodo.dataset.id;
  if (boton.dataset.accion === 'leida') {
    const activa = !leidas.has(id);
    if (activa) leidas.add(id); else leidas.delete(id);
    guardar('leidas', [...leidas]);
    boton.setAttribute('aria-pressed', activa);
    boton.querySelector('span').textContent = activa ? 'Leída' : 'Marcar leída';
    nodo.classList.toggle('leida', activa);
  } else {
    const item = favoritos[id] ? null : await buscarItem(id);
    if (item) favoritos[id] = item; else delete favoritos[id];
    boton.setAttribute('aria-pressed', Boolean(item));
    boton.querySelector('span').textContent = item ? 'Guardada' : 'Guardar';
    guardar('favoritos', favoritos);
  }
});

function actualizarConexion() {
  document.getElementById('aviso').hidden = navigator.onLine;
}
addEventListener('online', actualizarConexion);
addEventListener('offline', actualizarConexion);
addEventListener('hashchange', enrutar);
actualizarConexion();
enrutar();

// La primera visita ocurre antes de que el service worker controle la página, así que los días se guardan aquí.
async function guardarSinConexion() {
  await navigator.serviceWorker.ready;
  const cache = await caches.open('mi-semana-v1');
  const { dias: lista } = await cargarIndice();
  for (const { id } of lista) {
    const ruta = `data/dias/${id}.json`;
    if (!(await cache.match(ruta))) await cache.add(ruta);
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
  guardarSinConexion().catch(() => { /* se reintenta en la próxima apertura */ });
}
