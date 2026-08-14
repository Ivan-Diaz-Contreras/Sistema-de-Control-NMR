const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const registrarActividad = require("../utils/registrarActividad");

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
    const idUsuario = req.usuario.id_usuario;

    const {
        hora_entrada_real,
        hora_salida_real,
        estado,
        observaciones
    } = req.body || {};

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
            
            registrarActividad(
                idUsuario,
                "ACTUALIZAR_ASISTENCIA",
                `El administrador actualizó la asistencia ${id}`
            );

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
    const idUsuario = req.usuario.id_usuario;

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
                
                registrarActividad(
                 idUsuario,
                "CREAR_HORARIO",
                `El administrador creó un horario para el practicante ${id}: ${dia_semana} de ${hora_entrada} a ${hora_salida}`
                );

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
    const idUsuario = req.usuario.id_usuario;

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

            registrarActividad(
                idUsuario,
                "ACTUALIZAR_HORARIO",
                `El administrador actualizó el horario ${id}`
            );

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
    const idUsuario = req.usuario.id_usuario;

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

            registrarActividad(
                idUsuario,
                "ACTUALIZAR_HORAS",
                `El administrador actualizó el registro de horas ${id}`
            );

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
    const idUsuario = req.usuario.id_usuario;

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

        registrarActividad(
            idUsuario,
            "ELIMINAR_HORAS",
            `El administrador eliminó el registro de horas ${id}`
        );

        return res.status(200).json({
            mensaje: "Registro de horas eliminado correctamente"
        });
    });
};

// ==========================================
// OBTENER BITÁCORAS DE UN PRACTICANTE
// ==========================================

const obtenerBitacorasPracticante = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            b.id_bitacora,
            b.numero_semana,
            b.fecha_inicio,
            b.fecha_fin,
            b.nombre_archivo,
            b.ruta_archivo,
            b.estado,
            b.observaciones,
            b.fecha_envio,
            b.fecha_revision
        FROM bitacoras b
        WHERE b.id_practicante = ?
        ORDER BY b.fecha_envio DESC, b.id_bitacora DESC
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo bitácoras del practicante:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar las bitácoras"
            });
        }

        const bitacoras = resultados.map((bitacora) => ({
        ...bitacora,
        url_archivo:
        `/api/admin/bitacoras/${bitacora.id_bitacora}/archivo`
        }));

        return res.status(200).json({
            id_practicante: Number(id),
            total_bitacoras: bitacoras.length,
            bitacoras
        });
    });
};

// ==========================================
// REVISAR BITÁCORA
// ==========================================

const revisarBitacora = (req, res) => {
    const { id } = req.params;
    const idUsuario = req.usuario.id_usuario;

    const {
        estado,
        observaciones
    } = req.body || {};

    const estadosPermitidos = [
        "Aprobada",
        "Rechazada"
    ];

    if (!estado) {
        return res.status(400).json({
            mensaje: "El estado es obligatorio"
        });
    }

    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
            mensaje: "El estado debe ser Aprobada o Rechazada"
        });
    }

    if (
        estado === "Rechazada" &&
        (!observaciones || !observaciones.trim())
    ) {
        return res.status(400).json({
            mensaje:
                "Debes indicar una observación al rechazar una bitácora"
        });
    }

    const sql = `
        UPDATE bitacoras
        SET
            estado = ?,
            observaciones = ?,
            fecha_revision = NOW()
        WHERE id_bitacora = ?
    `;

    db.query(
        sql,
        [
            estado,
            observaciones?.trim() || null,
            id
        ],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error revisando bitácora:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al revisar la bitácora"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Bitácora no encontrada"
                });
            }

            const accionRevision =
    estado === "Aprobada"
        ? "aprobó"
        : "rechazó";

            let descripcionActividad =
                `El administrador ${accionRevision} la bitácora ${id}`;
            if (
                estado === "Rechazada" &&
                observaciones?.trim()
            ) {
                descripcionActividad +=
                    `. Observaciones: ${observaciones.trim()}`;
            }

            registrarActividad(
                idUsuario,
                "REVISAR_BITACORA",
                descripcionActividad
            );

            return res.status(200).json({
                mensaje:
                    `Bitácora ${estado.toLowerCase()} correctamente`
            });
        }
    );
};

// ==========================================
// OBTENER ARCHIVO PDF DE UNA BITÁCORA
// ADMINISTRADOR
// ==========================================

const obtenerArchivoBitacoraAdmin = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            ruta_archivo,
            nombre_archivo
        FROM bitacoras
        WHERE id_bitacora = ?
    `;

    db.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error(
                "Error consultando archivo de bitácora:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar la bitácora"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                mensaje: "Bitácora no encontrada"
            });
        }

        const bitacora = resultados[0];

        const rutaCompleta = path.join(
            __dirname,
            "../uploads/bitacoras",
            bitacora.ruta_archivo
        );

        if (!fs.existsSync(rutaCompleta)) {
            return res.status(404).json({
                mensaje: "Archivo PDF no encontrado"
            });
        }

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `inline; filename="${bitacora.nombre_archivo}"`
        );

        return res.sendFile(rutaCompleta);
    });
};

// ==========================================
// OBTENER CARRERAS
// ==========================================

const obtenerCarreras = (req, res) => {
    const sql = `
        SELECT
            id_carrera,
            nombre,
            descripcion,
            activa,
            fecha_creacion
        FROM carreras
        ORDER BY nombre ASC
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo carreras:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar las carreras"
            });
        }

        return res.status(200).json({
            total_carreras: resultados.length,
            carreras: resultados
        });
    });
};


