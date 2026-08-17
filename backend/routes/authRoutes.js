const express = require("express");
const router = express.Router();

const {
    registrarPracticante,
    login,
    obtenerCarrerasActivas
} = require("../controllers/authController");

const verificarToken = require("../middleware/verificarToken");

// Registro
router.post(
    "/registro",
    registrarPracticante
);

// Login
router.post(
    "/login",
    login
);

// Consultar carreras activas
router.get(
    "/carreras",
    obtenerCarrerasActivas
);

// Ruta protegida
router.get(
    "/protegida",
    verificarToken,
    (req, res) => {
        res.status(200).json({
            mensaje: "Acceso autorizado",
            usuario: req.usuario
        });
    }
);

module.exports = router;