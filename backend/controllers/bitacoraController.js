const db = require("../config/db");
const registrarActividad = require("../utils/registrarActividad");

// ==========================================
// SUBIR BITÁCORA
// ==========================================

const subirBitacora = (req, res) => {
    const idUsuario = req.usuario.id_usuario;
    const { id_actividad } = req.body || {};

    if (
        id_actividad === undefined ||
        id_actividad === null ||
        id_actividad === "" ||
        !req.file
    ) {
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
        return res.status(400).json({
            mensaje:
                "El id de la actividad de bitácora es inválido"
        });
    }

    if (
        !req.file.buffer ||
        req.file.buffer.length === 0
    ) {
        return res.status(400).json({
            mensaje:
                "El archivo PDF recibido está vacío"
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

                        return res.status(500).json({
                            mensaje:
                                "Error al consultar la actividad de bitácora"
                        });
                    }

                    if (resultadosActividad.length === 0) {
                        return res.status(404).json({
                            mensaje:
                                "Actividad de bitácora no encontrada"
                        });
                    }

                    const actividad =
                        resultadosActividad[0];

                    if (Number(actividad.activa) !== 1) {
                        return res.status(400).json({
                            mensaje:
                                "La actividad de bitácora se encuentra desactivada"
                        });
                    }

                    const semana =
                        Number(actividad.numero_semana);

                    const sqlExistente = `
                        SELECT
                            id_bitacora,
                            estado,
                            nombre_archivo
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
                        sqlExistente,
                        [
                            idPracticante,
                            idActividad,
                            semana
                        ],
                        (
                            errorExistente,
                            resultadosExistente
                        ) => {
                            if (errorExistente) {
                                console.error(
                                    "Error verificando bitácora existente:",
                                    errorExistente
                                );

                                return res.status(500).json({
                                    mensaje:
                                        "Error al verificar la entrega de la bitácora"
                                });
                            }

                            if (
                                resultadosExistente.length > 0
                            ) {
                                const bitacoraActual =
                                    resultadosExistente[0];

                                if (
                                    bitacoraActual.estado !==
                                    "Rechazada"
                                ) {
                                    return res.status(409).json({
                                        mensaje:
                                            "La bitácora ya fue entregada y solo puede reemplazarse cuando está rechazada"
                                    });
                                }

                                const sqlReemplazar = `
                                    UPDATE bitacoras
                                    SET
                                        id_actividad = ?,
                                        numero_semana = ?,
                                        fecha_inicio = ?,
                                        fecha_fin = ?,
                                        nombre_archivo = ?,
                                        archivo_pdf = ?,
                                        ruta_archivo = '',
                                        estado = 'Pendiente',
                                        observaciones = NULL,
                                        fecha_envio = NOW(),
                                        fecha_revision = NULL,
                                        revisado_por = NULL
                                    WHERE id_bitacora = ?
                                `;

                                db.query(
                                    sqlReemplazar,
                                    [
                                        idActividad,
                                        semana,
                                        actividad.fecha_inicio,
                                        actividad.fecha_fin,
                                        req.file.originalname,
                                        req.file.buffer,
                                        bitacoraActual.id_bitacora
                                    ],
                                    (
                                        errorReemplazar
                                    ) => {
                                        if (errorReemplazar) {
                                            console.error(
                                                "Error reemplazando bitácora:",
                                                errorReemplazar
                                            );

                                            return res.status(500).json({
                                                mensaje:
                                                    "Error al reemplazar la bitácora rechazada"
                                            });
                                        }

                                        registrarActividad(
                                            idUsuario,
                                            "REENVIAR_BITACORA",
                                            `El practicante reemplazó y volvió a enviar la bitácora de la semana ${semana}: ${req.file.originalname}`
                                        );

                                        return res.status(200).json({
                                            mensaje:
                                                "Bitácora corregida enviada nuevamente. El estado volvió a Pendiente.",
                                            id_bitacora:
                                                bitacoraActual.id_bitacora,
                                            id_actividad:
                                                idActividad,
                                            numero_semana:
                                                semana,
                                            estado:
                                                "Pendiente",
                                            archivo:
                                                req.file.originalname
                                        });
                                    }
                                );

                                return;
                            }

                            const sqlInsert = `
                                INSERT INTO bitacoras (
                                    id_practicante,
                                    id_actividad,
                                    numero_semana,
                                    fecha_inicio,
                                    fecha_fin,
                                    nombre_archivo,
                                    archivo_pdf,
                                    ruta_archivo,
                                    estado,
                                    fecha_envio
                                )
                                VALUES (
                                    ?, ?, ?, ?, ?, ?, ?, '',
                                    'Pendiente',
                                    NOW()
                                )
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
                                    req.file.buffer
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
                                        estado:
                                            "Pendiente",
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
            b.archivo_pdf,
            b.nombre_archivo
        FROM bitacoras b
        INNER JOIN practicantes p
            ON b.id_practicante = p.id_practicante
        WHERE b.id_bitacora = ?
          AND p.id_usuario = ?
        LIMIT 1
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

            if (
                !bitacora.archivo_pdf ||
                bitacora.archivo_pdf.length === 0
            ) {
                return res.status(404).json({
                    mensaje:
                        "Archivo PDF no encontrado"
                });
            }

            const nombreSeguro = String(
                bitacora.nombre_archivo || "bitacora.pdf"
            ).replace(/["\r\n]/g, "");

            res.setHeader(
                "Content-Type",
                "application/pdf"
            );

            res.setHeader(
                "Content-Disposition",
                `inline; filename="${nombreSeguro}"`
            );

            res.setHeader(
                "Content-Length",
                bitacora.archivo_pdf.length
            );

            return res.status(200).send(
                bitacora.archivo_pdf
            );
        }
    );
};

module.exports = {
    subirBitacora,
    obtenerActividadesDisponibles,
    obtenerBitacoras,
    obtenerArchivoBitacora
};