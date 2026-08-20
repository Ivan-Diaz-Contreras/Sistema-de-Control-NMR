const express = require("express");
const router = express.Router();

const verificarToken = require(
    "../middleware/verificarToken"
);

const verificarPracticante = require(
    "../middleware/verificarPracticante"
);

const {
    obtenerPerfil,
    cambiarPassword,
    registrarHoras,
    obtenerAvance,
    obtenerHoras,
    actualizarPerfil
} = require(
    "../controllers/practicanteController"
);


// Obtener perfil
router.get(
    "/perfil",
    verificarToken,
    verificarPracticante,
    obtenerPerfil
);


// Actualizar perfil
router.put(
    "/perfil",
    verificarToken,
    verificarPracticante,
    actualizarPerfil
);


// Cambiar contraseña
router.put(
    "/password",
    verificarToken,
    verificarPracticante,
    cambiarPassword
);


// Registrar horas
router.post(
    "/horas",
    verificarToken,
    verificarPracticante,
    registrarHoras
);


// Consultar registros de horas
router.get(
    "/horas",
    verificarToken,
    verificarPracticante,
    obtenerHoras
);


// Consultar avance
router.get(
    "/avance",
    verificarToken,
    verificarPracticante,
    obtenerAvance
);


module.exports = router;