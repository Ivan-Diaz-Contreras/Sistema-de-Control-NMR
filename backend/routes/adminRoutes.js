const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/verificarToken");
const verificarAdmin = require("../middleware/verificarAdmin");

const {
    obtenerPracticantes,
    obtenerPracticantePorId,
    obtenerHorarioPracticante,
    obtenerAsistenciasPracticante,
    actualizarAsistencia,
    crearHorarioPracticante,
    actualizarHorario,
    obtenerHorasPracticante,
    actualizarRegistroHoras,
    eliminarRegistroHoras
} = require("../controllers/adminController");

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

// Actualizar una asistencia
router.put(
    "/asistencias/:id",
    verificarToken,
    verificarAdmin,
    actualizarAsistencia
);

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

module.exports = router;
