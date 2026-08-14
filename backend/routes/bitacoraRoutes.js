const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/verificarToken");
const subirArchivo =
    require("../middleware/subirBitacora");

const {
    subirBitacora
} = require("../controllers/bitacoraController");

router.post(
    "/",
    verificarToken,
    subirArchivo.single("archivo"),
    subirBitacora
);

module.exports = router;
