const db = require("../config/db");

// ==========================================
// CREAR NOTIFICACIÓN
// ==========================================

const crearNotificacion = ({
    id_usuario,
    seccion,
    tipo,
    titulo,
    mensaje = null
}) => {
    if (
        !id_usuario ||
        !seccion ||
        !tipo ||
        !titulo
    ) {
        console.error(
            "No se pudo crear la notificación: faltan datos obligatorios"
        );

        return;
    }

    const sql = `
        INSERT INTO notificaciones (
            id_usuario,
            seccion,
            tipo,
            titulo,
            mensaje
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            id_usuario,
            seccion,
            tipo,
            titulo,
            mensaje
        ],
        (error) => {
            if (error) {
                console.error(
                    "Error creando notificación:",
                    error
                );
            }
        }
    );
};

module.exports = crearNotificacion;