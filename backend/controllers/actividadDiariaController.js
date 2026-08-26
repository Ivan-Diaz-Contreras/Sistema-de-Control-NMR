const db = require("../config/db");

// ==========================================
// UTILIDADES
// ==========================================

const esAdministrador = (req) =>
    String(req.usuario?.rol || "")
        .trim()
        .toLowerCase() === "administrador";

const esPracticante = (req) =>
    String(req.usuario?.rol || "")
        .trim()
        .toLowerCase() === "practicante";

const fechaHoySQL = () => {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};

const normalizarActividad = (valor) =>
    String(valor ?? "")
        .trim()
        .replace(/\s+/g, " ");

const obtenerPracticantePorUsuario = (
    idUsuario,
    callback
) => {
    const sql = `
        SELECT
            p.id_practicante,
            p.id_usuario,
            p.id_carrera,
            p.matricula,
            p.universidad,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            c.nombre AS carrera
        FROM practicantes p
        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario
        INNER JOIN carreras c
            ON p.id_carrera = c.id_carrera
        WHERE p.id_usuario = ?
        LIMIT 1
    `;

    db.query(sql, [idUsuario], callback);
};

const crearNotificacionAdministradores = ({
    tipo,
    titulo,
    mensaje
}) => {
    const sql = `
        INSERT INTO notificaciones (
            id_usuario,
            seccion,
            tipo,
            titulo,
            mensaje
        )
        SELECT
            u.id_usuario,
            'actividad_diaria',
            ?,
            ?,
            ?
        FROM usuarios u
        INNER JOIN roles r
            ON u.id_rol = r.id_rol
        WHERE r.nombre = 'Administrador'
          AND u.activo = 1
    `;

    db.query(
        sql,
        [tipo, titulo, mensaje],
        (error) => {
            if (error) {
                console.error(
                    "Error creando notificación de actividad diaria:",
                    error
                );
            }
        }
    );
};

// ==========================================
// PRACTICANTE - OBTENER MIS ACTIVIDADES
// ==========================================

const obtenerMisActividades = (req, res) => {
    if (!esPracticante(req)) {
        return res.status(403).json({
            mensaje:
                "Solo los practicantes pueden consultar esta sección"
        });
    }

    obtenerPracticantePorUsuario(
        req.usuario.id_usuario,
        (errorPracticante, resultados) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar al practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "No se encontró el perfil de practicante"
                });
            }

            const idPracticante =
                resultados[0].id_practicante;

            const sql = `
                SELECT
                    ad.id_actividad_diaria AS id,
                    ad.id_actividad_diaria,
                    ad.id_practicante,
                    ad.fecha,
                    ad.actividad,
                    ad.fecha_creacion AS creado_en,
                    ad.fecha_actualizacion AS actualizado_en
                FROM actividades_diarias ad
                WHERE ad.id_practicante = ?
                ORDER BY
                    ad.fecha DESC,
                    ad.id_actividad_diaria DESC
            `;

            db.query(
                sql,
                [idPracticante],
                (error, actividades) => {
                    if (error) {
                        console.error(
                            "Error consultando actividades diarias:",
                            error
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al consultar las actividades diarias"
                        });
                    }

                    return res.json({
                        actividades
                    });
                }
            );
        }
    );
};

// ==========================================
// PRACTICANTE - CREAR ACTIVIDAD
// ==========================================

