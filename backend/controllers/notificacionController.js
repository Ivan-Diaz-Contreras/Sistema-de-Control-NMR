const db = require("../config/db");

// ==========================================
// OBTENER RESUMEN DE NOTIFICACIONES NO LEÍDAS
// ==========================================

const obtenerResumenNotificaciones = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    /*
     * LÓGICA DEL BADGE:
     *
     * ADMINISTRADOR
     * - Las secciones normales usan notificaciones no leídas.
     * - "bitacoras" representa la cantidad REAL de bitácoras
     *   que siguen en estado "Pendiente" y necesitan revisión.
     *
     * PRACTICANTE
     * - Las secciones normales cuentan notificaciones no leídas.
     * - En "bitacoras", una misma bitácora solo cuenta UNA vez,
     *   aunque haya cambiado varias veces entre Aprobada/Rechazada.
     */

    const sql = `

        /* ==========================================
           NOTIFICACIONES NORMALES DEL USUARIO
           EXCEPTO BITÁCORAS
        ========================================== */

        SELECT
            n.seccion,
            COUNT(*) AS cantidad

        FROM notificaciones n

        WHERE n.id_usuario = ?
          AND n.leida = 0
          AND n.seccion <> 'bitacoras'

        GROUP BY n.seccion


        UNION ALL


        /* ==========================================
           BITÁCORAS DEL PRACTICANTE

           Contamos una sola vez cada bitácora
           mediante id_referencia.
        ========================================== */

        SELECT
            'bitacoras' AS seccion,

            COUNT(
                DISTINCT
                CASE

                    /* Notificaciones nuevas */
                    WHEN n.id_referencia IS NOT NULL
                    THEN CONCAT(
                        'BITACORA-',
                        n.id_referencia
                    )

                    /*
                     * Compatibilidad con notificaciones
                     * antiguas que todavía no tengan
                     * id_referencia.
                     */
                    ELSE CONCAT(
                        'NOTIFICACION-',
                        n.id_notificacion
                    )

                END
            ) AS cantidad

        FROM notificaciones n

        WHERE n.id_usuario = ?
          AND n.leida = 0
          AND n.seccion = 'bitacoras'

          AND NOT EXISTS (
                SELECT 1

                FROM usuarios u

                INNER JOIN roles r
                    ON u.id_rol = r.id_rol

                WHERE u.id_usuario = ?
                  AND LOWER(
                        TRIM(r.nombre)
                      ) = 'administrador'
          )


        UNION ALL


        /* ==========================================
           BITÁCORAS PENDIENTES DEL ADMINISTRADOR
        ========================================== */

        SELECT
            'bitacoras' AS seccion,
            COUNT(*) AS cantidad

        FROM bitacoras b

        WHERE b.estado = 'Pendiente'

          AND EXISTS (
                SELECT 1

                FROM usuarios u

                INNER JOIN roles r
                    ON u.id_rol = r.id_rol

                WHERE u.id_usuario = ?
                  AND LOWER(
                        TRIM(r.nombre)
                      ) = 'administrador'
          )

    `;

    db.query(
        sql,
        [
            idUsuario,
            idUsuario,
            idUsuario,
            idUsuario
        ],
        (error, resultados) => {

            if (error) {

                console.error(
                    "Error obteniendo resumen de notificaciones:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al obtener las notificaciones"
                });
            }

            const secciones = {};
            let total = 0;

            resultados.forEach((fila) => {

                const cantidad =
                    Number(fila.cantidad || 0);

                if (cantidad <= 0) {
                    return;
                }

                secciones[fila.seccion] =
                    (secciones[fila.seccion] || 0) +
                    cantidad;

                total += cantidad;
            });

            return res.status(200).json({
                total,
                secciones
            });
        }
    );
};


// ==========================================
// OBTENER NOTIFICACIONES DEL USUARIO
// ==========================================

const obtenerNotificaciones = (req, res) => {

    const idUsuario =
        req.usuario.id_usuario;

    const sql = `
        SELECT
            id_notificacion,
            seccion,
            tipo,
            titulo,
            mensaje,
            leida,
            fecha_creacion,
            fecha_lectura,
            referencia_tipo,
            id_referencia

        FROM notificaciones

        WHERE id_usuario = ?

        ORDER BY
            fecha_creacion DESC,
            id_notificacion DESC

        LIMIT 100
    `;

    db.query(
        sql,
        [idUsuario],
        (error, resultados) => {

            if (error) {

                console.error(
                    "Error obteniendo notificaciones:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al obtener las notificaciones"
                });
            }

            return res.status(200).json({
                total: resultados.length,
                notificaciones: resultados
            });
        }
    );
};


// ==========================================
// MARCAR UNA SECCIÓN COMO LEÍDA
// ==========================================

const marcarSeccionComoLeida = (
    req,
    res
) => {

    const idUsuario =
        req.usuario.id_usuario;

    const { seccion } =
        req.params;

    if (
        !seccion ||
        !String(seccion).trim()
    ) {
        return res.status(400).json({
            mensaje:
                "La sección es obligatoria"
        });
    }

    const seccionNormalizada =
        String(seccion).trim();

    const sql = `
        UPDATE notificaciones

        SET
            leida = 1,
            fecha_lectura = NOW()

        WHERE id_usuario = ?
          AND seccion = ?
          AND leida = 0
    `;

    db.query(
        sql,
        [
            idUsuario,
            seccionNormalizada
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    "Error marcando notificaciones como leídas:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al actualizar las notificaciones"
                });
            }

            return res.status(200).json({
                mensaje:
                    "Notificaciones marcadas como leídas",

                actualizadas:
                    resultado.affectedRows
            });
        }
    );
};


module.exports = {
    obtenerResumenNotificaciones,
    obtenerNotificaciones,
    marcarSeccionComoLeida
};