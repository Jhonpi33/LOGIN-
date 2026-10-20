/**
 * Establece la conexion a MongoDB usando la variable de entorno MONGO_URL.
 * Si falla, reintenta cada 5 segundos.
 * @async
 * @function dbConnection
 * @returns {Promise<void>}
 */
import dns from "dns";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

// Las cadenas "mongodb+srv://" hacen una consulta DNS especial (tipo SRV). En
// algunas redes el DNS local la rechaza (error "querySrv ECONNREFUSED") y la
// conexion nunca se logra, aunque en MongoDB Compass funcione. Forzar un DNS
// publico (Google y Cloudflare) resuelve ese caso y no afecta a otras redes.
//
// IMPORTANTE: esto va envuelto en try/catch porque se ejecuta AL IMPORTAR el
// modulo, antes de cualquier otro try. En contenedores con red restringida
// (Render, Docker) setServers puede lanzar y tumbar toda la app sin imprimir
// nada. Si falla, seguimos con el DNS del sistema: es un arreglo opcional,
// no una obligacion.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (error) {
  console.log("No se pudo forzar el DNS publico, se usa el del sistema: " + error.message);
}

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Conectado a la base de datos");
  } catch(e) {
    console.log("Error conectando a la base de datos, reintentando en 5s... "+e);
    setTimeout(() => {
      dbConnection();
    }, 5000);
  }
};

export default dbConnection;
