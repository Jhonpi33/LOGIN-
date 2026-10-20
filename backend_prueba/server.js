import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import dbConnection from "./database.js";
import { validateJWT } from "./middlewares/validateJWT.js";
import { routerUsuario } from "./routes/usuarios.routes.js";
import { routerCurso } from "./routes/cursos.routes.js";
import { routerAprendiz } from "./routes/aprendices.routes.js";

dotenv.config();

// En modulos ES no existe __dirname; se reconstruye a partir de import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Representa el servidor de la aplicacion.
 * @class
 */
class Server {
  /**
   * @constructor
   */
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4500;
    // Carpeta con el frontend ya compilado. El build del frontend se copia aqui
    // (ver "npm run deploy:backend" en el frontend) y este mismo servidor lo sirve.
    this.publicPath = path.join(__dirname, "public");
    this.middlewares();
    this.routes();
    this.conexionBd();
  }

  /**
   * Middlewares globales (se ejecutan en TODAS las peticiones).
   */
  middlewares() {
    this.app.use(express.json()); // permite leer req.body en formato JSON
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors()); // permite que el frontend (otro puerto) consuma la API
    this.app.use(morgan("dev")); // muestra en consola cada peticion que llega

    // POR DEFECTO el backend NO sirve nada visual: en http://localhost:4500 solo
    // vive la API (JSON). El frontend corre aparte con "npm run dev" en el 5173.
    //
    // Si un dia quieres que este mismo servidor entregue el frontend compilado
    // (produccion), copia el build a public/ y pon SERVIR_FRONTEND=true en .env.
    if (process.env.SERVIR_FRONTEND === "true") {
      this.app.use(express.static(this.publicPath));
    }
  }

  /**
   * Registra las rutas de la aplicacion.
   * Cada modelo tiene su propio router montado bajo /api/<recurso>
   *
   * Aqui se ve de un vistazo QUE ESTA PROTEGIDO: el middleware validateJWT se
   * pone entre la URL y el router. Todo lo que pase por ahi necesita mandar la
   * cabecera x-token; si no, corta con un 401 y el controlador ni se entera.
   */
  routes() {
    // Publico: es por donde se consigue el token.
    this.app.use("/api/usuarios", routerUsuario);

    // Privado: requieren token.
    this.app.use("/api/cursos", validateJWT, routerCurso);
    this.app.use("/api/aprendices", validateJWT, routerAprendiz);

    // Ruta de cortesia para comprobar rapido que el servidor responde.
    // Antes devolvia texto plano; ahora devuelve JSON (ok, mensaje, estado de
    // la base de datos y fecha) para poder leerse desde el frontend o con curl.
    this.app.get("/life", (req, res) => {
      res.json(this.estado());
    });

    // Estado del servidor en JSON (PUBLICO: no pide token). Es el mismo
    // contenido de /life pero montado bajo /api para consumirlo con la misma
    // instancia de axios que usa el resto del frontend.
    this.app.get("/api/estado", (req, res) => {
      res.json(this.estado());
    });

    // Una ruta de API (/api/...) que no coincide con las de arriba cae aqui y
    // responde 404 en JSON. Este msg lo muestra el frontend tal cual en un
    // Notify, por eso va en español igual que los demas mensajes del backend.
    this.app.use("/api/*", (req, res) => {
      res.status(404).json({ msg: "La ruta solicitada no existe" });
    });

    // Cualquier OTRA ruta (/, /algo, /favicon.svg...) responde 404 en JSON con
    // una pista de donde esta el frontend. Antes aqui se servia el index.html
    // viejo que habia en public/ y se abria una interfaz distinta a la real.
    this.app.get("*", (req, res) => {
      const indexHtml = path.join(this.publicPath, "index.html");
      if (process.env.SERVIR_FRONTEND === "true" && fs.existsSync(indexHtml)) {
        return res.sendFile(indexHtml);
      }
      res.status(404).json({
        msg: "La ruta solicitada no existe",
        ayuda: "La API vive en /api (prueba /api/estado). El frontend corre en http://localhost:5173"
      });
    });
  }

  /**
   * Arma el JSON con el estado del servidor. Listo para mostrar en el
   * frontend o para leerlo con curl / abrirlo en el navegador.
   *
   * Mongoose expone el estado de la conexion en connection.readyState:
   * 0 desconectado · 1 conectado · 2 conectando · 3 desconectando.
   *
   * @returns {{ok: boolean, mensaje: string, servicio: string, puerto: number|string, baseDatos: string, fecha: string}}
   */
  estado() {
    const estados = {
      0: "desconectada",
      1: "conectada",
      2: "conectando",
      3: "desconectando"
    };

    const estadoBd = estados[mongoose.connection.readyState] || "desconocida";

    return {
      ok: true,
      mensaje: "El servidor esta funcionando",
      servicio: "API Campus",
      puerto: this.port,
      baseDatos: estadoBd,
      fecha: new Date().toISOString()
    };
  }

  /**
   * Conecta a la base de datos.
   */
  async conexionBd() {
    await dbConnection();
  }

  /**
   * Inicia el servidor.
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`Servidor en http://localhost:${this.port}`);
    });
  }
}

export default Server;
