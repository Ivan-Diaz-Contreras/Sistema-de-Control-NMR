const db = require("../config/db");

// ==========================================
// OBTENER RESUMEN DE NOTIFICACIONES NO LEÍDAS
// ==========================================

const obtenerResumenNotificaciones = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    /*
     * IMPORTANTE:
     *
     * - Las secciones normales siguen usando notificaciones no leídas.
     * - "bitacoras" NO usa el historial de notificaciones para el badge.
     *   El badge representa las bitácoras que realmente están Pendientes.
     *
     * De esta manera:
     * entregar  -> +1
     * cancelar  -> -1
     * reenviar  -> +1
     * aprobar/rechazar -> -1
     */
    const sql = `
        SELECT
            n.seccion,
            COUNT(*) AS cantidad
        FROM notificaciones n
        WHERE n.id_usuario = ?
          AND n.leida = 0
          AND n.seccion <> 'bitacoras'
        GROUP BY n.seccion

        UNION ALL

        SELECT
            'bitacoras' AS seccion,
            COUNT(*) AS cantidad
        FROM bitacoras b
        WHERE b.estado = 'Pendiente'
    `;

    db.query(
        sql,
        [idUsuario],
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
                const cantidad = Number(
                    fila.cantidad || 0
                );

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
    const idUsuario = req.usuario.id_usuario;

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

const marcarSeccionComoLeida = (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const { seccion } = req.params;

    if (!seccion || !String(seccion).trim()) {
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