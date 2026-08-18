const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const registrarActividad = require("../utils/registrarActividad");

// ==========================================
// SUBIR BITÁCORA
// ==========================================

const subirBitacora = (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const { id_actividad } = req.body || {};

    const eliminarArchivoSubido = () => {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error(
                    "Error eliminando archivo subido:",
                    error
                );
            }
        }
    };

    if (
        id_actividad === undefined ||
        id_actividad === null ||
        id_actividad === "" ||
        !req.file
    ) {
        eliminarArchivoSubido();

        return res.status(400).json({
            mensaje:
                "La actividad de bitácora y el archivo PDF son obligatorios"
        });
    }

    const idActividad = Number(id_actividad);

    if (
        !Number.isInteger(idActividad) ||
        idActividad <= 0
    ) {
        eliminarArchivoSubido();

        return res.status(400).json({
            mensaje:
                "El id de la actividad de bitácora es inválido"
        });
    }

    db.query(
        `
            SELECT id_practicante
            FROM practicantes
            WHERE id_usuario = ?
        `,
        [idUsuario],
        (errorPracticante, resultadosPracticante) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                eliminarArchivoSubido();

                return res.status(500).json({
                    mensaje:
                        "Error al consultar el practicante"
                });
            }

            if (resultadosPracticante.length === 0) {
                eliminarArchivoSubido();

                return res.status(404).json({
                    mensaje:
                        "Practicante no encontrado"
                });
            }

            const idPracticante =
                resultadosPracticante[0].id_practicante;

            const sqlActividad = `
                SELECT
                    id_actividad,
                    numero_semana,
                    titulo,
                    descripcion,
                    fecha_inicio,
                    fecha_fin,
                    fecha_limite,
                    activa
                FROM actividades_bitacora
                WHERE id_actividad = ?
                LIMIT 1
            `;

            db.query(
                sqlActividad,
                [idActividad],
                (errorActividad, resultadosActividad) => {
                    if (errorActividad) {
                        console.error(
                            "Error consultando actividad de bitácora:",
                            errorActividad
                        );

                        eliminarArchivoSubido();

                        return res.status(500).json({
                            mensaje:
                                "Error al consultar la actividad de bitácora"
                        });
                    }

                    if (resultadosActividad.length === 0) {
                        eliminarArchivoSubido();

                        return res.status(404).json({
                            mensaje:
                                "Actividad de bitácora no encontrada"
                        });
                    }

                    const actividad =
                        resultadosActividad[0];

                    if (Number(actividad.activa) !== 1) {
                        eliminarArchivoSubido();

                        return res.status(400).json({
                            mensaje:
                                "La actividad de bitácora se encuentra desactivada"
                        });
                    }

                    const semana =
                        Number(actividad.numero_semana);

                    const sqlDuplicada = `
                        SELECT id_bitacora
                        FROM bitacoras
                        WHERE id_practicante = ?
                          AND (
                                id_actividad = ?
                                OR (
                                    id_actividad IS NULL
                                    AND numero_semana = ?
                                )
                              )
                        LIMIT 1
                    `;

                    db.query(
                        sqlDuplicada,
                        [
                            idPracticante,
                            idActividad,
                            semana
                        ],
                        (
                            errorDuplicada,
                            resultadosDuplicada
                        ) => {
                            if (errorDuplicada) {
                                console.error(
                                    "Error verificando bitácora duplicada:",
                                    errorDuplicada
                                );

                                eliminarArchivoSubido();

                                return res.status(500).json({
                                    mensaje:
                                        "Error al verificar la entrega de la bitácora"
                                });
                            }

                            if (
                                resultadosDuplicada.length > 0
                            ) {
                                eliminarArchivoSubido();

                                return res.status(409).json({
                                    mensaje:
                                        "Ya entregaste la bitácora correspondiente a esta actividad"
                                });
                            }

                            const sqlInsert = `
                                INSERT INTO bitacoras (
                                    id_practicante,
                                    id_actividad,
                                    numero_semana,
                                    fecha_inicio,
                                    fecha_fin,
                                    nombre_archivo,
                                    ruta_archivo,
                                    estado
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')
                            `;

                            db.query(
                                sqlInsert,
                                [
                                    idPracticante,
                                    idActividad,
                                    semana,
                                    actividad.fecha_inicio,
                                    actividad.fecha_fin,
                                    req.file.originalname,
                                    req.file.filename
                                ],
                                (
                                    errorInsert,
                                    resultadoInsert
                                ) => {
                                    if (errorInsert) {
                                        console.error(
                                            "Error registrando bitácora:",
                                            errorInsert
                                        );

                                        eliminarArchivoSubido();

                                        return res.status(500).json({
                                            mensaje:
                                                "Error al registrar la bitácora"
                                        });
                                    }

                                    registrarActividad(
                                        idUsuario,
                                        "SUBIR_BITACORA",
                                        `El practicante subió la bitácora de la semana ${semana}: ${req.file.originalname}`
                                    );

                                    return res.status(201).json({
                                        mensaje:
                                            "Bitácora subida correctamente",
                                        id_bitacora:
                                            resultadoInsert.insertId,
                                        id_actividad:
                                            idActividad,
                                        numero_semana:
                                            semana,
                                        titulo_actividad:
                                            actividad.titulo,
                                        archivo:
                                            req.file.originalname
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
// OBTENER ACTIVIDADES DISPONIBLES
// ==========================================

const obtenerActividadesDisponibles = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sqlPracticante = `
        SELECT id_practicante
        FROM practicantes
        WHERE id_usuario = ?
    `;

    db.query(
        sqlPracticante,
        [idUsuario],
        (errorPracticante, resultadosPracticante) => {
            if (errorPracticante) {
                console.error(
                    "Error consultando practicante:",
                    errorPracticante
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar el practicante"
                });
            }

            if (resultadosPracticante.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "Practicante no encontrado"
                });
            }

            const idPracticante =
                resultadosPracticante[0].id_practicante;

            const sql = `
                SELECT
                    a.id_actividad,
                    a.numero_semana,
                    a.titulo,
                    a.descripcion,
                    a.fecha_inicio,
                    a.fecha_fin,
                    a.fecha_limite,
                    a.activa,
                    a.fecha_creacion,
                    b.id_bitacora,
                    b.estado AS estado_entrega,
                    b.observaciones,
                    b.fecha_envio,
                    b.fecha_revision,
                    CASE
                        WHEN b.id_bitacora IS NULL THEN 0
                        ELSE 1
                    END AS entregada
                FROM actividades_bitacora a
                LEFT JOIN bitacoras b
                    ON b.id_actividad = a.id_actividad
                   AND b.id_practicante = ?
                WHERE a.activa = 1
                ORDER BY
                    a.numero_semana ASC,
                    a.id_actividad ASC
            `;

            db.query(
                sql,
                [idPracticante],
                (error, resultados) => {
                    if (error) {
                        console.error(
                            "Error obteniendo actividades disponibles:",
                            error
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al consultar las actividades de bitácora"
                        });
                    }

                    const actividades =
                        resultados.map((actividad) => ({
                            ...actividad,
                            entregada:
                                Number(actividad.entregada) === 1
                        }));

                    return res.status(200).json({
                        total_actividades:
                            actividades.length,
                        actividades
                    });
                }
            );
        }
    );
};

// ==========================================
// OBTENER BITÁCORAS DEL PRACTICANTE
// ==========================================

const obtenerBitacoras = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const sql = `
        SELECT
            b.id_bitacora,
            b.id_actividad,
            b.numero_semana,
            b.fecha_inicio,
            b.fecha_fin,
            b.nombre_archivo,
            b.ruta_archivo,
            b.estado,
            b.observaciones,
            b.fecha_envio,
            b.fecha_revision,
            a.titulo AS titulo_actividad,
            a.descripcion AS descripcion_actividad,
            a.fecha_limite
        FROM bitacoras b
        INNER JOIN practicantes p
            ON b.id_practicante = p.id_practicante
        LEFT JOIN actividades_bitacora a
            ON b.id_actividad = a.id_actividad
        WHERE p.id_usuario = ?
        ORDER BY
            b.numero_semana DESC,
            b.fecha_envio DESC,
            b.id_bitacora DESC
    `;

    db.query(
        sql,
        [idUsuario],
        (error, resultados) => {
            if (error) {
                console.error(
                    "Error obteniendo bitácoras:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar las bitácoras"
                });
            }

            const bitacoras =
                resultados.map((bitacora) => ({
                    ...bitacora,
                    url_archivo:
                        `/api/practicantes/bitacoras/${bitacora.id_bitacora}/archivo`
                }));

            return res.status(200).json({
                total_bitacoras:
                    bitacoras.length,
                bitacoras
            });
        }
    );
};

// ==========================================
// OBTENER ARCHIVO PDF DEL PRACTICANTE
// ==========================================

const obtenerArchivoBitacora = (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const { id } = req.params;

    const sql = `
        SELECT
            b.ruta_archivo,
            b.nombre_archivo
        FROM bitacoras b
        INNER JOIN practicantes p
            ON b.id_practicante = p.id_practicante
        WHERE b.id_bitacora = ?
          AND p.id_usuario = ?
    `;

    db.query(
        sql,
        [id, idUsuario],
        (error, resultados) => {
            if (error) {
                console.error(
                    "Error consultando archivo de bitácora:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar la bitácora"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "Bitácora no encontrada"
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
                    mensaje:
                        "Archivo PDF no encontrado"
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
        }
    );
};

module.exports = {
    subirBitacora,
    obtenerActividadesDisponibles,
    obtenerBitacoras,
    obtenerArchivoBitacora
};