const crearMiActividad = (req, res) => {
    if (!esPracticante(req)) {
        return res.status(403).json({
            mensaje:
                "Solo los practicantes pueden registrar actividades"
        });
    }

    const fecha = String(
        req.body?.fecha || ""
    ).trim();

    const actividad = normalizarActividad(
        req.body?.actividad
    );

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha es obligatoria y debe tener formato AAAA-MM-DD"
        });
    }

    if (fecha > fechaHoySQL()) {
        return res.status(400).json({
            mensaje:
                "No puedes registrar actividades de una fecha futura"
        });
    }

    if (
        actividad.length < 10 ||
        actividad.length > 1000
    ) {
        return res.status(400).json({
            mensaje:
                "La actividad debe tener entre 10 y 1000 caracteres"
        });
    }

    obtenerPracticantePorUsuario(
        req.usuario.id_usuario,
        (errorPracticante, resultados) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar al practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "No se encontró el perfil de practicante"
                });
            }

            const practicante = resultados[0];

            const sql = `
                INSERT INTO actividades_diarias (
                    id_practicante,
                    fecha,
                    actividad
                )
                VALUES (?, ?, ?)
            `;

            db.query(
                sql,
                [
                    practicante.id_practicante,
                    fecha,
                    actividad
                ],
                (error, resultado) => {
                    if (error) {
                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {
                            return res.status(409).json({
                                mensaje:
                                    "Ya existe una actividad registrada para esa fecha"
                            });
                        }

                        console.error(
                            "Error creando actividad diaria:",
                            error
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al registrar la actividad diaria"
                        });
                    }

                    const nombreCompleto = [
                        practicante.nombre,
                        practicante.apellido_paterno,
                        practicante.apellido_materno
                    ]
                        .filter(Boolean)
                        .join(" ");

                    crearNotificacionAdministradores({
                        tipo:
                            "NUEVA_ACTIVIDAD_DIARIA",
                        titulo:
                            "Nueva actividad diaria",
                        mensaje:
                            `${nombreCompleto} registró su actividad del ${fecha}.`
                    });

                    return res.status(201).json({
                        mensaje:
                            "Actividad diaria registrada correctamente",
                        id_actividad_diaria:
                            resultado.insertId
                    });
                }
            );
        }
    );
};

// ==========================================
// PRACTICANTE - EDITAR MI ACTIVIDAD
// ==========================================

const actualizarMiActividad = (req, res) => {
    if (!esPracticante(req)) {
        return res.status(403).json({
            mensaje:
                "Solo los practicantes pueden editar sus actividades"
        });
    }

    const { id } = req.params;

    const fecha = String(
        req.body?.fecha || ""
    ).trim();

    const actividad = normalizarActividad(
        req.body?.actividad
    );

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha es obligatoria y debe tener formato AAAA-MM-DD"
        });
    }

    if (fecha > fechaHoySQL()) {
        return res.status(400).json({
            mensaje:
                "No puedes registrar actividades de una fecha futura"
        });
    }

    if (
        actividad.length < 10 ||
        actividad.length > 300
    ) {
        return res.status(400).json({
            mensaje:
                "La actividad debe tener entre 10 y 300 caracteres"
        });
    }

    obtenerPracticantePorUsuario(
        req.usuario.id_usuario,
        (errorPracticante, resultados) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar al practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "No se encontró el perfil de practicante"
                });
            }

            const practicante = resultados[0];

            const sql = `
                UPDATE actividades_diarias
                SET
                    fecha = ?,
                    actividad = ?
                WHERE id_actividad_diaria = ?
                  AND id_practicante = ?
            `;

            db.query(
                sql,
                [
                    fecha,
                    actividad,
                    id,
                    practicante.id_practicante
                ],
                (error, resultado) => {
                    if (error) {
                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {
                            return res.status(409).json({
                                mensaje:
                                    "Ya existe una actividad registrada para esa fecha"
                            });
                        }

                        console.error(
                            "Error actualizando actividad diaria:",
                            error
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al actualizar la actividad diaria"
                        });
                    }

                    if (
                        resultado.affectedRows === 0
                    ) {
                        return res.status(404).json({
                            mensaje:
                                "Actividad diaria no encontrada"
                        });
                    }

                    const nombreCompleto = [
                        practicante.nombre,
                        practicante.apellido_paterno,
                        practicante.apellido_materno
                    ]
                        .filter(Boolean)
                        .join(" ");

                    crearNotificacionAdministradores({
                        tipo:
                            "ACTIVIDAD_DIARIA_ACTUALIZADA",
                        titulo:
                            "Actividad diaria actualizada",
                        mensaje:
                            `${nombreCompleto} actualizó su actividad del ${fecha}.`
                    });

                    return res.json({
                        mensaje:
                            "Actividad diaria actualizada correctamente"
                    });
                }
            );
        }
    );
};

// ==========================================
// PRACTICANTE - ELIMINAR MI ACTIVIDAD
// ==========================================

