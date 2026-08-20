const db = require("../config/db");
const bcrypt = require("bcrypt");
const registrarActividad = require("../utils/registrarActividad");

const obtenerPerfil = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            u.debe_cambiar_password,
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


// ==========================================
// CAMBIAR CONTRASEÑA DEL PRACTICANTE
// El administrador nunca recibe la nueva
// contraseña. Solo se guarda su hash.
// ==========================================

const cambiarPassword = async (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        password_actual,
        password_nueva,
        confirmar_password
    } = req.body || {};

    if (
        !password_actual ||
        !password_nueva ||
        !confirmar_password
    ) {
        return res.status(400).json({
            mensaje:
                "Debes escribir la contraseña actual, la nueva contraseña y su confirmación"
        });
    }

    if (
        password_nueva !==
        confirmar_password
    ) {
        return res.status(400).json({
            mensaje:
                "La nueva contraseña y su confirmación no coinciden"
        });
    }

    if (password_nueva.length < 8) {
        return res.status(400).json({
            mensaje:
                "La nueva contraseña debe tener al menos 8 caracteres"
        });
    }

    const tieneMayuscula = /[A-Z]/.test(
        password_nueva
    );

    const tieneMinuscula = /[a-z]/.test(
        password_nueva
    );

    const tieneNumero = /\d/.test(
        password_nueva
    );

    if (
        !tieneMayuscula ||
        !tieneMinuscula ||
        !tieneNumero
    ) {
        return res.status(400).json({
            mensaje:
                "La nueva contraseña debe incluir al menos una mayúscula, una minúscula y un número"
        });
    }

    const sqlBuscar = `
        SELECT
            password_hash
        FROM usuarios
        WHERE id_usuario = ?
        LIMIT 1
    `;

    db.query(
        sqlBuscar,
        [idUsuario],
        async (errorBuscar, resultados) => {
            if (errorBuscar) {
                console.error(
                    "Error consultando contraseña:",
                    errorBuscar
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar la cuenta"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "Usuario no encontrado"
                });
            }

            try {
                const usuario = resultados[0];

                const passwordCorrecta =
                    await bcrypt.compare(
                        password_actual,
                        usuario.password_hash
                    );

                if (!passwordCorrecta) {
                    return res.status(401).json({
                        mensaje:
                            "La contraseña actual es incorrecta"
                    });
                }

                const esMismaPassword =
                    await bcrypt.compare(
                        password_nueva,
                        usuario.password_hash
                    );

                if (esMismaPassword) {
                    return res.status(400).json({
                        mensaje:
                            "La nueva contraseña debe ser diferente a la contraseña actual"
                    });
                }

                const nuevoHash =
                    await bcrypt.hash(
                        password_nueva,
                        10
                    );

                const sqlActualizar = `
                    UPDATE usuarios
                    SET
                        password_hash = ?,
                        debe_cambiar_password = 0
                    WHERE id_usuario = ?
                `;

                db.query(
                    sqlActualizar,
                    [
                        nuevoHash,
                        idUsuario
                    ],
                    (errorActualizar, resultado) => {
                        if (errorActualizar) {
                            console.error(
                                "Error actualizando contraseña:",
                                errorActualizar
                            );

                            return res
                                .status(500)
                                .json({
                                    mensaje:
                                        "Error al actualizar la contraseña"
                                });
                        }

                        if (
                            resultado.affectedRows === 0
                        ) {
                            return res
                                .status(404)
                                .json({
                                    mensaje:
                                        "Usuario no encontrado"
                                });
                        }

                        registrarActividad(
                            idUsuario,
                            "CAMBIAR_PASSWORD",
                            "El practicante actualizó su contraseña"
                        );

                        return res
                            .status(200)
                            .json({
                                mensaje:
                                    "Contraseña actualizada correctamente",
                                debe_cambiar_password:
                                    0
                            });
                    }
                );
            } catch (errorPassword) {
                console.error(
                    "Error procesando contraseña:",
                    errorPassword
                );

                return res.status(500).json({
                    mensaje:
                        "Error al procesar la contraseña"
                });
            }
        }
    );
};

// ==========================================
// REGISTRAR HORAS
// ==========================================

