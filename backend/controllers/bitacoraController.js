const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const registrarActividad = require("../utils/registrarActividad");

/// ==========================================
// SUBIR BITÁCORA
// ==========================================

const subirBitacora = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        numero_semana,
        fecha_inicio,
        fecha_fin
    } = req.body;

    // Función auxiliar para eliminar el archivo
    // si Multer ya lo guardó pero ocurre un error después.
    const eliminarArchivoSubido = () => {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (error) {
                console.error(
                    "Error eliminando archivo temporal:",
                    error
                );
            }
        }
    };

    // Validar campos obligatorios
    if (
        !numero_semana ||
        !fecha_inicio ||
        !fecha_fin ||
        !req.file
    ) {
        eliminarArchivoSubido();

        return res.status(400).json({
            mensaje:
                "Semana, fechas y archivo PDF son obligatorios"
        });
    }

    // Validar número de semana
    const semana = Number(numero_semana);

    if (
        !Number.isInteger(semana) ||
        semana <= 0
    ) {
        eliminarArchivoSubido();

        return res.status(400).json({
            mensaje:
                "El número de semana debe ser un entero mayor a 0"
        });
    }

    // Validar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (
        Number.isNaN(inicio.getTime()) ||
        Number.isNaN(fin.getTime())
    ) {
        eliminarArchivoSubido();

        return res.status(400).json({
            mensaje: "Las fechas proporcionadas no son válidas"
        });
    }

    if (fin < inicio) {
        eliminarArchivoSubido();

        return res.status(400).json({
            mensaje:
                "La fecha de fin no puede ser anterior a la fecha de inicio"
        });
    }

    // Buscar practicante
    db.query(
        "SELECT id_practicante FROM practicantes WHERE id_usuario = ?",
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

            // Verificar que no exista otra bitácora
            // para la misma semana.
            const sqlDuplicada = `
                SELECT id_bitacora
                FROM bitacoras
                WHERE id_practicante = ?
                  AND numero_semana = ?
                LIMIT 1
            `;

            db.query(
                sqlDuplicada,
                [idPracticante, semana],
                (errorDuplicada, resultadosDuplicada) => {
                    if (errorDuplicada) {
                        console.error(
                            "Error verificando bitácora duplicada:",
                            errorDuplicada
                        );

                        eliminarArchivoSubido();

                        return res.status(500).json({
                            mensaje:
                                "Error al verificar la bitácora"
                        });
                    }

                    if (resultadosDuplicada.length > 0) {
                        eliminarArchivoSubido();

                        return res.status(409).json({
                            mensaje:
                                "Ya existe una bitácora registrada para esa semana"
                        });
                    }

                    const sql = `
                        INSERT INTO bitacoras (
                            id_practicante,
                            numero_semana,
                            fecha_inicio,
                            fecha_fin,
                            nombre_archivo,
                            ruta_archivo,
                            estado
                        )
                        VALUES (?, ?, ?, ?, ?, ?, 'Pendiente')
                    `;

                    db.query(
                        sql,
                        [
                            idPracticante,
                            semana,
                            fecha_inicio,
                            fecha_fin,
                            req.file.originalname,
                            req.file.filename
                        ],
                        (errorInsert, resultado) => {
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
                                    resultado.insertId,
                                archivo:
                                    req.file.originalname
                            });
                        }
                    );
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
        INNER JOIN practicantes p
            ON b.id_practicante = p.id_practicante
        WHERE p.id_usuario = ?
        ORDER BY b.fecha_envio DESC, b.id_bitacora DESC
    `;

    db.query(sql, [idUsuario], (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo bitácoras:",
                error
            );

            return res.status(500).json({
                mensaje: "Error al consultar las bitácoras"
            });
        }

        const bitacoras = resultados.map((bitacora) => ({
            ...bitacora,
            url_archivo:
                `/api/practicantes/bitacoras/${bitacora.id_bitacora}/archivo`
        }));

        return res.status(200).json({
            total_bitacoras: bitacoras.length,
            bitacoras
        });
    });
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

    db.query(sql, [id, idUsuario], (error, resultados) => {
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

module.exports = {
    subirBitacora,
    obtenerBitacoras,
    obtenerArchivoBitacora
};