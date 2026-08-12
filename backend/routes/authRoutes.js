const express = require("express");
const router = express.Router();

const {
    registrarPracticante,
    login
} = require("../controllers/authController");

// Registro de practicante
router.post("/registro", registrarPracticante);

// Inicio de sesión
router.post("/login", login);

module.exports = router;