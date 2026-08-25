const express = require("express");

const router = express.Router();

const verificarToken = require(
    "../middleware/verificarToken"
);

const {
    obtenerMisActividades,
    crearMiActividad,
    actualizarMiActividad,
    eliminarMiActividad,
    obtenerActividadesAdmin,
    crearActividadAdmin,
    actualizarActividadAdmin,
    eliminarActividadAdmin
} = require(
    "../controllers/actividadDiariaController"
);

router.use(verificarToken);

// ==========================================
// PRACTICANTE
// ==========================================

router.get(
    "/mis",
    obtenerMisActividades
);

router.post(
    "/mis",
    crearMiActividad
);

router.put(
    "/mis/:id",
    actualizarMiActividad
);

router.delete(
    "/mis/:id",
    eliminarMiActividad
);

// ==========================================
// ADMINISTRADOR
// ==========================================

router.get(
    "/admin",
    obtenerActividadesAdmin
);

router.post(
    "/admin",
    crearActividadAdmin
);

router.put(
    "/admin/:id",
    actualizarActividadAdmin
);

router.delete(
    "/admin/:id",
    eliminarActividadAdmin
);

module.exports = router;