const db = require("../config/db");

// ==========================================
// OBTENER TODOS LOS PRACTICANTES
// ==========================================

const obtenerPracticantes = (req, res) => {
    const sql = `
        SELECT
            p.id_practicante,
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            p.matricula,
            p.telefono,
            p.universidad,
            p.fecha_inicio,
            p.fecha_fin,
            p.horas_requeridas,
            c.id_carrera,
            c.nombre AS carrera
        FROM practicantes p
        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario
        INNER JOIN carreras c
            ON p.id_carrera = c.id_carrera
        ORDER BY u.apellido_paterno, u.nombre
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo practicantes:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar los practicantes"
            });
        }

        return res.status(200).json({
            total_practicantes: resultados.length,
            practicantes: resultados
        });
    });
};

const obtenerPracticantePorId = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            p.id_practicante,
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            p.matricula,
            p.telefono,
            p.universidad,
            p.fecha_inicio,
            p.fecha_fin,
            p.horas_requeridas,
            c.id_carrera,
            c.nombre AS carrera,
            COALESCE(SUM(rh.horas), 0) AS horas_acumuladas
        FROM practicantes p
        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario
        INNER JOIN carreras c
            ON p.id_carrera = c.id_carrera
        LEFT JOIN registros_horas rh
            ON p.id_practicante = rh.id_practicante
        WHERE p.id_practicante = ?
        GROUP BY
            p.id_practicante,
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            p.matricula,
            p.telefono,
            p.universidad,
            p.fecha_inicio,
            p.fecha_fin,
            p.horas_requeridas,
            c.id_carrera,
            c.nombre
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo practicante:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar el practicante"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Practicante no encontrado"
            });
        }

        const practicante = resultados[0];

        const horasRequeridas = Number(practicante.horas_requeridas);
        const horasAcumuladas = Number(practicante.horas_acumuladas);

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
            practicante: {
                ...practicante,
                horas_requeridas: horasRequeridas,
                horas_acumuladas: horasAcumuladas,
                horas_restantes: horasRestantes,
                porcentaje_avance: Number(
                    porcentajeAvance.toFixed(2)
                )
            }
        });
    });
};

// ==========================================
// OBTENER HORARIO DE UN PRACTICANTE
// ==========================================

const obtenerHorarioPracticante = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            h.id_horario,
            h.dia_semana,
            h.hora_entrada,
            h.hora_salida,
            h.activo
        FROM horarios h
        WHERE h.id_practicante = ?
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

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo horario del practicante:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar el horario"
            });
        }

        return res.status(200).json({
            id_practicante: Number(id),
            horario: resultados
        });
    });
};

const obtenerAsistenciasPracticante = (req, res) => {
    const { id } = req.params;

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
        INNER JOIN horarios h
            ON a.id_horario = h.id_horario
        WHERE a.id_practicante = ?
        ORDER BY a.fecha DESC, a.id_asistencia DESC
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo asistencias del practicante:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar las asistencias"
            });
        }

        return res.status(200).json({
            id_practicante: Number(id),
            total_asistencias: resultados.length,
            asistencias: resultados
        });
    });
};

const actualizarAsistencia = (req, res) => {
    const { id } = req.params;

    const {
        hora_entrada_real,
        hora_salida_real,
        estado,
        observaciones
    } = req.body;

    const estadosPermitidos = [
        "Pendiente",
        "A tiempo",
        "Retardo",
        "Incompleta"
    ];

    if (estado && !estadosPermitidos.includes(estado)) {
        return res.status(400).json({
            mensaje: "Estado de asistencia inválido"
        });
    }

    const sql = `
        UPDATE asistencias
        SET
            hora_entrada_real = COALESCE(?, hora_entrada_real),
            hora_salida_real = COALESCE(?, hora_salida_real),
            estado = COALESCE(?, estado),
            observaciones = COALESCE(?, observaciones)
        WHERE id_asistencia = ?
    `;

    db.query(
        sql,
        [
            hora_entrada_real || null,
            hora_salida_real || null,
            estado || null,
            observaciones || null,
            id
        ],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error actualizando asistencia:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al actualizar la asistencia"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Asistencia no encontrada"
                });
            }

            return res.status(200).json({
                mensaje: "Asistencia actualizada correctamente"
            });
        }
    );
};

// ==========================================
// CREAR HORARIO PARA UN PRACTICANTE
// ==========================================

const crearHorarioPracticante = (req, res) => {
    const { id } = req.params;

    const {
        dia_semana,
        hora_entrada,
        hora_salida
    } = req.body || {};

    const diasPermitidos = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo"
    ];

    if (!dia_semana || !hora_entrada || !hora_salida) {
        return res.status(400).json({
            mensaje: "Día, hora de entrada y hora de salida son obligatorios"
        });
    }

    if (!diasPermitidos.includes(dia_semana)) {
        return res.status(400).json({
            mensaje: "Día de la semana inválido"
        });
    }

    if (hora_salida <= hora_entrada) {
        return res.status(400).json({
            mensaje: "La hora de salida debe ser posterior a la hora de entrada"
        });
    }

    const verificarPracticante = `
        SELECT id_practicante
        FROM practicantes
        WHERE id_practicante = ?
    `;

    db.query(verificarPracticante, [id], (errorPracticante, resultados) => {
        if (errorPracticante) {
            console.error(
                "Error verificando practicante:",
                errorPracticante
            );

            return res.status(500).json({
                mensaje: "Error al consultar el practicante"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Practicante no encontrado"
            });
        }

        const sql = `
            INSERT INTO horarios (
                id_practicante,
                dia_semana,
                hora_entrada,
                hora_salida
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                id,
                dia_semana,
                hora_entrada,
                hora_salida
            ],
            (errorHorario, resultadoHorario) => {
                if (errorHorario) {
                    if (errorHorario.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            mensaje:
                                "El practicante ya tiene un horario registrado para ese día"
                        });
                    }

                    console.error(
                        "Error creando horario:",
                        errorHorario
                    );

                    return res.status(500).json({
                        mensaje: "Error al crear el horario"
                    });
                }

                return res.status(201).json({
                    mensaje: "Horario creado correctamente",
                    id_horario: resultadoHorario.insertId
                });
            }
        );
    });
};


