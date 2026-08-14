const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/verificarToken");
const subirArchivo = require("../middleware/subirBitacora");

const {
    subirBitacora,
    obtenerBitacoras,
    obtenerArchivoBitacora
} = require("../controllers/bitacoraController");

// Subir bitácora PDF
router.post(
    "/",
    verificarToken,
    subirArchivo.single("archivo"),
    subirBitacora
);

// Consultar historial de bitácoras
router.get(
    "/",
    verificarToken,
    obtenerBitacoras
);

// Visualizar archivo PDF de una bitácora
router.get(
    "/:id/archivo",
    verificarToken,
    obtenerArchivoBitacora
);

module.exports = router;