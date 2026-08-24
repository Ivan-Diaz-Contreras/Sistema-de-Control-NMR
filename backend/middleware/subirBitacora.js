const multer = require("multer");

// ==========================================
// GUARDAR PDF TEMPORALMENTE EN MEMORIA
// ==========================================

const storage = multer.memoryStorage();

// ==========================================
// VALIDAR QUE SEA PDF
// ==========================================

const filtroArchivo = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        return cb(null, true);
    }

    return cb(
        new Error("Solo se permiten archivos PDF"),
        false
    );
};

// ==========================================
// CONFIGURACIÓN DE MULTER
// ==========================================

const subirBitacora = multer({
    storage,

    fileFilter: filtroArchivo,

    limits: {
        // Máximo 10 MB
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = subirBitacora;