const registrarHoras = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        fecha,
        horas,
        descripcion
    } = req.body || {};

    // ==========================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ==========================================

    if (
        !fecha ||
        horas === undefined ||
        horas === null
    ) {
        return res.status(400).json({
            mensaje: "Fecha y horas son obligatorias"
        });
    }

    // ==========================================
    // VALIDAR CANTIDAD DE HORAS
    // ==========================================

    const cantidadHoras = Number(horas);

    if (
        !Number.isFinite(cantidadHoras) ||
        cantidadHoras <= 0
    ) {
        return res.status(400).json({
            mensaje:
                "La cantidad de horas debe ser mayor a 0"
        });
    }

    // Evitar cantidades imposibles en un solo día
    if (cantidadHoras > 24) {
        return res.status(400).json({
            mensaje:
                "No puedes registrar más de 24 horas en un día"
        });
    }

    // ==========================================
    // VALIDAR FECHA
    // ==========================================

    // Exigir formato YYYY-MM-DD
    const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fecha)) {
        return res.status(400).json({
            mensaje:
                "La fecha debe tener el formato YYYY-MM-DD"
        });
    }

    const fechaRegistro = new Date(
        `${fecha}T00:00:00`
    );

    if (Number.isNaN(fechaRegistro.getTime())) {
        return res.status(400).json({
            mensaje: "La fecha proporcionada no es válida"
        });
    }

    // Verificar que JavaScript no haya normalizado
    // una fecha inexistente como 2026-02-30.
    const anio = fechaRegistro.getFullYear();
    const mes = String(
        fechaRegistro.getMonth() + 1
    ).padStart(2, "0");
    const dia = String(
        fechaRegistro.getDate()
    ).padStart(2, "0");

    const fechaNormalizada =
        `${anio}-${mes}-${dia}`;

    if (fechaNormalizada !== fecha) {
        return res.status(400).json({
            mensaje: "La fecha proporcionada no existe"
        });
    }

    // No permitir registros futuros
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    if (fechaRegistro > hoy) {
        return res.status(400).json({
            mensaje:
                "No puedes registrar horas en una fecha futura"
        });
    }

    // ==========================================
    // BUSCAR PRACTICANTE
    // ==========================================

    db.query(
        `
            SELECT
                id_practicante,
                fecha_inicio,
                fecha_fin
            FROM practicantes
            WHERE id_usuario = ?
        `,
        [idUsuario],
        (error, resultados) => {
            if (error) {
                console.error(
                    "Error buscando practicante:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar el practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: "Practicante no encontrado"
                });
            }

            const practicante = resultados[0];

            const idPracticante =
                practicante.id_practicante;

            // ==========================================
            // VALIDAR PERIODO DE PRÁCTICAS
            // ==========================================

            if (practicante.fecha_inicio) {
                const fechaInicio =
                    new Date(practicante.fecha_inicio);

                fechaInicio.setHours(0, 0, 0, 0);

                if (fechaRegistro < fechaInicio) {
                    return res.status(400).json({
                        mensaje:
                            "No puedes registrar horas anteriores al inicio de tus prácticas"
                    });
                }
            }

            if (practicante.fecha_fin) {
                const fechaFin =
                    new Date(practicante.fecha_fin);

                fechaFin.setHours(0, 0, 0, 0);

                if (fechaRegistro > fechaFin) {
                    return res.status(400).json({
                        mensaje:
                            "No puedes registrar horas posteriores al fin de tus prácticas"
                    });
                }
            }

            // ==========================================
            // REGISTRAR HORAS
            // ==========================================

            const sql = `
                INSERT INTO registros_horas (
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
                    descripcion?.trim() || null
                ],
                (errorRegistro, resultado) => {
                    if (errorRegistro) {
                        console.error(
                            "Error registrando horas:",
                            errorRegistro
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al registrar las horas"
                        });
                    }

                    registrarActividad(
                        idUsuario,
                        "REGISTRAR_HORAS",
                        `El practicante registró ${cantidadHoras} horas correspondientes al día ${fecha}`
                    );

                    return res.status(201).json({
                        mensaje:
                            "Horas registradas correctamente",
                        id_registro:
                            resultado.insertId
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

// ==========================================
// ACTUALIZAR PERFIL DEL PRACTICANTE
// ==========================================

const actualizarPerfil = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
        universidad,
        matricula,
        id_carrera,
        fecha_inicio,
        fecha_fin
    } = req.body || {};

    // Verificar que venga al menos un dato
    if (
        nombre === undefined &&
        apellido_paterno === undefined &&
        apellido_materno === undefined &&
        telefono === undefined &&
        universidad === undefined &&
        matricula === undefined &&
        id_carrera === undefined &&
        fecha_inicio === undefined &&
        fecha_fin === undefined
    ) {
        return res.status(400).json({
            mensaje: "Debes proporcionar al menos un dato para actualizar"
        });
    }

    // Validar textos obligatorios si fueron enviados
    if (nombre !== undefined && !nombre.trim()) {
        return res.status(400).json({
            mensaje: "El nombre no puede estar vacío"
        });
    }

    if (
        apellido_paterno !== undefined &&
        !apellido_paterno.trim()
    ) {
        return res.status(400).json({
            mensaje: "El apellido paterno no puede estar vacío"
        });
    }

    // Validar fechas si fueron enviadas
    const validarFecha = (fecha) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return false;
        }

        const fechaObjeto = new Date(`${fecha}T00:00:00`);

        if (Number.isNaN(fechaObjeto.getTime())) {
            return false;
        }

        const anio = fechaObjeto.getFullYear();
        const mes = String(
            fechaObjeto.getMonth() + 1
        ).padStart(2, "0");
        const dia = String(
            fechaObjeto.getDate()
        ).padStart(2, "0");

        return `${anio}-${mes}-${dia}` === fecha;
    };

    if (
        fecha_inicio !== undefined &&
        !validarFecha(fecha_inicio)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha de inicio no es válida o no tiene formato YYYY-MM-DD"
        });
    }

    if (
        fecha_fin !== undefined &&
        !validarFecha(fecha_fin)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha de fin no es válida o no tiene formato YYYY-MM-DD"
        });
    }

    // Validar que fecha_fin no sea anterior a fecha_inicio
    if (
        fecha_inicio !== undefined &&
        fecha_fin !== undefined
    ) {
        const inicio = new Date(
            `${fecha_inicio}T00:00:00`
        );

        const fin = new Date(
            `${fecha_fin}T00:00:00`
        );

        if (fin < inicio) {
            return res.status(400).json({
                mensaje:
                    "La fecha de fin no puede ser anterior a la fecha de inicio"
            });
        }
    }

    // Función para continuar con la actualización
    const ejecutarActualizacion = () => {
        const sqlUsuario = `
            UPDATE usuarios
            SET
                nombre = COALESCE(?, nombre),
                apellido_paterno = COALESCE(?, apellido_paterno),
                apellido_materno = COALESCE(?, apellido_materno)
            WHERE id_usuario = ?
        `;

        db.query(
            sqlUsuario,
            [
                nombre !== undefined
                    ? nombre.trim()
                    : null,

                apellido_paterno !== undefined
                    ? apellido_paterno.trim()
                    : null,

                apellido_materno !== undefined
                    ? apellido_materno.trim()
                    : null,

                idUsuario
            ],
            (errorUsuario) => {
                if (errorUsuario) {
                    console.error(
                        "Error actualizando usuario:",
                        errorUsuario
                    );

                    return res.status(500).json({
                        mensaje:
                            "Error al actualizar los datos personales"
                    });
                }

                const sqlPracticante = `
                    UPDATE practicantes
                    SET
                        telefono = COALESCE(?, telefono),
                        universidad = COALESCE(?, universidad),
                        matricula = COALESCE(?, matricula),
                        id_carrera = COALESCE(?, id_carrera),
                        fecha_inicio = COALESCE(?, fecha_inicio),
                        fecha_fin = COALESCE(?, fecha_fin)
                    WHERE id_usuario = ?
                `;

                db.query(
                    sqlPracticante,
                    [
                        telefono !== undefined
                            ? telefono.trim()
                            : null,

                        universidad !== undefined
                            ? universidad.trim()
                            : null,

                        matricula !== undefined
                            ? matricula.trim()
                            : null,

                        id_carrera ?? null,
                        fecha_inicio ?? null,
                        fecha_fin ?? null,
                        idUsuario
                    ],
                    (
                        errorPracticante,
                        resultadoPracticante
                    ) => {
                        if (errorPracticante) {
                            console.error(
                                "Error actualizando practicante:",
                                errorPracticante
                            );

                            return res.status(500).json({
                                mensaje:
                                    "Error al actualizar el perfil"
                            });
                        }

                        if (
                            resultadoPracticante.affectedRows === 0
                        ) {
                            return res.status(404).json({
                                mensaje:
                                    "Practicante no encontrado"
                            });
                        }

                        registrarActividad(
                            idUsuario,
                            "ACTUALIZAR_PERFIL",
                            "El practicante actualizó la información de su perfil"
                        );

                        return res.status(200).json({
                            mensaje:
                                "Perfil actualizado correctamente"
                        });
                    }
                );
            }
        );
    };

    // Si se quiere cambiar la carrera,
    // comprobar que exista y esté activa
    if (id_carrera !== undefined) {
        const idCarrera = Number(id_carrera);

        if (
            !Number.isInteger(idCarrera) ||
            idCarrera <= 0
        ) {
            return res.status(400).json({
                mensaje: "El id de carrera es inválido"
            });
        }

        const sqlCarrera = `
            SELECT id_carrera
            FROM carreras
            WHERE id_carrera = ?
              AND activa = 1
        `;

        db.query(
            sqlCarrera,
            [idCarrera],
            (errorCarrera, resultadosCarrera) => {
                if (errorCarrera) {
                    console.error(
                        "Error verificando carrera:",
                        errorCarrera
                    );

                    return res.status(500).json({
                        mensaje:
                            "Error al verificar la carrera"
                    });
                }

                if (resultadosCarrera.length === 0) {
                    return res.status(400).json({
                        mensaje:
                            "La carrera seleccionada no existe o está desactivada"
                    });
                }

                ejecutarActualizacion();
            }
        );

        return;
    }

    ejecutarActualizacion();
};

module.exports = {
    obtenerPerfil,
    cambiarPassword,
    registrarHoras,
    obtenerAvance,
    obtenerHoras,
    actualizarPerfil
};