const eliminarMiActividad = (req, res) => {
    if (!esPracticante(req)) {
        return res.status(403).json({
            mensaje:
                "Solo los practicantes pueden eliminar sus actividades"
        });
    }

    const { id } = req.params;

    obtenerPracticantePorUsuario(
        req.usuario.id_usuario,
        (errorPracticante, resultados) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar al practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "No se encontró el perfil de practicante"
                });
            }

            const idPracticante =
                resultados[0].id_practicante;

            db.query(
                `
                    DELETE FROM actividades_diarias
                    WHERE id_actividad_diaria = ?
                      AND id_practicante = ?
                `,
                [id, idPracticante],
                (error, resultado) => {
                    if (error) {
                        console.error(
                            "Error eliminando actividad diaria:",
                            error
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al eliminar la actividad diaria"
                        });
                    }

                    if (
                        resultado.affectedRows === 0
                    ) {
                        return res.status(404).json({
                            mensaje:
                                "Actividad diaria no encontrada"
                        });
                    }

                    return res.json({
                        mensaje:
                            "Actividad diaria eliminada correctamente"
                    });
                }
            );
        }
    );
};

// ==========================================
// ADMIN - OBTENER TODAS LAS ACTIVIDADES
// ==========================================

const obtenerActividadesAdmin = (req, res) => {
    if (!esAdministrador(req)) {
        return res.status(403).json({
            mensaje:
                "Solo el administrador puede consultar todos los registros"
        });
    }

    const {
        desde = "",
        hasta = "",
        id_practicante = ""
    } = req.query;

    const condiciones = [];
    const parametros = [];

    if (desde) {
        condiciones.push("ad.fecha >= ?");
        parametros.push(desde);
    }

    if (hasta) {
        condiciones.push("ad.fecha <= ?");
        parametros.push(hasta);
    }

    if (id_practicante) {
        condiciones.push(
            "ad.id_practicante = ?"
        );
        parametros.push(id_practicante);
    }

    const where =
        condiciones.length > 0
            ? `WHERE ${condiciones.join(" AND ")}`
            : "";

    const sql = `
        SELECT
            ad.id_actividad_diaria AS id,
            ad.id_actividad_diaria,
            ad.id_practicante,
            p.id_usuario,
            ad.fecha,
            ad.actividad,
            ad.fecha_creacion AS creado_en,
            ad.fecha_actualizacion AS actualizado_en,
            p.matricula,
            p.universidad,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            CONCAT_WS(
                ' ',
                u.nombre,
                u.apellido_paterno,
                u.apellido_materno
            ) AS nombre_completo,
            c.nombre AS carrera,
            'NMR CONSULTORES' AS empresa,
            COALESCE(
                (
                    SELECT CONCAT(
                        TIME_FORMAT(
                            MIN(h.hora_entrada),
                            '%H:%i'
                        ),
                        ' - ',
                        TIME_FORMAT(
                            MAX(h.hora_salida),
                            '%H:%i'
                        )
                    )
                    FROM horarios h
                    WHERE h.id_practicante =
                        ad.id_practicante
                      AND h.activo = 1
                ),
                'No registrado'
            ) AS horario
        FROM actividades_diarias ad
        INNER JOIN practicantes p
            ON ad.id_practicante =
                p.id_practicante
        INNER JOIN usuarios u
            ON p.id_usuario =
                u.id_usuario
        INNER JOIN carreras c
            ON p.id_carrera =
                c.id_carrera
        ${where}
        ORDER BY
            ad.fecha DESC,
            nombre_completo ASC
    `;

    db.query(
        sql,
        parametros,
        (error, actividades) => {
            if (error) {
                console.error(
                    "Error consultando actividades diarias del administrador:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar las actividades diarias"
                });
            }

            return res.json({
                actividades
            });
        }
    );
};

// ==========================================
// ADMIN - CREAR ACTIVIDAD
// ==========================================

