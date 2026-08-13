const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/verificarToken");

const {
    registrarEntrada,
    registrarSalida,
    obtenerHorario,
    obtenerHistorial
} = require("../controllers/asistenciaController");

// Registrar entrada
router.post(
    "/entrada",
    verificarToken,
    registrarEntrada
);

// Registrar salida
router.post(
    "/salida",
    verificarToken,
    registrarSalida
);

// Consultar horario
router.get(
    "/horario",
    verificarToken,
    obtenerHorario
);

// Consultar historial de asistencias
router.get(
    "/historial",
    verificarToken,
    obtenerHistorial
);

module.exports = router;