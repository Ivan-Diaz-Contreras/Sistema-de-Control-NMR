const multer = require("multer");

// ==========================================
// GUARDAR PDF TEMPORALMENTE EN MEMORIA
// ==========================================

const storage = multer.memoryStorage();

// ==========================================
// CORREGIR NOMBRE UTF-8 DEL ARCHIVO
// ==========================================

const corregirNombreArchivo = (nombre) => {
    const nombreOriginal =
        String(nombre || "");

    // Si ya viene correctamente codificado,
    // no hacemos una conversión innecesaria.
    if (
        !nombreOriginal.includes("Ã") &&
        !nombreOriginal.includes("Â")
    ) {
        return nombreOriginal.normalize("NFC");
    }

    try {
        return Buffer
            .from(
                nombreOriginal,
                "latin1"
            )
            .toString("utf8")
            .normalize("NFC");
    } catch (error) {
        console.error(
            "Error corrigiendo nombre del archivo:",
            error
        );

        return nombreOriginal;
    }
};

// ==========================================
// VALIDAR QUE SEA PDF
// ==========================================

const filtroArchivo = (req, file, cb) => {
    if (
        file.mimetype !==
        "application/pdf"
    ) {
        return cb(
            new Error(
                "Solo se permiten archivos PDF"
            ),
            false
        );
    }

    file.originalname =
        corregirNombreArchivo(
            file.originalname
        );

    return cb(null, true);
};

// ==========================================
// CONFIGURACIÓN DE MULTER
// ==========================================

const subirBitacora = multer({
    storage,

    fileFilter: filtroArchivo,

    limits: {
        // Máximo 10 MB
        fileSize:
            10 * 1024 * 1024
    }
});

module.exports = subirBitacora;