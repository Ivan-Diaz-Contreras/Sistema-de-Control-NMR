const db = require("../config/db");

// ==========================================
// REGISTRAR ACTIVIDAD EN EL HISTORIAL
// ==========================================

const registrarActividad = (
    idUsuario,
    accion,
    descripcion
) => {
    const sql = `
        INSERT INTO historial_actividades (
            id_usuario,
            accion,
            descripcion
        )
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            idUsuario || null,
            accion,
            descripcion || null
        ],
        (error) => {
            if (error) {
                console.error(
                    "Error registrando actividad:",
                    error
                );
            }
        }
    );
};

module.exports = registrarActividad;