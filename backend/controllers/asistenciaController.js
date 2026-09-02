const db = require("../config/db");
const registrarActividad = require("../utils/registrarActividad");

const {
    obtenerFechaActual,
    obtenerHoraActual,
    obtenerDiaSemanaActual
} = require("../utils/fechaHora");


// ==========================================
// REGISTRAR ENTRADA
// ==========================================

const registrarEntrada = (req, res) => {

    const idUsuario = req.usuario.id_usuario;

    // Fecha y hora oficiales del sistema NMR.
    // Se obtienen siempre con APP_TIMEZONE
    // (America/Mexico_City) desde utils/fechaHora.

    const fechaActual = obtenerFechaActual();
    const horaActual = obtenerHoraActual();
    const diaSemana = obtenerDiaSemanaActual();


    // ==========================================
    // BUSCAR PRACTICANTE
    // ==========================================

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


            // ==========================================
            // BUSCAR HORARIO DEL DÍA ACTUAL
            // ==========================================

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
                            mensaje:
                                "Error al consultar el horario"
                        });
                    }


                    if (resultadosHorario.length === 0) {

                        return res.status(400).json({
                            mensaje:
                                "No tienes un horario asignado para hoy"
                        });
                    }


                    const horario = resultadosHorario[0];


                    // ==========================================
                    // VERIFICAR SI YA EXISTE ASISTENCIA HOY
                    // ==========================================

                    const sqlAsistencia = `
                        SELECT
                            id_asistencia,
                            hora_entrada_real
                        FROM asistencias
                        WHERE id_practicante = ?
                          AND fecha = ?
                    `;


                    db.query(
                        sqlAsistencia,
                        [idPracticante, fechaActual],
                        (
                            errorAsistencia,
                            resultadosAsistencia
                        ) => {

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


                            // Si ya existe una entrada para hoy,
                            // no permitir registrar otra.

                            if (
                                resultadosAsistencia.length > 0 &&
                                resultadosAsistencia[0]
                                    .hora_entrada_real
                            ) {

                                return res.status(409).json({
                                    mensaje:
                                        "La entrada de hoy ya fue registrada"
                                });
                            }


                            // ==========================================
                            // DETERMINAR ESTADO DE ENTRADA
                            // ==========================================

                            // Esta lógica se conservará por ahora.
                            // Se modificará posteriormente en el punto 4.

                            const estado =
                                horaActual <= horario.hora_entrada
                                    ? "A tiempo"
                                    : "Retardo";


                            // ==========================================
                            // REGISTRAR ENTRADA
                            // ==========================================

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
                                (
                                    errorInsert,
                                    resultadoInsert
                                ) => {

                                    if (errorInsert) {

                                        console.error(
                                            "Error registrando entrada:",
                                            errorInsert
                                        );

                                        return res
                                            .status(500)
                                            .json({
                                                mensaje:
                                                    "Error al registrar la entrada"
                                            });
                                    }


                                    // Registrar actividad en historial

                                    registrarActividad(
                                        idUsuario,
                                        "REGISTRAR_ENTRADA",
                                        `El practicante registró su entrada el ${fechaActual} a las ${horaActual} con estado: ${estado}`
                                    );


                                    return res
                                        .status(201)
                                        .json({

                                            mensaje:
                                                "Entrada registrada correctamente",

                                            id_asistencia:
                                                resultadoInsert.insertId,

                                            fecha:
                                                fechaActual,

                                            hora_entrada:
                                                horaActual,

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


    // Fecha y hora oficiales del sistema NMR.

    const fechaActual = obtenerFechaActual();
    const horaActual = obtenerHoraActual();


    // ==========================================
    // BUSCAR PRACTICANTE
    // ==========================================

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



            // ==========================================
            // VALIDAR ACTIVIDAD DIARIA
            // ==========================================

            /*
                Antes de permitir que el practicante
                registre su salida, se verifica que
                exista una actividad diaria registrada
                para la fecha actual.

                SELECT 1 evita depender del nombre
                de la llave primaria de la tabla.
            */

            const sqlActividadDiaria = `
                SELECT 1
                FROM actividades_diarias
                WHERE id_practicante = ?
                  AND fecha = ?
                LIMIT 1
            `;


            db.query(
                sqlActividadDiaria,
                [
                    idPracticante,
                    fechaActual
                ],
                (
                    errorActividad,
                    resultadosActividad
                ) => {


                    if (errorActividad) {

                        console.error(
                            "Error consultando actividad diaria:",
                            errorActividad
                        );

                        return res
                            .status(500)
                            .json({
                                mensaje:
                                    "Error al verificar la actividad diaria"
                            });
                    }


                    // ==========================================
                    // BLOQUEAR SALIDA SI NO EXISTE ACTIVIDAD
                    // ==========================================

                    if (
                        resultadosActividad.length === 0
                    ) {

                        return res
                            .status(400)
                            .json({
                                mensaje:
                                    "Debes registrar tu actividad diaria antes de checar tu salida"
                            });
                    }



                    // ==========================================
                    // BUSCAR ASISTENCIA DE HOY
                    // ==========================================

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
                        [
                            idPracticante,
                            fechaActual
                        ],
                        (
                            errorAsistencia,
                            resultadosAsistencia
                        ) => {


                            if (errorAsistencia) {

                                console.error(
                                    "Error consultando asistencia:",
                                    errorAsistencia
                                );

                                return res
                                    .status(500)
                                    .json({
                                        mensaje:
                                            "Error al consultar la asistencia"
                                    });
                            }



                            // ==========================================
                            // VALIDAR QUE EXISTA ENTRADA
                            // ==========================================

                            if (
                                resultadosAsistencia.length ===
                                0
                            ) {

                                return res
                                    .status(400)
                                    .json({
                                        mensaje:
                                            "No has registrado tu entrada de hoy"
                                    });
                            }



                            const asistencia =
                                resultadosAsistencia[0];



                            if (
                                !asistencia.hora_entrada_real
                            ) {

                                return res
                                    .status(400)
                                    .json({
                                        mensaje:
                                            "Debes registrar tu entrada antes de la salida"
                                    });
                            }



                            // ==========================================
                            // VALIDAR QUE NO EXISTA SALIDA
                            // ==========================================

                            if (
                                asistencia.hora_salida_real
                            ) {

                                return res
                                    .status(409)
                                    .json({
                                        mensaje:
                                            "La salida de hoy ya fue registrada"
                                    });
                            }



                            // ==========================================
                            // CALCULAR HORAS TRABAJADAS
                            // ==========================================

                            const convertirSegundos = (
                                hora
                            ) => {

                                const [h, m, s] =
                                    hora
                                        .split(":")
                                        .map(Number);

                                return (
                                    h * 3600 +
                                    m * 60 +
                                    s
                                );
                            };


                            const segundosEntrada =
                                convertirSegundos(
                                    asistencia
                                        .hora_entrada_real
                                );


                            const segundosSalida =
                                convertirSegundos(
                                    horaActual
                                );


                            const segundosTrabajados =
                                segundosSalida -
                                segundosEntrada;



                            if (
                                segundosTrabajados <= 0
                            ) {

                                return res
                                    .status(400)
                                    .json({
                                        mensaje:
                                            "La hora de salida debe ser posterior a la hora de entrada"
                                    });
                            }



                            const horasReales =
                                segundosTrabajados /
                                3600;


                            // Se contabiliza todo el tiempo real
                            // trabajado.

                            const horasRedondeadas =
                                Number(
                                    horasReales.toFixed(
                                        2
                                    )
                                );



                            // ==========================================
                            // ACTUALIZAR ASISTENCIA
                            // ==========================================

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
                                    asistencia
                                        .id_asistencia
                                ],
                                (errorUpdate) => {


                                    if (errorUpdate) {

                                        console.error(
                                            "Error registrando salida:",
                                            errorUpdate
                                        );

                                        return res
                                            .status(500)
                                            .json({
                                                mensaje:
                                                    "Error al registrar la salida"
                                            });
                                    }



                                    // ==========================================
                                    // CREAR / ACTUALIZAR REGISTRO DE HORAS
                                    // ==========================================

                                    const sqlHoras = `
                                        INSERT INTO registros_horas (
                                            id_practicante,
                                            id_asistencia,
                                            fecha,
                                            horas,
                                            descripcion
                                        )
                                        VALUES (?, ?, ?, ?, ?)

                                        ON DUPLICATE KEY UPDATE
                                            fecha = VALUES(fecha),
                                            horas = VALUES(horas),
                                            descripcion = VALUES(descripcion)
                                    `;


                                    const descripcion =
                                        "Horas generadas automáticamente por asistencia según la hora real de entrada y salida.";



                                    db.query(
                                        sqlHoras,
                                        [
                                            idPracticante,

                                            asistencia
                                                .id_asistencia,

                                            fechaActual,

                                            horasRedondeadas,

                                            descripcion
                                        ],
                                        (errorHoras) => {


                                            if (
                                                errorHoras
                                            ) {

                                                console.error(
                                                    "Error registrando horas:",
                                                    errorHoras
                                                );

                                                return res
                                                    .status(
                                                        500
                                                    )
                                                    .json(
                                                        {
                                                            mensaje:
                                                                "La salida fue registrada, pero hubo un error al calcular las horas"
                                                        }
                                                    );
                                            }



                                            // ==========================================
                                            // REGISTRAR ACTIVIDAD EN HISTORIAL
                                            // ==========================================

                                            registrarActividad(
                                                idUsuario,
                                                "REGISTRAR_SALIDA",
                                                `El practicante registró su salida el ${fechaActual} a las ${horaActual}. Horas contabilizadas: ${horasRedondeadas}`
                                            );



                                            // ==========================================
                                            // RESPUESTA EXITOSA
                                            // ==========================================

                                            return res
                                                .status(200)
                                                .json({

                                                    mensaje:
                                                        "Salida registrada correctamente",

                                                    id_asistencia:
                                                        asistencia
                                                            .id_asistencia,

                                                    fecha:
                                                        fechaActual,

                                                    hora_entrada:
                                                        asistencia
                                                            .hora_entrada_real,

                                                    hora_salida:
                                                        horaActual,

                                                    horas_reales:
                                                        Number(
                                                            horasReales.toFixed(
                                                                2
                                                            )
                                                        ),

                                                    horas_contabilizadas:
                                                        horasRedondeadas
                                                });
                                        }
                                    );
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
// OBTENER HORARIO DEL PRACTICANTE
// ==========================================

const obtenerHorario = (req, res) => {

    const idUsuario =
        req.usuario.id_usuario;


    const sql = `
        SELECT
            h.id_horario,
            h.dia_semana,
            h.hora_entrada,
            h.hora_salida,
            h.activo
        FROM horarios h

        INNER JOIN practicantes p
            ON h.id_practicante =
               p.id_practicante

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


    db.query(
        sql,
        [idUsuario],
        (error, resultados) => {


            if (error) {

                console.error(
                    "Error obteniendo horario:",
                    error
                );

                return res
                    .status(500)
                    .json({
                        mensaje:
                            "Error al consultar el horario"
                    });
            }


            return res
                .status(200)
                .json({
                    horario:
                        resultados
                });
        }
    );
};



// ==========================================
// OBTENER HISTORIAL DE ASISTENCIAS
// ==========================================

const obtenerHistorial = (req, res) => {

    const idUsuario =
        req.usuario.id_usuario;


    const sql = `
        SELECT
            a.id_asistencia,
            a.fecha,

            h.hora_entrada
                AS hora_entrada_esperada,

            h.hora_salida
                AS hora_salida_esperada,

            a.hora_entrada_real,
            a.hora_salida_real,
            a.estado,
            a.observaciones

        FROM asistencias a

        INNER JOIN practicantes p
            ON a.id_practicante =
               p.id_practicante

        INNER JOIN horarios h
            ON a.id_horario =
               h.id_horario

        WHERE p.id_usuario = ?

        ORDER BY
            a.fecha DESC,
            a.id_asistencia DESC
    `;


    db.query(
        sql,
        [idUsuario],
        (error, resultados) => {


            if (error) {

                console.error(
                    "Error obteniendo historial de asistencias:",
                    error
                );

                return res
                    .status(500)
                    .json({
                        mensaje:
                            "Error al consultar el historial de asistencias"
                    });
            }


            return res
                .status(200)
                .json({

                    total_asistencias:
                        resultados.length,

                    asistencias:
                        resultados
                });
        }
    );
};



// ==========================================
// EXPORTACIONES
// ==========================================

module.exports = {

    registrarEntrada,

    registrarSalida,

    obtenerHorario,

    obtenerHistorial
};