const db = require("../config/db");

// ==========================================
// SUBIR BITÁCORA
// ==========================================

const subirBitacora = (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        numero_semana,
        fecha_inicio,
        fecha_fin
    } = req.body;

    if (
        !numero_semana ||
        !fecha_inicio ||
        !fecha_fin ||
        !req.file
    ) {
        return res.status(400).json({
            mensaje:
                "Semana, fechas y archivo PDF son obligatorios"
        });
    }

    db.query(
        "SELECT id_practicante FROM practicantes WHERE id_usuario = ?",
        [idUsuario],
        (errorPracticante, resultadosPracticante) => {
            if (errorPracticante) {
                console.error(errorPracticante);

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
                    numero_semana,
                    fecha_inicio,
                    fecha_fin,
                    req.file.originalname,
                    req.file.filename
                ],
                (errorInsert, resultado) => {
                    if (errorInsert) {
                        console.error(errorInsert);

                        return res.status(500).json({
                            mensaje:
                                "Error al registrar la bitácora"
                        });
                    }

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
};

module.exports = {
    subirBitacora
};