// ==========================================
// CREAR CARRERA
// ==========================================

const crearCarrera = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        nombre,
        descripcion
    } = req.body || {};

    if (!nombre || !nombre.trim()) {
        return res.status(400).json({
            mensaje: "El nombre de la carrera es obligatorio"
        });
    }

    const sql = `
        INSERT INTO carreras (
            nombre,
            descripcion
        )
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [
            nombre.trim(),
            descripcion?.trim() || null
        ],
        (error, resultado) => {
            if (error) {
                // Nombre duplicado
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje: "Ya existe una carrera con ese nombre"
                    });
                }

                console.error(
                    "Error creando carrera:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al crear la carrera"
                });
            }

            registrarActividad(
                idUsuario,
                "CREAR_CARRERA",
                `El administrador creó la carrera "${nombre.trim()}"`
            );

            return res.status(201).json({
                mensaje: "Carrera creada correctamente",
                id_carrera: resultado.insertId
            });
        }
    );
};


// ==========================================
// ACTUALIZAR CARRERA
// ==========================================

const actualizarCarrera = (req, res) => {
    const { id } = req.params;
    const idUsuario = req.usuario.id_usuario;

    const {
        nombre,
        descripcion,
        activa
    } = req.body || {};

    if (
        nombre === undefined &&
        descripcion === undefined &&
        activa === undefined
    ) {
        return res.status(400).json({
            mensaje:
                "Debes proporcionar al menos un dato para actualizar"
        });
    }

    if (
        nombre !== undefined &&
        !nombre.trim()
    ) {
        return res.status(400).json({
            mensaje:
                "El nombre de la carrera no puede estar vacío"
        });
    }

    if (
        activa !== undefined &&
        activa !== 0 &&
        activa !== 1 &&
        activa !== false &&
        activa !== true
    ) {
        return res.status(400).json({
            mensaje: "El campo activa debe ser 1 o 0"
        });
    }

    const sql = `
        UPDATE carreras
        SET
            nombre = COALESCE(?, nombre),
            descripcion = COALESCE(?, descripcion),
            activa = COALESCE(?, activa)
        WHERE id_carrera = ?
    `;

    db.query(
        sql,
        [
            nombre !== undefined
                ? nombre.trim()
                : null,

            descripcion !== undefined
                ? descripcion.trim()
                : null,

            activa !== undefined
                ? Number(activa)
                : null,

            id
        ],
        (error, resultado) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        mensaje:
                            "Ya existe una carrera con ese nombre"
                    });
                }

                console.error(
                    "Error actualizando carrera:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al actualizar la carrera"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Carrera no encontrada"
                });
            }

            registrarActividad(
                idUsuario,
                "ACTUALIZAR_CARRERA",
                `El administrador actualizó la carrera ${id}`
            );

            return res.status(200).json({
                mensaje:
                    "Carrera actualizada correctamente"
            });
        }
    );
};

// ==========================================
// OBTENER ESTADÍSTICAS GENERALES
// ==========================================

const obtenerEstadisticas = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*)
             FROM practicantes) AS total_practicantes,

            (SELECT COUNT(*)
             FROM practicantes
             WHERE fecha_fin IS NULL
                OR fecha_fin >= CURDATE()
            ) AS practicantes_activos,

            (SELECT COALESCE(SUM(horas), 0)
             FROM registros_horas
            ) AS total_horas_registradas,

            (SELECT COUNT(*)
             FROM bitacoras
             WHERE estado = 'Pendiente'
            ) AS bitacoras_pendientes,

            (SELECT COUNT(*)
             FROM bitacoras
             WHERE estado = 'Aprobada'
            ) AS bitacoras_aprobadas,

            (SELECT COUNT(*)
             FROM bitacoras
             WHERE estado = 'Rechazada'
            ) AS bitacoras_rechazadas
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo estadísticas:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar las estadísticas"
            });
        }

        const datos = resultados[0];

        return res.status(200).json({
            total_practicantes:
                Number(datos.total_practicantes),

            practicantes_activos:
                Number(datos.practicantes_activos),

            total_horas_registradas:
                Number(datos.total_horas_registradas),

            bitacoras_pendientes:
                Number(datos.bitacoras_pendientes),

            bitacoras_aprobadas:
                Number(datos.bitacoras_aprobadas),

            bitacoras_rechazadas:
                Number(datos.bitacoras_rechazadas)
        });
    });
};

// ==========================================
// OBTENER HISTORIAL DE ACTIVIDADES
// ==========================================

const obtenerHistorialActividades = (req, res) => {
    const sql = `
        SELECT
            h.id_historial,
            h.id_usuario,
            CONCAT_WS(
                ' ',
                u.nombre,
                u.apellido_paterno,
                u.apellido_materno
            ) AS nombre_usuario,
            u.correo,
            h.accion,
            h.descripcion,
            h.fecha
        FROM historial_actividades h
        LEFT JOIN usuarios u
            ON h.id_usuario = u.id_usuario
        ORDER BY h.fecha DESC, h.id_historial DESC
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo historial de actividades:",
                error
            );

            return res.status(500).json({
                mensaje:
                    "Error al consultar el historial de actividades"
            });
        }

        return res.status(200).json({
            total_actividades: resultados.length,
            actividades: resultados
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
    eliminarRegistroHoras,
    obtenerBitacorasPracticante,
    revisarBitacora,
    obtenerArchivoBitacoraAdmin,

    // Carreras
    obtenerCarreras,
    crearCarrera,
    actualizarCarrera,

    // Estadísticas
obtenerEstadisticas,

// Historial de actividades
obtenerHistorialActividades
};