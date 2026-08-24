const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/verificarToken");

const {
    obtenerResumenNotificaciones,
    obtenerNotificaciones,
    marcarSeccionComoLeida
} = require("../controllers/notificacionController");

// ==========================================
// TODAS LAS RUTAS REQUIEREN SESIÓN
// ==========================================

router.use(verificarToken);

// Resumen para los badges de la barra lateral
router.get(
    "/resumen",
    obtenerResumenNotificaciones
);

// Lista completa de notificaciones
router.get(
    "/",
    obtenerNotificaciones
);

// Marcar como leídas las notificaciones de una sección
router.put(
    "/seccion/:seccion/leer",
    marcarSeccionComoLeida
);

module.exports = router;