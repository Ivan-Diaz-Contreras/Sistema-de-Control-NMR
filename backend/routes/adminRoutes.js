const express = require("express");
const router = express.Router();


const verificarToken = require("../middleware/verificarToken");
const verificarAdmin = require("../middleware/verificarAdmin");


const {
    obtenerPracticantes,
    obtenerPracticantePorId,
    actualizarPracticante,
    actualizarEstadoPracticante,
    eliminarPracticante,
    obtenerHorarioPracticante,
    obtenerAsistenciasPracticante,
    obtenerAsistenciasGeneral,
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
    obtenerEstadisticas,
    obtenerHistorialActividades,
    obtenerActividadesBitacora,
    crearActividadBitacora,
    actualizarActividadBitacora,
    actualizarEstadoActividadBitacora,
    eliminarActividadBitacora
} = require("../controllers/adminController");



// ==========================================
// PRACTICANTES
// ==========================================


// Consultar todos los practicantes
router.get(
    "/practicantes",
    verificarToken,
    verificarAdmin,
    obtenerPracticantes
);


// Consultar un practicante por ID
router.get(
    "/practicantes/:id",
    verificarToken,
    verificarAdmin,
    obtenerPracticantePorId
);


// Actualizar un practicante
router.put(
    "/practicantes/:id",
    verificarToken,
    verificarAdmin,
    actualizarPracticante
);


// Activar o desactivar un practicante
router.put(
    "/practicantes/:id/estado",
    verificarToken,
    verificarAdmin,
    actualizarEstadoPracticante
);


// Eliminar un practicante
// Solo podrá eliminarse si está desactivado.
// La validación principal se realiza en adminController.
router.delete(
    "/practicantes/:id",
    verificarToken,
    verificarAdmin,
    eliminarPracticante
);


// Consultar horario de un practicante
router.get(
    "/practicantes/:id/horario",
    verificarToken,
    verificarAdmin,
    obtenerHorarioPracticante
);


// Consultar asistencias de un practicante
router.get(
    "/practicantes/:id/asistencias",
    verificarToken,
    verificarAdmin,
    obtenerAsistenciasPracticante
);


// Consultar registros de horas de un practicante
router.get(
    "/practicantes/:id/horas",
    verificarToken,
    verificarAdmin,
    obtenerHorasPracticante
);



// ==========================================
// ASISTENCIAS
// ==========================================


// Consultar todas las asistencias
router.get(
    "/asistencias",
    verificarToken,
    verificarAdmin,
    obtenerAsistenciasGeneral
);


// Actualizar una asistencia
router.put(
    "/asistencias/:id",
    verificarToken,
    verificarAdmin,
    actualizarAsistencia
);



// ==========================================
// HORARIOS
// ==========================================


// Crear horario para un practicante
router.post(
    "/practicantes/:id/horario",
    verificarToken,
    verificarAdmin,
    crearHorarioPracticante
);


// Actualizar un horario
router.put(
    "/horarios/:id",
    verificarToken,
    verificarAdmin,
    actualizarHorario
);



// ==========================================
// HORAS
// ==========================================


// Actualizar un registro de horas
router.put(
    "/horas/:id",
    verificarToken,
    verificarAdmin,
    actualizarRegistroHoras
);


// Eliminar un registro de horas
router.delete(
    "/horas/:id",
    verificarToken,
    verificarAdmin,
    eliminarRegistroHoras
);



// ==========================================
// BITÁCORAS
// ==========================================


// Consultar bitácoras de un practicante
router.get(
    "/practicantes/:id/bitacoras",
    verificarToken,
    verificarAdmin,
    obtenerBitacorasPracticante
);


// Aprobar o rechazar una bitácora
router.put(
    "/bitacoras/:id/revision",
    verificarToken,
    verificarAdmin,
    revisarBitacora
);


// Visualizar PDF de una bitácora
router.get(
    "/bitacoras/:id/archivo",
    verificarToken,
    verificarAdmin,
    obtenerArchivoBitacoraAdmin
);



// ==========================================
// ACTIVIDADES DE BITÁCORA
// ==========================================


// Consultar actividades de bitácora
router.get(
    "/actividades-bitacora",
    verificarToken,
    verificarAdmin,
    obtenerActividadesBitacora
);


// Crear actividad de bitácora
router.post(
    "/actividades-bitacora",
    verificarToken,
    verificarAdmin,
    crearActividadBitacora
);


// Actualizar actividad de bitácora
router.put(
    "/actividades-bitacora/:id",
    verificarToken,
    verificarAdmin,
    actualizarActividadBitacora
);


// Activar o desactivar actividad de bitácora
router.put(
    "/actividades-bitacora/:id/estado",
    verificarToken,
    verificarAdmin,
    actualizarEstadoActividadBitacora
);


// Eliminar actividad de bitácora
router.delete(
    "/actividades-bitacora/:id",
    verificarToken,
    verificarAdmin,
    eliminarActividadBitacora
);



// ==========================================
// CARRERAS
// ==========================================


// Consultar todas las carreras
router.get(
    "/carreras",
    verificarToken,
    verificarAdmin,
    obtenerCarreras
);


// Crear una carrera
router.post(
    "/carreras",
    verificarToken,
    verificarAdmin,
    crearCarrera
);


// Actualizar, activar o desactivar una carrera
router.put(
    "/carreras/:id",
    verificarToken,
    verificarAdmin,
    actualizarCarrera
);



// ==========================================
// ESTADÍSTICAS
// ==========================================


// Consultar estadísticas generales
router.get(
    "/estadisticas",
    verificarToken,
    verificarAdmin,
    obtenerEstadisticas
);



// ==========================================
// HISTORIAL DE ACTIVIDADES
// ==========================================


// Consultar historial de actividades
router.get(
    "/historial",
    verificarToken,
    verificarAdmin,
    obtenerHistorialActividades
);


module.exports = router;