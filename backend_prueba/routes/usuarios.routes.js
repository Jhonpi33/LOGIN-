import { Router } from "express";
import { usuarioCtrl } from "../controller/usuario.controller.js";
import { usuarioVali } from "../validations/usuario.validation.js";
import { validateJWT } from "../middlewares/validateJWT.js";
import { validateAdmin } from "../middlewares/validateAdmin.js";

const {
  loginUsuario,
  registerUsuario,
  getUsuarios,
  getUsuarioId,
  updateUsuario,
  roleUsuario,
  activeUsuario,
  inactiveUsuario,
} = usuarioCtrl;

const {
  validateLogin,
  validateRegisterUsuario,
  validateExistUsuario,
  validateUpdateUsuario,
  validateRoleUsuario,
} = usuarioVali;

const routerUsuario = Router();

// El LOGIN es la unica ruta publica de todo el backend: es la puerta por la que
// se consigue el token. Si tambien pidiera token, nadie podria entrar nunca
// (el clasico problema del huevo y la gallina).
//
// POST /api/usuarios/login    -> iniciar sesion y recibir el token
routerUsuario.post("/login", validateLogin, loginUsuario);

// El REGISTRO es de administrador: agregar cuentas es una tarea de quien ya
// entro y ademas tiene rol ADMIN. El primer usuario lo crea el seed.
//
// POST /api/usuarios/register -> crear cuenta (requiere token + rol ADMIN)
routerUsuario.post(
  "/register",
  validateJWT,
  validateAdmin,
  validateRegisterUsuario,
  registerUsuario,
);

// ----- Lectura: cualquiera con sesion valida puede VER -----
//
// GET /api/usuarios         -> lista todos (sin password)
// GET /api/usuarios/:id     -> uno por id
routerUsuario.get("/", validateJWT, getUsuarios);
routerUsuario.get("/:id", validateJWT, validateExistUsuario, getUsuarioId);

// ----- Escritura: SOLO administrador (validateAdmin corta con un 403) -----
//
// PUT /api/usuarios/update/:id   -> nombre, email y rol
// PUT /api/usuarios/role/:id     -> solo el rol (ADMIN <-> USER)
// PUT /api/usuarios/active/:id   -> reactivar
// PUT /api/usuarios/inactive/:id -> "eliminar": queda inactivo, no se borra
routerUsuario.put(
  "/update/:id",
  validateJWT,
  validateAdmin,
  validateUpdateUsuario,
  updateUsuario,
);

routerUsuario.put(
  "/role/:id",
  validateJWT,
  validateAdmin,
  validateRoleUsuario,
  roleUsuario,
);

routerUsuario.put(
  "/active/:id",
  validateJWT,
  validateAdmin,
  validateExistUsuario,
  activeUsuario,
);

routerUsuario.put(
  "/inactive/:id",
  validateJWT,
  validateAdmin,
  validateExistUsuario,
  inactiveUsuario,
);

export { routerUsuario };
