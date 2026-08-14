const express = require("express");
const cors = require("cors");

const db = require("./config/db");

// Rutas
const authRoutes = require("./routes/authRoutes");
const practicanteRoutes = require("./routes/practicanteRoutes");
const asistenciaRoutes = require("./routes/asistenciaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bitacoraRoutes = require("./routes/bitacoraRoutes");

const app = express();
const PORT = 3000;

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// RUTAS
// ==========================================

// Autenticación
app.use("/api/auth", authRoutes);

// Practicantes
app.use("/api/practicantes", practicanteRoutes);

// Asistencias
app.use(
    "/api/practicantes/asistencia",
    asistenciaRoutes
);

// Bitácoras
app.use(
    "/api/practicantes/bitacoras",
    bitacoraRoutes
);

// Administrador
app.use("/api/admin", adminRoutes);

// ==========================================
// RUTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {
    res.send(
        "Servidor del Sistema de Control NMR funcionando correctamente"
    );
});

// ==========================================
// PRUEBA DE CONEXIÓN CON MYSQL
// ==========================================

app.get("/db-test", (req, res) => {
    db.query(
        "SELECT 1 AS conexion",
        (error, results) => {
            if (error) {
                console.error(
                    "Error en la consulta:",
                    error.message
                );

                return res.status(500).json({
                    error:
                        "No se pudo consultar la base de datos"
                });
            }

            res.json(results);
        }
    );
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(
        `Servidor funcionando en http://localhost:${PORT}`
    );
});