const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpetaBitacoras = path.join(__dirname, "../uploads/bitacoras");

// Crear carpeta si no existe
if (!fs.existsSync(carpetaBitacoras)) {
    fs.mkdirSync(carpetaBitacoras, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, carpetaBitacoras);
    },

    filename: (req, file, cb) => {
        const nombreUnico =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, nombreUnico);
    }
});

const filtroArchivo = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(
            new Error("Solo se permiten archivos PDF"),
            false
        );
    }
};

const subirBitacora = multer({
    storage,
    fileFilter: filtroArchivo,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = subirBitacora;