// Dibuja los iconos PNG de la app sin dependencias: una tarjeta con líneas sobre fondo azul tinta.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';

const DESTINO = join(dirname(fileURLToPath(import.meta.url)), '..', 'iconos');
const FONDO = [31, 58, 110];
const PAPEL = [251, 250, 247];
const TINTA = [31, 58, 110];
const ACENTO = [217, 107, 58];

function dentro(u, v, x0, y0, x1, y1, r) {
  const cx = Math.max(x0 + r, Math.min(u, x1 - r));
  const cy = Math.max(y0 + r, Math.min(v, y1 - r));
  return (u - cx) ** 2 + (v - cy) ** 2 <= r ** 2;
}

function color(u, v) {
  if (dentro(u, v, .32, .36, .68, .42, .025)) return ACENTO;
  if (dentro(u, v, .32, .49, .68, .535, .02)) return TINTA;
  if (dentro(u, v, .32, .59, .68, .635, .02)) return TINTA;
  if (dentro(u, v, .32, .69, .55, .735, .02)) return TINTA;
  if (dentro(u, v, .24, .22, .76, .82, .05)) return PAPEL;
  return FONDO;
}

function bloque(tipo, datos) {
  const cabecera = Buffer.from(tipo, 'latin1');
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const suma = Buffer.alloc(4);
  suma.writeUInt32BE(crc32(Buffer.concat([cabecera, datos])));
  return Buffer.concat([largo, cabecera, datos, suma]);
}

function png(lado) {
  const crudo = Buffer.alloc((lado * 3 + 1) * lado);
  let i = 0;
  for (let y = 0; y < lado; y += 1) {
    crudo[i++] = 0;
    for (let x = 0; x < lado; x += 1) {
      const c = color((x + .5) / lado, (y + .5) / lado);
      crudo[i++] = c[0]; crudo[i++] = c[1]; crudo[i++] = c[2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(lado, 0);
  ihdr.writeUInt32BE(lado, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    bloque('IHDR', ihdr), bloque('IDAT', deflateSync(crudo)), bloque('IEND', Buffer.alloc(0)),
  ]);
}

await mkdir(DESTINO, { recursive: true });
for (const lado of [180, 192, 512]) await writeFile(join(DESTINO, `icono-${lado}.png`), png(lado));
