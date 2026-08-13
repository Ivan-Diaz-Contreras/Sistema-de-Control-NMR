const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

//Ruta de practicantes
const practicanteRoutes = require("./routes/practicanteRoutes");

//Ruta asistencia
const asistenciaRoutes = require("./routes/asistenciaRoutes");

//Ruta de administrador
const adminRoutes = require("./routes/adminRoutes");

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRoutes);
app.use("/api/practicantes", practicanteRoutes);

// Ruta principal
app.get("/", (req, res) => {
    res.send("Servidor del Sistema de Control NMR funcionando correctamente");
});

//Ruta de asistencias
app.use("/api/practicantes/asistencia", asistenciaRoutes);

//Ruta de admin
app.use("/api/admin", adminRoutes);

// Prueba de conexión con MySQL
app.get("/db-test", (req, res) => {
    db.query("SELECT 1 AS conexion", (error, results) => {
        if (error) {
            console.error("Error en la consulta:", error.message);

            return res.status(500).json({
                error: "No se pudo consultar la base de datos"
            });
        }

        res.json(results);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});