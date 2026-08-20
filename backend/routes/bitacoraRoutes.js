const express = require("express");
const multer = require("multer");

const router = express.Router();

const verificarToken = require("../middleware/verificarToken");
const verificarPracticante = require("../middleware/verificarPracticante");
const subirArchivo = require("../middleware/subirBitacora");

const {
    subirBitacora,
    obtenerActividadesDisponibles,
    obtenerBitacoras,
    obtenerArchivoBitacora
} = require("../controllers/bitacoraController");

// ==========================================
// SUBIR / REENVIAR BITÁCORA PDF
// ==========================================

router.post(
    "/",
    verificarToken,
    verificarPracticante,
    (req, res, next) => {
        subirArchivo.single("archivo")(req, res, (error) => {
            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    return res.status(413).json({
                        mensaje:
                            "El archivo PDF no puede superar los 10 MB"
                    });
                }

                return res.status(400).json({
                    mensaje:
                        "Error al procesar el archivo PDF"
                });
            }

            if (error) {
                return res.status(400).json({
                    mensaje: error.message
                });
            }

            next();
        });
    },
    subirBitacora
);

// ==========================================
// CONSULTAR HISTORIAL DE BITÁCORAS
// ==========================================

router.get(
    "/",
    verificarToken,
    verificarPracticante,
    obtenerBitacoras
);

// ==========================================
// CONSULTAR ACTIVIDADES DE BITÁCORA DISPONIBLES
// ==========================================

router.get(
    "/actividades",
    verificarToken,
    verificarPracticante,
    obtenerActividadesDisponibles
);

// ==========================================
// VISUALIZAR ARCHIVO PDF DE UNA BITÁCORA
// ==========================================

router.get(
    "/:id/archivo",
    verificarToken,
    verificarPracticante,
    obtenerArchivoBitacora
);

module.exports = router;