const express = require("express");
const router = express.Router();

const {
    registrarPracticante
} = require("../controllers/authController");

router.post("/registro", registrarPracticante);

module.exports = router;