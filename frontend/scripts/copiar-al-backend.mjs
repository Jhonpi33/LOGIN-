/**
 * Copia el build del frontend (frontend/dist) a backend_prueba/public
 * para que el propio servidor de Express lo sirva en producción.
 *
 * Uso:  npm run build:backend     (compila y copia)
 *
 * ¿Por qué un script y no un "cp" a mano?
 *  - Funciona igual en Mac, Linux y Windows.
 *  - Borra primero lo viejo para que no queden archivos huérfanos
 *    (los assets de Vite llevan hash en el nombre: index-D6WDPJ8a.js).
 *  - Avisa en rojo si falta el build o la carpeta destino.
 */
import { cpSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const origen = join(__dirname, "..", "dist");
const destino = join(__dirname, "..", "..", "backend_prueba", "public");

if (!existsSync(origen)) {
  console.error(`\n  ✖ No existe ${origen}. Primero compila con:  npm run build\n`);
  process.exit(1);
}

// 1) Borra el contenido anterior (incluye el build viejo del profesor)
if (existsSync(destino)) {
  rmSync(destino, { recursive: true, force: true });
}

// 2) Copia el build nuevo
cpSync(origen, destino, { recursive: true });

// 3) Reporte
const archivos = readdirSync(destino);
const total = archivos.reduce((n, f) => {
  try {
    return n + readdirSync(join(destino, f)).length;
  } catch {
    return n + 1;
  }
}, 0);

console.log(`\n  ✔ Build copiado a backend_prueba/public  (${archivos.length} entradas raíz)`);
console.log(`    Contenido: ${archivos.join(", ")}`);
console.log(`\n  Para servirlo en local: pon SERVIR_FRONTEND=true en backend_prueba/.env\n`);
