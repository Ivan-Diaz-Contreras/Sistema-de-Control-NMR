const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/verificarToken");

const {
    obtenerPerfil,
    registrarHoras,
    obtenerAvance,
    obtenerHoras,
    actualizarPerfil
} = require("../controllers/practicanteController");

// Obtener perfil
router.get(
    "/perfil",
    verificarToken,
    obtenerPerfil
);

// Actualizar perfil
router.put(
    "/perfil",
    verificarToken,
    actualizarPerfil
);

// Registrar horas
router.post(
    "/horas",
    verificarToken,
    registrarHoras
);

// Consultar registros de horas
router.get(
    "/horas",
    verificarToken,
    obtenerHoras
);

// Consultar avance
router.get(
    "/avance",
    verificarToken,
    obtenerAvance
);

module.exports = router;