const crearActividadAdmin = (req, res) => {
    if (!esAdministrador(req)) {
        return res.status(403).json({
            mensaje:
                "Solo el administrador puede crear registros"
        });
    }

    const idPracticante = Number(
        req.body?.id_practicante
    );

    const fecha = String(
        req.body?.fecha || ""
    ).trim();

    const actividad = normalizarActividad(
        req.body?.actividad
    );

    if (
        !Number.isInteger(idPracticante) ||
        idPracticante <= 0
    ) {
        return res.status(400).json({
            mensaje:
                "Debes seleccionar un practicante válido"
        });
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha es obligatoria y debe tener formato AAAA-MM-DD"
        });
    }

    if (fecha > fechaHoySQL()) {
        return res.status(400).json({
            mensaje:
                "No puedes registrar actividades de una fecha futura"
        });
    }

    if (
        actividad.length < 10 ||
        actividad.length > 300
    ) {
        return res.status(400).json({
            mensaje:
                "La actividad debe tener entre 10 y 300 caracteres"
        });
    }

    db.query(
        `
            SELECT
                p.id_practicante,
                u.nombre,
                u.apellido_paterno,
                u.apellido_materno
            FROM practicantes p
            INNER JOIN usuarios u
                ON p.id_usuario = u.id_usuario
            WHERE p.id_practicante = ?
            LIMIT 1
        `,
        [idPracticante],
        (errorPracticante, resultados) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar al practicante"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "No se encontró el practicante seleccionado"
                });
            }

            db.query(
                `
                    INSERT INTO actividades_diarias (
                        id_practicante,
                        fecha,
                        actividad
                    )
                    VALUES (?, ?, ?)
                `,
                [
                    idPracticante,
                    fecha,
                    actividad
                ],
                (error, resultado) => {
                    if (error) {
                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        ) {
                            return res.status(409).json({
                                mensaje:
                                    "Ese practicante ya tiene una actividad registrada para esa fecha"
                            });
                        }

                        console.error(
                            "Error creando actividad diaria desde administrador:",
                            error
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al registrar la actividad diaria"
                        });
                    }

                    return res.status(201).json({
                        mensaje:
                            "Actividad diaria registrada correctamente",
                        id_actividad_diaria:
                            resultado.insertId
                    });
                }
            );
        }
    );
};

// ==========================================
// ADMIN - EDITAR ACTIVIDAD
// ==========================================

const actualizarActividadAdmin = (
    req,
    res
) => {
    if (!esAdministrador(req)) {
        return res.status(403).json({
            mensaje:
                "Solo el administrador puede editar registros"
        });
    }

    const { id } = req.params;

    const fecha = String(
        req.body?.fecha || ""
    ).trim();

    const actividad = normalizarActividad(
        req.body?.actividad
    );

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha es obligatoria y debe tener formato AAAA-MM-DD"
        });
    }

    if (
        actividad.length < 10 ||
        actividad.length > 300
    ) {
        return res.status(400).json({
            mensaje:
                "La actividad debe tener entre 10 y 300 caracteres"
        });
    }

    db.query(
        `
            UPDATE actividades_diarias
            SET
                fecha = ?,
                actividad = ?
            WHERE id_actividad_diaria = ?
        `,
        [fecha, actividad, id],
        (error, resultado) => {
            if (error) {
                if (
                    error.code ===
                    "ER_DUP_ENTRY"
                ) {
                    return res.status(409).json({
                        mensaje:
                            "Ese practicante ya tiene una actividad registrada para esa fecha"
                    });
                }

                console.error(
                    "Error actualizando actividad diaria:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al actualizar la actividad diaria"
                });
            }

            if (
                resultado.affectedRows === 0
            ) {
                return res.status(404).json({
                    mensaje:
                        "Actividad diaria no encontrada"
                });
            }

            return res.json({
                mensaje:
                    "Actividad diaria actualizada correctamente"
            });
        }
    );
};

// ==========================================
// ADMIN - ELIMINAR ACTIVIDAD
// ==========================================

const eliminarActividadAdmin = (
    req,
    res
) => {
    if (!esAdministrador(req)) {
        return res.status(403).json({
            mensaje:
                "Solo el administrador puede eliminar registros"
        });
    }

    const { id } = req.params;

    db.query(
        `
            DELETE FROM actividades_diarias
            WHERE id_actividad_diaria = ?
        `,
        [id],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error eliminando actividad diaria:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al eliminar la actividad diaria"
                });
            }

            if (
                resultado.affectedRows === 0
            ) {
                return res.status(404).json({
                    mensaje:
                        "Actividad diaria no encontrada"
                });
            }

            return res.json({
                mensaje:
                    "Actividad diaria eliminada correctamente"
            });
        }
    );
};

module.exports = {
    obtenerMisActividades,
    crearMiActividad,
    actualizarMiActividad,
    eliminarMiActividad,
    obtenerActividadesAdmin,
    crearActividadAdmin,
    actualizarActividadAdmin,
    eliminarActividadAdmin
};