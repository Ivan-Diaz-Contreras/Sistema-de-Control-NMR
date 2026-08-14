const db = require("../config/db");
const registrarActividad = require("../utils/registrarActividad");

// ==========================================
// REGISTRAR ENTRADA
// ==========================================

const registrarEntrada = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const ahora = new Date();

    const fechaActual = ahora.toISOString().split("T")[0];
    const horaActual = ahora.toTimeString().split(" ")[0];

    const dias = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    const diaSemana = dias[ahora.getDay()];

    // Buscar practicante
    db.query(
        "SELECT id_practicante FROM practicantes WHERE id_usuario = ?",
        [idUsuario],
        (errorPracticante, resultadosPracticante) => {
            if (errorPracticante) {
                console.error(
                    "Error buscando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje: "Error al consultar el practicante"
                });
            }

            if (resultadosPracticante.length === 0) {
                return res.status(404).json({
                    mensaje: "Practicante no encontrado"
                });
            }

            const idPracticante =
                resultadosPracticante[0].id_practicante;

            // Buscar horario del día actual
            const sqlHorario = `
                SELECT
                    id_horario,
                    hora_entrada,
                    hora_salida
                FROM horarios
                WHERE id_practicante = ?
                  AND dia_semana = ?
                  AND activo = TRUE
            `;

            db.query(
                sqlHorario,
                [idPracticante, diaSemana],
                (errorHorario, resultadosHorario) => {
                    if (errorHorario) {
                        console.error(
                            "Error consultando horario:",
                            errorHorario
                        );

                        return res.status(500).json({
                            mensaje: "Error al consultar el horario"
                        });
                    }

                    if (resultadosHorario.length === 0) {
                        return res.status(400).json({
                            mensaje:
                                "No tienes un horario asignado para hoy"
                        });
                    }

                    const horario = resultadosHorario[0];

                    // Verificar si ya existe asistencia hoy
                    const sqlAsistencia = `
                        SELECT id_asistencia, hora_entrada_real
                        FROM asistencias
                        WHERE id_practicante = ?
                          AND fecha = ?
                    `;

                    db.query(
                        sqlAsistencia,
                        [idPracticante, fechaActual],
                        (errorAsistencia, resultadosAsistencia) => {
                            if (errorAsistencia) {
                                console.error(
                                    "Error consultando asistencia:",
                                    errorAsistencia
                                );

                                return res.status(500).json({
                                    mensaje:
                                        "Error al consultar la asistencia"
                                });
                            }

                            if (
                                resultadosAsistencia.length > 0 &&
                                resultadosAsistencia[0].hora_entrada_real
                            ) {
                                return res.status(409).json({
                                    mensaje:
                                        "La entrada de hoy ya fue registrada"
                                });
                            }

                            const estado =
                                horaActual <= horario.hora_entrada
                                    ? "A tiempo"
                                    : "Retardo";

                            const sqlInsert = `
                                INSERT INTO asistencias (
                                    id_practicante,
                                    id_horario,
                                    fecha,
                                    hora_entrada_real,
                                    estado
                                )
                                VALUES (?, ?, ?, ?, ?)
                            `;

                            db.query(
                                sqlInsert,
                                [
                                    idPracticante,
                                    horario.id_horario,
                                    fechaActual,
                                    horaActual,
                                    estado
                                ],
                                (errorInsert, resultadoInsert) => {
                                    if (errorInsert) {
                                        console.error(
                                            "Error registrando entrada:",
                                            errorInsert
                                        );

                                        return res.status(500).json({
                                            mensaje:
                                                "Error al registrar la entrada"
                                        });
                                    }

                                    registrarActividad(
                                        idUsuario,
                                        "REGISTRAR_ENTRADA",
                                        `El practicante registró su entrada el ${fechaActual} a las ${horaActual} con estado: ${estado}`
                                    );

                                    return res.status(201).json({
                                        mensaje:
                                            "Entrada registrada correctamente",
                                        id_asistencia:
                                            resultadoInsert.insertId,
                                        fecha: fechaActual,
                                        hora_entrada: horaActual,
                                        estado
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// ==========================================
// REGISTRAR SALIDA
// ==========================================

const registrarSalida = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const ahora = new Date();
    const fechaActual = ahora.toISOString().split("T")[0];
    const horaActual = ahora.toTimeString().split(" ")[0];

    // Buscar practicante
    db.query(
        "SELECT id_practicante FROM practicantes WHERE id_usuario = ?",
        [idUsuario],
        (errorPracticante, resultadosPracticante) => {
            if (errorPracticante) {
                console.error(
                    "Error buscando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje: "Error al consultar el practicante"
                });
            }

            if (resultadosPracticante.length === 0) {
                return res.status(404).json({
                    mensaje: "Practicante no encontrado"
                });
            }

            const idPracticante =
                resultadosPracticante[0].id_practicante;

            // Buscar asistencia de hoy
            const sqlAsistencia = `
                SELECT
                    id_asistencia,
                    hora_entrada_real,
                    hora_salida_real
                FROM asistencias
                WHERE id_practicante = ?
                  AND fecha = ?
            `;

            db.query(
                sqlAsistencia,
                [idPracticante, fechaActual],
                (errorAsistencia, resultadosAsistencia) => {
                    if (errorAsistencia) {
                        console.error(
                            "Error consultando asistencia:",
                            errorAsistencia
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al consultar la asistencia"
                        });
                    }

                    if (resultadosAsistencia.length === 0) {
                        return res.status(400).json({
                            mensaje:
                                "No has registrado tu entrada de hoy"
                        });
                    }

                    const asistencia = resultadosAsistencia[0];

                    if (!asistencia.hora_entrada_real) {
                        return res.status(400).json({
                            mensaje:
                                "Debes registrar tu entrada antes de la salida"
                        });
                    }

                    if (asistencia.hora_salida_real) {
                        return res.status(409).json({
                            mensaje:
                                "La salida de hoy ya fue registrada"
                        });
                    }

                    const sqlUpdate = `
                        UPDATE asistencias
                        SET
                            hora_salida_real = ?,
                            estado = CASE
                                WHEN estado = 'Pendiente'
                                    THEN 'Incompleta'
                                ELSE estado
                            END
                        WHERE id_asistencia = ?
                    `;

                    db.query(
                        sqlUpdate,
                        [
                            horaActual,
                            asistencia.id_asistencia
                        ],
                        (errorUpdate) => {
                            if (errorUpdate) {
                                console.error(
                                    "Error registrando salida:",
                                    errorUpdate
                                );

                                return res.status(500).json({
                                    mensaje:
                                        "Error al registrar la salida"
                                });
                            }

                            registrarActividad(
                                idUsuario,
                                "REGISTRAR_SALIDA",
                                `El practicante registró su salida el ${fechaActual} a las ${horaActual}`
                            );

                            return res.status(200).json({
                                mensaje:
                                    "Salida registrada correctamente",
                                id_asistencia:
                                    asistencia.id_asistencia,
                                fecha: fechaActual,
                                hora_entrada:
                                    asistencia.hora_entrada_real,
                                hora_salida: horaActual
                            });
                        }
                    );
                }
            );
        }
    );
};

// ==========================================
// OBTENER HORARIO DEL PRACTICANTE
// ==========================================

const obtenerHorario = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            h.id_horario,
            h.dia_semana,
            h.hora_entrada,
            h.hora_salida,
            h.activo
        FROM horarios h
        INNER JOIN practicantes p
            ON h.id_practicante = p.id_practicante
        WHERE p.id_usuario = ?
          AND h.activo = TRUE
        ORDER BY FIELD(
            h.dia_semana,
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        )
    `;

    db.query(sql, [idUsuario], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo horario:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar el horario"
            });
        }

        return res.status(200).json({
            horario: resultados
        });
    });
};

// ==========================================
// OBTENER HISTORIAL DE ASISTENCIAS
// ==========================================

const obtenerHistorial = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            a.id_asistencia,
            a.fecha,
            h.hora_entrada AS hora_entrada_esperada,
            h.hora_salida AS hora_salida_esperada,
            a.hora_entrada_real,
            a.hora_salida_real,
            a.estado,
            a.observaciones
        FROM asistencias a
        INNER JOIN practicantes p
            ON a.id_practicante = p.id_practicante
        INNER JOIN horarios h
            ON a.id_horario = h.id_horario
        WHERE p.id_usuario = ?
        ORDER BY a.fecha DESC, a.id_asistencia DESC
    `;

    db.query(sql, [idUsuario], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo historial de asistencias:",
                error
            );

            return res.status(500).json({
                mensaje:
                    "Error al consultar el historial de asistencias"
            });
        }

        return res.status(200).json({
            total_asistencias: resultados.length,
            asistencias: resultados
        });
    });
};

module.exports = {
    registrarEntrada,
    registrarSalida,
    obtenerHorario,
    obtenerHistorial
};