const express = require("express");

const router = express.Router();

const verificarToken = require("../middleware/verificarToken");
const verificarAdmin = require("../middleware/verificarAdmin");

const {
    obtenerPracticantes,
    crearPracticanteAdmin,
    obtenerPracticantePorId,
    actualizarPracticante,
    actualizarEstadoPracticante,
    eliminarPracticante,
    obtenerHorarioPracticante,
    obtenerAsistenciasPracticante,
    obtenerAsistenciasGeneral,
    crearAsistenciaHistorica,
    actualizarAsistencia,
    crearHorarioPracticante,
    actualizarHorario,
    obtenerHorasPracticante,
    actualizarRegistroHoras,
    eliminarRegistroHoras,
    obtenerBitacorasPracticante,
    revisarBitacora,
    obtenerArchivoBitacoraAdmin,
    obtenerCarreras,
    crearCarrera,
    actualizarCarrera,
    obtenerAlertasAdmin,
    obtenerEstadisticas,
    obtenerHistorialActividades,
    obtenerActividadesBitacora,
    crearActividadBitacora,
    actualizarActividadBitacora,
    actualizarEstadoActividadBitacora,
    eliminarActividadBitacora,
    cambiarPasswordAdmin,
    crearAdministrador,
    obtenerAdministradores
} = require("../controllers/adminController");

// ==========================================
// PRACTICANTES
// ==========================================

router.get(
    "/practicantes",
    verificarToken,
    verificarAdmin,
    obtenerPracticantes
);

router.post(
    "/practicantes",
    verificarToken,
    verificarAdmin,
    crearPracticanteAdmin
);

router.get(
    "/practicantes/:id",
    verificarToken,
    verificarAdmin,
    obtenerPracticantePorId
);

router.put(
    "/practicantes/:id",
    verificarToken,
    verificarAdmin,
    actualizarPracticante
);

router.put(
    "/practicantes/:id/estado",
    verificarToken,
    verificarAdmin,
    actualizarEstadoPracticante
);

router.delete(
    "/practicantes/:id",
    verificarToken,
    verificarAdmin,
    eliminarPracticante
);

router.get(
    "/practicantes/:id/horario",
    verificarToken,
    verificarAdmin,
    obtenerHorarioPracticante
);

router.get(
    "/practicantes/:id/asistencias",
    verificarToken,
    verificarAdmin,
    obtenerAsistenciasPracticante
);

router.get(
    "/practicantes/:id/horas",
    verificarToken,
    verificarAdmin,
    obtenerHorasPracticante
);

// ==========================================
// ASISTENCIAS
// ==========================================

router.get(
    "/asistencias",
    verificarToken,
    verificarAdmin,
    obtenerAsistenciasGeneral
);

router.post(
    "/asistencias/historica",
    verificarToken,
    verificarAdmin,
    crearAsistenciaHistorica
);

router.put(
    "/asistencias/:id",
    verificarToken,
    verificarAdmin,
    actualizarAsistencia
);

// ==========================================
// HORARIOS
// ==========================================

router.post(
    "/practicantes/:id/horario",
    verificarToken,
    verificarAdmin,
    crearHorarioPracticante
);

router.put(
    "/horarios/:id",
    verificarToken,
    verificarAdmin,
    actualizarHorario
);

// ==========================================
// HORAS
// ==========================================

router.put(
    "/horas/:id",
    verificarToken,
    verificarAdmin,
    actualizarRegistroHoras
);

router.delete(
    "/horas/:id",
    verificarToken,
    verificarAdmin,
    eliminarRegistroHoras
);

// ==========================================
// BITÁCORAS
// ==========================================

router.get(
    "/practicantes/:id/bitacoras",
    verificarToken,
    verificarAdmin,
    obtenerBitacorasPracticante
);

router.put(
    "/bitacoras/:id/revision",
    verificarToken,
    verificarAdmin,
    revisarBitacora
);

router.get(
    "/bitacoras/:id/archivo",
    verificarToken,
    verificarAdmin,
    obtenerArchivoBitacoraAdmin
);

// ==========================================
// ACTIVIDADES DE BITÁCORA
// ==========================================

router.get(
    "/actividades-bitacora",
    verificarToken,
    verificarAdmin,
    obtenerActividadesBitacora
);

router.post(
    "/actividades-bitacora",
    verificarToken,
    verificarAdmin,
    crearActividadBitacora
);

router.put(
    "/actividades-bitacora/:id",
    verificarToken,
    verificarAdmin,
    actualizarActividadBitacora
);

router.put(
    "/actividades-bitacora/:id/estado",
    verificarToken,
    verificarAdmin,
    actualizarEstadoActividadBitacora
);

router.delete(
    "/actividades-bitacora/:id",
    verificarToken,
    verificarAdmin,
    eliminarActividadBitacora
);

// ==========================================
// CARRERAS
// ==========================================

router.get(
    "/carreras",
    verificarToken,
    verificarAdmin,
    obtenerCarreras
);

router.post(
    "/carreras",
    verificarToken,
    verificarAdmin,
    crearCarrera
);

router.put(
    "/carreras/:id",
    verificarToken,
    verificarAdmin,
    actualizarCarrera
);

// ==========================================
// ALERTAS
// ==========================================

router.get(
    "/alertas",
    verificarToken,
    verificarAdmin,
    obtenerAlertasAdmin
);

// ==========================================
// ESTADÍSTICAS
// ==========================================

router.get(
    "/estadisticas",
    verificarToken,
    verificarAdmin,
    obtenerEstadisticas
);

// ==========================================
// HISTORIAL DE ACTIVIDADES
// ==========================================

router.get(
    "/historial",
    verificarToken,
    verificarAdmin,
    obtenerHistorialActividades
);

// ==========================================
// SEGURIDAD DEL ADMINISTRADOR
// ==========================================

router.put(
    "/password",
    verificarToken,
    verificarAdmin,
    cambiarPasswordAdmin
);

// ==========================================
// ADMINISTRADORES
// ==========================================
router.get(
    "/administradores",
    verificarToken,
    verificarAdmin,
    obtenerAdministradores
);

router.post(
    "/administradores",
    verificarToken,
    verificarAdmin,
    crearAdministrador
);



module.exports = router;