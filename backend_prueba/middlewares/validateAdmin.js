/**
 * @fileoverview Middleware que restringe rutas a administradores.
 *
 * Se pone SIEMPRE despues de validateJWT, porque lee el usuario que ese
 * middleware dejo en req:
 *
 *   routerUsuario.put("/update/:id", validateJWT, validateAdmin, updateUsuario);
 *
 * 403 (Forbidden) = "se quien eres, pero no tienes permiso". Es distinto del
 * 401, que significa "no se quien eres". Si el frontend recibe 403 NO debe
 * cerrar la sesion, solo avisarle al usuario.
 *
 * @module middlewares/validateAdmin
 */

/**
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const validateAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== "ADMIN") {
    return res.status(403).json({ msg: "Requiere permisos de administrador" });
  }
  next();
};

export { validateAdmin };
