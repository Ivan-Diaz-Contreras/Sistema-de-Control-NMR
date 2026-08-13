const db = require("../config/db");

const obtenerPerfil = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            p.id_practicante,
            p.matricula,
            p.telefono,
            p.universidad,
            p.fecha_inicio,
            p.fecha_fin,
            p.horas_requeridas,
            c.id_carrera,
            c.nombre AS carrera
        FROM usuarios u
        INNER JOIN practicantes p
            ON u.id_usuario = p.id_usuario
        INNER JOIN carreras c
            ON p.id_carrera = c.id_carrera
        WHERE u.id_usuario = ?
    `;

    db.query(sql, [idUsuario], (error, resultados) => {
        if (error) {
            console.error("Error obteniendo perfil:", error);

            return res.status(500).json({
                mensaje: "Error al consultar el perfil"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Perfil de practicante no encontrado"
            });
        }

        return res.status(200).json({
            perfil: resultados[0]
        });
    });
};

const registrarHoras = (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const { fecha, horas, descripcion } = req.body;

    if (!fecha || horas === undefined || horas === null) {
        return res.status(400).json({
            mensaje: "Fecha y horas son obligatorias"
        });
    }

    const cantidadHoras = Number(horas);

    if (!Number.isFinite(cantidadHoras) || cantidadHoras <= 0) {
        return res.status(400).json({
            mensaje: "La cantidad de horas debe ser mayor a 0"
        });
    }

    // Obtener el practicante correspondiente al usuario autenticado
    db.query(
        "SELECT id_practicante FROM practicantes WHERE id_usuario = ?",
        [idUsuario],
        (error, resultados) => {
            if (error) {
                console.error("Error buscando practicante:", error);

                return res.status(500).json({
                    mensaje: "Error al consultar el practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: "Practicante no encontrado"
                });
            }

            const idPracticante = resultados[0].id_practicante;

            const sql = `
                INSERT INTO registros_horas
                (
                    id_practicante,
                    fecha,
                    horas,
                    descripcion
                )
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    idPracticante,
                    fecha,
                    cantidadHoras,
                    descripcion || null
                ],
                (errorRegistro, resultado) => {
                    if (errorRegistro) {
                        console.error(
                            "Error registrando horas:",
                            errorRegistro
                        );

                        return res.status(500).json({
                            mensaje: "Error al registrar las horas"
                        });
                    }

                    return res.status(201).json({
                        mensaje: "Horas registradas correctamente",
                        id_registro: resultado.insertId
                    });
                }
            );
        }
    );
};

const obtenerAvance = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            p.horas_requeridas,
            COALESCE(SUM(rh.horas), 0) AS horas_acumuladas
        FROM practicantes p
        LEFT JOIN registros_horas rh
            ON p.id_practicante = rh.id_practicante
        WHERE p.id_usuario = ?
        GROUP BY p.id_practicante, p.horas_requeridas
    `;

    db.query(sql, [idUsuario], (error, resultados) => {
        if (error) {
            console.error("Error obteniendo avance:", error);

            return res.status(500).json({
                mensaje: "Error al calcular el avance"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Practicante no encontrado"
            });
        }

        const horasRequeridas = Number(resultados[0].horas_requeridas);
        const horasAcumuladas = Number(resultados[0].horas_acumuladas);

        const horasRestantes = Math.max(
            horasRequeridas - horasAcumuladas,
            0
        );

        const porcentajeAvance =
            horasRequeridas > 0
                ? Math.min(
                      (horasAcumuladas / horasRequeridas) * 100,
                      100
                  )
                : 0;

        return res.status(200).json({
            horas_requeridas: horasRequeridas,
            horas_acumuladas: horasAcumuladas,
            horas_restantes: horasRestantes,
            porcentaje_avance: Number(
                porcentajeAvance.toFixed(2)
            )
        });
    });
};

// ==========================================
// OBTENER REGISTROS DE HORAS
// ==========================================

const obtenerHoras = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            rh.id_registro,
            rh.fecha,
            rh.horas,
            rh.descripcion,
            rh.fecha_creacion
        FROM registros_horas rh
        INNER JOIN practicantes p
            ON rh.id_practicante = p.id_practicante
        WHERE p.id_usuario = ?
        ORDER BY rh.fecha DESC, rh.id_registro DESC
    `;

    db.query(sql, [idUsuario], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo registros de horas:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar los registros de horas"
            });
        }

        return res.status(200).json({
            total_registros: resultados.length,
            registros: resultados.map((registro) => ({
                ...registro,
                horas: Number(registro.horas)
            }))
        });
    });
};

module.exports = {
    obtenerPerfil,
    registrarHoras,
    obtenerAvance,
    obtenerHoras
};