// ==========================================
// ACTUALIZAR HORARIO
// ==========================================

const actualizarHorario = (req, res) => {
    const { id } = req.params;

    const {
        dia_semana,
        hora_entrada,
        hora_salida,
        activo
    } = req.body || {};

    const diasPermitidos = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo"
    ];

    if (
        dia_semana === undefined &&
        hora_entrada === undefined &&
        hora_salida === undefined &&
        activo === undefined
    ) {
        return res.status(400).json({
            mensaje: "Debes proporcionar al menos un dato para actualizar"
        });
    }

    if (
        dia_semana !== undefined &&
        !diasPermitidos.includes(dia_semana)
    ) {
        return res.status(400).json({
            mensaje: "Día de la semana inválido"
        });
    }

    if (
        hora_entrada !== undefined &&
        hora_salida !== undefined &&
        hora_salida <= hora_entrada
    ) {
        return res.status(400).json({
            mensaje: "La hora de salida debe ser posterior a la hora de entrada"
        });
    }

    const sql = `
        UPDATE horarios
        SET
            dia_semana = COALESCE(?, dia_semana),
            hora_entrada = COALESCE(?, hora_entrada),
            hora_salida = COALESCE(?, hora_salida),
            activo = COALESCE(?, activo)
        WHERE id_horario = ?
    `;

    db.query(
        sql,
        [
            dia_semana ?? null,
            hora_entrada ?? null,
            hora_salida ?? null,
            activo ?? null,
            id
        ],
        (error, resultado) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje:
                            "Ya existe otro horario para ese practicante en ese día"
                    });
                }

                console.error(
                    "Error actualizando horario:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al actualizar el horario"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Horario no encontrado"
                });
            }

            return res.status(200).json({
                mensaje: "Horario actualizado correctamente"
            });
        }
    );
};

// ==========================================
// OBTENER HORAS DE UN PRACTICANTE
// ==========================================

const obtenerHorasPracticante = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            rh.id_registro,
            rh.fecha,
            rh.horas,
            rh.descripcion,
            rh.fecha_creacion
        FROM registros_horas rh
        WHERE rh.id_practicante = ?
        ORDER BY rh.fecha DESC, rh.id_registro DESC
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo horas del practicante:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar los registros de horas"
            });
        }

        const registros = resultados.map((registro) => ({
            ...registro,
            horas: Number(registro.horas)
        }));

        const horasAcumuladas = registros.reduce(
            (total, registro) => total + registro.horas,
            0
        );

        return res.status(200).json({
            id_practicante: Number(id),
            total_registros: registros.length,
            horas_acumuladas: horasAcumuladas,
            registros
        });
    });
};

// ==========================================
// ACTUALIZAR REGISTRO DE HORAS
// ==========================================

const actualizarRegistroHoras = (req, res) => {
    const { id } = req.params;

    const {
        fecha,
        horas,
        descripcion
    } = req.body || {};

    if (
        fecha === undefined &&
        horas === undefined &&
        descripcion === undefined
    ) {
        return res.status(400).json({
            mensaje: "Debes proporcionar al menos un dato para actualizar"
        });
    }

    if (horas !== undefined) {
        const cantidadHoras = Number(horas);

        if (!Number.isFinite(cantidadHoras) || cantidadHoras <= 0) {
            return res.status(400).json({
                mensaje: "La cantidad de horas debe ser mayor a 0"
            });
        }
    }

    const sql = `
        UPDATE registros_horas
        SET
            fecha = COALESCE(?, fecha),
            horas = COALESCE(?, horas),
            descripcion = COALESCE(?, descripcion)
        WHERE id_registro = ?
    `;

    db.query(
        sql,
        [
            fecha ?? null,
            horas ?? null,
            descripcion ?? null,
            id
        ],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error actualizando registro de horas:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al actualizar el registro de horas"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Registro de horas no encontrado"
                });
            }

            return res.status(200).json({
                mensaje: "Registro de horas actualizado correctamente"
            });
        }
    );
};

// ==========================================
// ELIMINAR REGISTRO DE HORAS
// ==========================================

const eliminarRegistroHoras = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM registros_horas
        WHERE id_registro = ?
    `;

    db.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error(
                "Error eliminando registro de horas:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al eliminar el registro de horas"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Registro de horas no encontrado"
            });
        }

        return res.status(200).json({
            mensaje: "Registro de horas eliminado correctamente"
        });
    });
};

module.exports = {
    obtenerPracticantes,
    obtenerPracticantePorId,
    obtenerHorarioPracticante,
    obtenerAsistenciasPracticante,
    actualizarAsistencia,
    crearHorarioPracticante,
    actualizarHorario,
    obtenerHorasPracticante,
    actualizarRegistroHoras,
    eliminarRegistroHoras
};