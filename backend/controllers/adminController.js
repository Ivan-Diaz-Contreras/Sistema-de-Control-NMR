const db = require("../config/db");
const bcrypt = require("bcrypt");
const registrarActividad = require("../utils/registrarActividad");
const {
    normalizarTexto,
    validarNombre,
    validarCorreo,
    validarPassword,
    validarTelefono,
    validarUniversidad,
    validarHorasRequeridas,
    validarFechaISO
} = require("../utils/validaciones");

// ==========================================
// Crear administrador
// ==========================================
const crearAdministrador = async (req, res) => {
    const {
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        password,
        confirmar_password
    } = req.body || {};

    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (
        !nombre ||
        !apellido_paterno ||
        !correo ||
        !password ||
        !confirmar_password
    ) {
        return res.status(400).json({
            mensaje: "Completa todos los campos obligatorios"
        });
    }

    if (password !== confirmar_password) {
        return res.status(400).json({
            mensaje: "Las contraseñas no coinciden"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            mensaje:
                "La contraseña debe tener al menos 8 caracteres"
        });
    }

    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneNumero = /\d/.test(password);

    if (
        !tieneMayuscula ||
        !tieneMinuscula ||
        !tieneNumero
    ) {
        return res.status(400).json({
            mensaje:
                "La contraseña debe incluir una mayúscula, una minúscula y un número"
        });
    }

    try {
        // ==========================================
        // VERIFICAR CORREO
        // ==========================================

        const [usuariosExistentes] = await db
            .promise()
            .query(
                `
                SELECT id_usuario
                FROM usuarios
                WHERE correo = ?
                LIMIT 1
                `,
                [correo.trim().toLowerCase()]
            );

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                mensaje:
                    "Ya existe una cuenta registrada con ese correo"
            });
        }

        // ==========================================
        // OBTENER ROL ADMINISTRADOR
        // ==========================================

        const [roles] = await db
            .promise()
            .query(
                `
                SELECT id_rol
                FROM roles
                WHERE nombre = 'Administrador'
                LIMIT 1
                `
            );

        if (roles.length === 0) {
            return res.status(500).json({
                mensaje:
                    "No se encontró el rol Administrador"
            });
        }

        const idRolAdministrador =
            roles[0].id_rol;

        // ==========================================
        // CIFRAR CONTRASEÑA
        // ==========================================

        const passwordHash =
            await bcrypt.hash(password, 10);

        // ==========================================
        // CREAR USUARIO
        // ==========================================

        const [resultado] = await db
            .promise()
            .query(
                `
                INSERT INTO usuarios (
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    correo,
                    password_hash,
                    id_rol,
                    debe_cambiar_password
                )
                VALUES (?, ?, ?, ?, ?, ?, 1)
                `,
                [
                    nombre.trim(),
                    apellido_paterno.trim(),
                    apellido_materno?.trim() || null,
                    correo.trim().toLowerCase(),
                    passwordHash,
                    idRolAdministrador
                ]
            );

        return res.status(201).json({
            mensaje:
                "Administrador creado correctamente",
            id_usuario:
                resultado.insertId
        });

    } catch (error) {
        console.error(
            "Error creando administrador:",
            error
        );

        return res.status(500).json({
            mensaje:
                "Error al crear la cuenta de administrador"
        });
    }
};

const obtenerAdministradores = async (req, res) => {
    try {
        const [administradores] = await db
            .promise()
            .query(
                `
                SELECT
                    u.id_usuario,
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno,
                    u.correo,
                    u.debe_cambiar_password
                FROM usuarios u
                INNER JOIN roles r
                    ON u.id_rol = r.id_rol
                WHERE r.nombre = 'Administrador'
                ORDER BY u.nombre ASC,
                         u.apellido_paterno ASC
                `
            );

        return res.status(200).json({
            administradores
        });
    } catch (error) {
        console.error(
            "Error obteniendo administradores:",
            error
        );

        return res.status(500).json({
            mensaje:
                "Error al consultar las cuentas de administrador"
        });
    }
};

// ==========================================
// OBTENER TODOS LOS PRACTICANTES
// ==========================================

const obtenerPracticantes = (req, res) => {
    const { id_carrera } = req.query;

    let sql = `
        SELECT
            p.id_practicante,
            u.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.correo,
            u.activo,
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
    `;

    const parametros = [];

    if (id_carrera !== undefined) {
        const idCarrera = Number(id_carrera);

        if (!Number.isInteger(idCarrera) || idCarrera <= 0) {
            return res.status(400).json({
                mensaje: "El id de carrera es inválido"
            });
        }

        sql += `
            WHERE p.id_carrera = ?
        `;

        parametros.push(idCarrera);
    }

    sql += `
        ORDER BY u.apellido_paterno, u.nombre
    `;

    db.query(sql, parametros, (error, resultados) => {
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
            filtro_carrera:
                id_carrera !== undefined
                    ? Number(id_carrera)
                    : null,
            total_practicantes: resultados.length,
            practicantes: resultados
        });
    });
};


// ==========================================
// CREAR PRACTICANTE DESDE ADMINISTRACIÓN
// La contraseña enviada es temporal y solo
// se almacena como hash.
// ==========================================

const crearPracticanteAdmin = async (req, res) => {
    const idUsuarioAdmin = req.usuario.id_usuario;

    const {
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        password,
        id_carrera,
        telefono,
        universidad,
        fecha_inicio,
        fecha_fin,
        horas_requeridas
    } = req.body || {};

    if (
        !nombre ||
        !apellido_paterno ||
        !correo ||
        !password ||
        !id_carrera ||
        !fecha_inicio ||
        horas_requeridas === undefined ||
        horas_requeridas === null
    ) {
        return res.status(400).json({
            mensaje: "Faltan campos obligatorios"
        });
    }

    const nombreLimpio =
        normalizarTexto(nombre);

    const apellidoPaternoLimpio =
        normalizarTexto(apellido_paterno);

    const apellidoMaternoLimpio =
        normalizarTexto(apellido_materno);

    const correoLimpio =
        normalizarTexto(correo).toLowerCase();

    const telefonoLimpio =
        normalizarTexto(telefono);

    const universidadLimpia =
        normalizarTexto(universidad);

    const passwordTexto =
        String(password ?? "");

    if (!validarNombre(nombreLimpio)) {
        return res.status(400).json({
            mensaje:
                "El nombre debe tener entre 2 y 15 caracteres y contener solo letras"
        });
    }

    if (
        apellidoPaternoLimpio.length > 60 ||
        !validarNombre(apellidoPaternoLimpio)
    ) {
        return res.status(400).json({
            mensaje:
                "El apellido paterno debe contener solo letras y tener entre 2 y 15 caracteres"
        });
    }

    if (
        apellidoMaternoLimpio &&
        !validarNombre(apellidoMaternoLimpio)
    ) {
        return res.status(400).json({
            mensaje:
                "El apellido materno debe contener solo letras y tener entre 2 y 15 caracteres"
        });
    }

    if (!validarCorreo(correoLimpio)) {
        return res.status(400).json({
            mensaje:
                "El correo no tiene un formato valido"
        });
    }

    if (!validarPassword(passwordTexto)) {
        return res.status(400).json({
            mensaje:
                "La contrasena temporal debe tener entre 8 y 20 caracteres e incluir mayuscula, minuscula y numero"
        });
    }

    if (!validarTelefono(telefonoLimpio)) {
        return res.status(400).json({
            mensaje:
                "El telefono debe contener exactamente 10 digitos"
        });
    }

    if (!validarUniversidad(universidadLimpia)) {
        return res.status(400).json({
            mensaje:
                "La universidad debe tener entre 2 y 20 caracteres"
        });
    }

    const idCarrera = Number(id_carrera);
    const horasRequeridasNumero =
        Number(horas_requeridas);

    if (
        !Number.isInteger(idCarrera) ||
        idCarrera <= 0
    ) {
        return res.status(400).json({
            mensaje:
                "La carrera seleccionada no es valida"
        });
    }

    if (
        !validarHorasRequeridas(
            horasRequeridasNumero
        )
    ) {
        return res.status(400).json({
            mensaje:
                "Las horas requeridas deben estar entre 1 y 2000"
        });
    }

    if (!validarFechaISO(fecha_inicio)) {
        return res.status(400).json({
            mensaje:
                "La fecha de inicio no es valida"
        });
    }

    if (
        fecha_fin &&
        !validarFechaISO(fecha_fin)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha de fin no es valida"
        });
    }

    if (
        fecha_fin &&
        String(fecha_fin) < String(fecha_inicio)
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha de fin no puede ser anterior a la fecha de inicio"
        });
    }

    let passwordHash;

    try {
        passwordHash = await bcrypt.hash(
            String(password),
            10
        );
    } catch (errorHash) {
        console.error(
            "Error generando hash de contraseña:",
            errorHash
        );

        return res.status(500).json({
            mensaje:
                "Error al procesar la contraseña temporal"
        });
    }

    db.getConnection((errorConexion, connection) => {
        if (errorConexion) {
            console.error(
                "Error obteniendo conexión:",
                errorConexion
            );

            return res.status(500).json({
                mensaje:
                    "Error al conectar con la base de datos"
            });
        }

        const liberar = () => {
            connection.release();
        };

        connection.beginTransaction(
            (errorTransaccion) => {
                if (errorTransaccion) {
                    liberar();

                    console.error(
                        "Error iniciando transacción:",
                        errorTransaccion
                    );

                    return res.status(500).json({
                        mensaje:
                            "Error al iniciar el registro del practicante"
                    });
                }

                const rollback = (
                    status,
                    mensaje,
                    error = null
                ) => {
                    connection.rollback(() => {
                        liberar();

                        if (error) {
                            console.error(
                                mensaje,
                                error
                            );
                        }

                        return res.status(status).json({
                            mensaje
                        });
                    });
                };

                connection.query(
                    `
                        SELECT id_carrera
                        FROM carreras
                        WHERE id_carrera = ?
                          AND activa = 1
                    `,
                    [idCarrera],
                    (errorCarrera, carreraResultado) => {
                        if (errorCarrera) {
                            return rollback(
                                500,
                                "Error al consultar la carrera",
                                errorCarrera
                            );
                        }

                        if (
                            carreraResultado.length === 0
                        ) {
                            return rollback(
                                400,
                                "La carrera seleccionada no existe o está desactivada"
                            );
                        }

                        connection.query(
                            `
                                SELECT id_usuario
                                FROM usuarios
                                WHERE correo = ?
                            `,
                            [correoLimpio],
                            (
                                errorCorreo,
                                correoResultado
                            ) => {
                                if (errorCorreo) {
                                    return rollback(
                                        500,
                                        "Error al verificar el correo",
                                        errorCorreo
                                    );
                                }

                                if (
                                    correoResultado.length > 0
                                ) {
                                    return rollback(
                                        409,
                                        "El correo ya está registrado"
                                    );
                                }

                                const generarMatricula = (
                                    continuar
                                ) => {
                                    connection.query(
                                        `
                                            SELECT
                                                COALESCE(
                                                    MAX(
                                                        CAST(
                                                            SUBSTRING(matricula, 4)
                                                            AS UNSIGNED
                                                        )
                                                    ),
                                                    -1
                                                ) + 1 AS siguiente_numero
                                            FROM practicantes
                                            WHERE matricula REGEXP '^NMR[0-9]{3}$'
                                        `,
                                        (
                                            errorMatricula,
                                            matriculaResultado
                                        ) => {
                                            if (errorMatricula) {
                                                return rollback(
                                                    500,
                                                    "Error al generar la matr?cula",
                                                    errorMatricula
                                                );
                                            }

                                            const siguienteNumero = Number(
                                                matriculaResultado[0]
                                                    .siguiente_numero
                                            );

                                            if (
                                                !Number.isInteger(siguienteNumero) ||
                                                siguienteNumero < 0
                                            ) {
                                                return rollback(
                                                    500,
                                                    "No fue posible calcular la siguiente matr?cula"
                                                );
                                            }

                                            if (siguienteNumero > 999) {
                                                return rollback(
                                                    409,
                                                    "Se alcanz? el l?mite de matr?culas NMR"
                                                );
                                            }

                                            const matriculaGenerada =
                                                `NMR${String(siguienteNumero).padStart(
                                                    3,
                                                    "0"
                                                )}`;

                                            continuar(matriculaGenerada);
                                        }
                                    );
                                };

                                generarMatricula((matriculaGenerada) => {
                                    connection.query(
                                        `
                                            SELECT id_rol
                                            FROM roles
                                            WHERE nombre = 'Practicante'
                                            LIMIT 1
                                        `,
                                        (
                                            errorRol,
                                            rolResultado
                                        ) => {
                                            if (errorRol) {
                                                return rollback(
                                                    500,
                                                    "Error al consultar el rol Practicante",
                                                    errorRol
                                                );
                                            }

                                            if (
                                                rolResultado.length ===
                                                0
                                            ) {
                                                return rollback(
                                                    500,
                                                    "No se encontró el rol Practicante"
                                                );
                                            }

                                            const idRol =
                                                rolResultado[0]
                                                    .id_rol;

                                            connection.query(
                                                `
                                                    INSERT INTO usuarios (
                                                        nombre,
                                                        apellido_paterno,
                                                        apellido_materno,
                                                        correo,
                                                        password_hash,
                                                        id_rol,
                                                        activo,
                                                        debe_cambiar_password
                                                    )
                                                    VALUES (?, ?, ?, ?, ?, ?, 1, 1)
                                                `,
                                                [
                                                    nombreLimpio,
                                                    apellidoPaternoLimpio,
                                                    apellidoMaternoLimpio ||
                                                        null,
                                                    correoLimpio,
                                                    passwordHash,
                                                    idRol
                                                ],
                                                (
                                                    errorUsuario,
                                                    usuarioResultado
                                                ) => {
                                                    if (
                                                        errorUsuario
                                                    ) {
                                                        if (
                                                            errorUsuario.code ===
                                                            "ER_DUP_ENTRY"
                                                        ) {
                                                            return rollback(
                                                                409,
                                                                "El correo ya está registrado"
                                                            );
                                                        }

                                                        return rollback(
                                                            500,
                                                            "Error al registrar el usuario",
                                                            errorUsuario
                                                        );
                                                    }

                                                    const idUsuario =
                                                        usuarioResultado.insertId;

                                                    connection.query(
                                                        `
                                                            INSERT INTO practicantes (
                                                                id_usuario,
                                                                id_carrera,
                                                                matricula,
                                                                telefono,
                                                                universidad,
                                                                fecha_inicio,
                                                                fecha_fin,
                                                                horas_requeridas
                                                            )
                                                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                                        `,
                                                        [
                                                            idUsuario,
                                                            idCarrera,
                                                            matriculaGenerada,
                                                            telefonoLimpio ||
                                                                null,
                                                            universidadLimpia ||
                                                                null,
                                                            fecha_inicio,
                                                            fecha_fin ||
                                                                null,
                                                            horasRequeridasNumero
                                                        ],
                                                        (
                                                            errorPracticante,
                                                            practicanteResultado
                                                        ) => {
                                                            if (
                                                                errorPracticante
                                                            ) {
                                                                if (
                                                                    errorPracticante.code ===
                                                                    "ER_DUP_ENTRY"
                                                                ) {
                                                                    return rollback(
                                                                        409,
                                                                        "La matrícula ya está registrada"
                                                                    );
                                                                }

                                                                return rollback(
                                                                    500,
                                                                    "Error al crear el perfil del practicante",
                                                                    errorPracticante
                                                                );
                                                            }

                                                            connection.commit(
                                                                (
                                                                    errorCommit
                                                                ) => {
                                                                    if (
                                                                        errorCommit
                                                                    ) {
                                                                        return rollback(
                                                                            500,
                                                                            "Error al completar el registro",
                                                                            errorCommit
                                                                        );
                                                                    }

                                                                    liberar();

                                                                    registrarActividad(
                                                                        idUsuarioAdmin,
                                                                        "CREAR_PRACTICANTE",
                                                                        `El administrador creó al practicante ${nombre.trim()} ${apellido_paterno.trim()}`
                                                                    );

                                                                    return res
                                                                        .status(
                                                                            201
                                                                        )
                                                                        .json(
                                                                            {
                                                                                mensaje:
                                                                                    "Practicante creado correctamente",
                                                                                id_usuario:
                                                                                    idUsuario,
                                                                                id_practicante:
                                                                                    practicanteResultado.insertId,
                                                                                matricula:
                                                                                    matriculaGenerada,
                                                                                debe_cambiar_password:
                                                                                    1
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
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};

// ==========================================
// OBTENER UN PRACTICANTE POR ID
// ==========================================

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
            u.activo,
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
            u.activo,
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

        const horasRequeridas =
            Number(practicante.horas_requeridas);

        const horasAcumuladas =
            Number(practicante.horas_acumuladas);

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


// ==========================================
// CREAR ASISTENCIA HISTORICA DESDE ADMIN
// ==========================================

const crearAsistenciaHistorica = (req, res) => {
    const idUsuarioAdmin =
        req.usuario.id_usuario;

    const {
        id_practicante,
        fecha,
        hora_entrada_real,
        hora_salida_real,
        observaciones
    } = req.body || {};

    const idPracticante =
        Number(id_practicante);

    const fechaLimpia =
        String(fecha || "").trim();

    const entradaLimpia =
        String(
            hora_entrada_real || ""
        ).trim();

    const salidaLimpia =
        String(
            hora_salida_real || ""
        ).trim();

    const observacionesLimpias =
        observaciones === undefined ||
        observaciones === null
            ? null
            : String(observaciones).trim() ||
              null;

    if (
        !Number.isInteger(idPracticante) ||
        idPracticante <= 0
    ) {
        return res.status(400).json({
            mensaje:
                "Selecciona un practicante valido"
        });
    }

    const formatoFecha =
        /^\d{4}-\d{2}-\d{2}$/;

    if (!formatoFecha.test(fechaLimpia)) {
        return res.status(400).json({
            mensaje:
                "La fecha no tiene un formato valido"
        });
    }

    const [
        anio,
        mes,
        dia
    ] = fechaLimpia
        .split("-")
        .map(Number);

    const fechaUTC = new Date(
        Date.UTC(anio, mes - 1, dia)
    );

    const fechaEsReal =
        fechaUTC.getUTCFullYear() === anio &&
        fechaUTC.getUTCMonth() === mes - 1 &&
        fechaUTC.getUTCDate() === dia;

    if (!fechaEsReal) {
        return res.status(400).json({
            mensaje:
                "La fecha seleccionada no existe"
        });
    }

    const formatoHora =
        /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;

    if (
        !formatoHora.test(entradaLimpia) ||
        !formatoHora.test(salidaLimpia)
    ) {
        return res.status(400).json({
            mensaje:
                "La entrada y la salida deben tener una hora valida"
        });
    }

    const convertirSegundos = (hora) => {
        const [
            horas,
            minutos,
            segundos = 0
        ] = hora
            .split(":")
            .map(Number);

        return (
            horas * 3600 +
            minutos * 60 +
            segundos
        );
    };

    const segundosEntrada =
        convertirSegundos(entradaLimpia);

    const segundosSalida =
        convertirSegundos(salidaLimpia);

    if (
        segundosSalida <= segundosEntrada
    ) {
        return res.status(400).json({
            mensaje:
                "La hora de salida debe ser posterior a la hora de entrada"
        });
    }

    if (
        observacionesLimpias &&
        observacionesLimpias.length > 500
    ) {
        return res.status(400).json({
            mensaje:
                "Las observaciones no pueden superar los 500 caracteres"
        });
    }

    const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Mi\u00e9rcoles",
        "Jueves",
        "Viernes",
        "S\u00e1bado"
    ];

    const diaSemana =
        diasSemana[
            fechaUTC.getUTCDay()
        ];

    db.getConnection(
        (errorConexion, connection) => {
            if (errorConexion) {
                console.error(
                    "Error obteniendo conexion:",
                    errorConexion
                );

                return res.status(500).json({
                    mensaje:
                        "Error al iniciar el registro historico"
                });
            }

            let liberada = false;

            const liberar = () => {
                if (!liberada) {
                    liberada = true;
                    connection.release();
                }
            };

            const rollback = (
                estado,
                mensaje,
                error = null
            ) => {
                if (error) {
                    console.error(
                        mensaje,
                        error
                    );
                }

                connection.rollback(() => {
                    liberar();

                    return res
                        .status(estado)
                        .json({ mensaje });
                });
            };

            connection.beginTransaction(
                (errorTransaccion) => {
                    if (errorTransaccion) {
                        liberar();

                        console.error(
                            "Error iniciando transaccion:",
                            errorTransaccion
                        );

                        return res
                            .status(500)
                            .json({
                                mensaje:
                                    "Error al iniciar el registro historico"
                            });
                    }

                    const sqlPracticanteHorario = `
                        SELECT
                            p.id_practicante,
                            u.activo,
                            h.id_horario,
                            h.hora_entrada,
                            h.hora_salida,
                            DATE_FORMAT(
                                CURDATE(),
                                '%Y-%m-%d'
                            ) AS fecha_hoy
                        FROM practicantes p
                        INNER JOIN usuarios u
                            ON p.id_usuario =
                               u.id_usuario
                        LEFT JOIN horarios h
                            ON h.id_practicante =
                               p.id_practicante
                           AND h.dia_semana = ?
                           AND h.activo = 1
                        WHERE p.id_practicante = ?
                        LIMIT 1
                    `;

                    connection.query(
                        sqlPracticanteHorario,
                        [
                            diaSemana,
                            idPracticante
                        ],
                        (
                            errorHorario,
                            resultadosHorario
                        ) => {
                            if (errorHorario) {
                                return rollback(
                                    500,
                                    "Error al consultar el horario del practicante",
                                    errorHorario
                                );
                            }

                            if (
                                resultadosHorario.length ===
                                0
                            ) {
                                return rollback(
                                    404,
                                    "Practicante no encontrado"
                                );
                            }

                            const datosHorario =
                                resultadosHorario[0];

                            if (
                                Number(
                                    datosHorario.activo
                                ) !== 1
                            ) {
                                return rollback(
                                    409,
                                    "El practicante esta inactivo"
                                );
                            }

                            if (
                                fechaLimpia >
                                datosHorario.fecha_hoy
                            ) {
                                return rollback(
                                    400,
                                    "No se pueden registrar asistencias de fechas futuras"
                                );
                            }

                            if (
                                !datosHorario.id_horario
                            ) {
                                return rollback(
                                    409,
                                    `El practicante no tiene un horario activo para el dia ${diaSemana}`
                                );
                            }

                            const sqlDuplicado = `
                                SELECT id_asistencia
                                FROM asistencias
                                WHERE id_practicante = ?
                                  AND fecha = ?
                                LIMIT 1
                            `;

                            connection.query(
                                sqlDuplicado,
                                [
                                    idPracticante,
                                    fechaLimpia
                                ],
                                (
                                    errorDuplicado,
                                    duplicados
                                ) => {
                                    if (
                                        errorDuplicado
                                    ) {
                                        return rollback(
                                            500,
                                            "Error al verificar la asistencia",
                                            errorDuplicado
                                        );
                                    }

                                    if (
                                        duplicados.length >
                                        0
                                    ) {
                                        return rollback(
                                            409,
                                            "El practicante ya tiene una asistencia registrada en esa fecha"
                                        );
                                    }

                                    const entradaEsperada =
                                        convertirSegundos(
                                            String(
                                                datosHorario
                                                    .hora_entrada
                                            )
                                        );

                                    const estado =
                                        segundosEntrada <=
                                        entradaEsperada
                                            ? "A tiempo"
                                            : "Retardo";

                                    const horasReales =
                                        (
                                            segundosSalida -
                                            segundosEntrada
                                        ) / 3600;

                                    const horasContabilizadas =
                                        Number(
                                            horasReales.toFixed(2)
                                        );

                                    const sqlAsistencia = `
                                        INSERT INTO asistencias (
                                            id_practicante,
                                            id_horario,
                                            fecha,
                                            hora_entrada_real,
                                            hora_salida_real,
                                            estado,
                                            observaciones
                                        )
                                        VALUES (?, ?, ?, ?, ?, ?, ?)
                                    `;

                                    connection.query(
                                        sqlAsistencia,
                                        [
                                            idPracticante,
                                            datosHorario
                                                .id_horario,
                                            fechaLimpia,
                                            entradaLimpia,
                                            salidaLimpia,
                                            estado,
                                            observacionesLimpias
                                        ],
                                        (
                                            errorAsistencia,
                                            resultadoAsistencia
                                        ) => {
                                            if (
                                                errorAsistencia
                                            ) {
                                                return rollback(
                                                    500,
                                                    "Error al registrar la asistencia historica",
                                                    errorAsistencia
                                                );
                                            }

                                            const idAsistencia =
                                                resultadoAsistencia
                                                    .insertId;

                                            const descripcion =
                                                `Registro historico. Tiempo real contabilizado: ${horasReales.toFixed(
                                                    2
                                                )} h.`;

                                            const sqlHoras = `
                                                INSERT INTO registros_horas (
                                                    id_practicante,
                                                    id_asistencia,
                                                    fecha,
                                                    horas,
                                                    descripcion
                                                )
                                                VALUES (?, ?, ?, ?, ?)
                                            `;

                                            connection.query(
                                                sqlHoras,
                                                [
                                                    idPracticante,
                                                    idAsistencia,
                                                    fechaLimpia,
                                                    horasContabilizadas,
                                                    descripcion
                                                ],
                                                (
                                                    errorHoras
                                                ) => {
                                                    if (
                                                        errorHoras
                                                    ) {
                                                        return rollback(
                                                            500,
                                                            "Error al registrar las horas de la asistencia",
                                                            errorHoras
                                                        );
                                                    }

                                                    connection.commit(
                                                        (
                                                            errorCommit
                                                        ) => {
                                                            if (
                                                                errorCommit
                                                            ) {
                                                                return rollback(
                                                                    500,
                                                                    "Error al completar el registro historico",
                                                                    errorCommit
                                                                );
                                                            }

                                                            liberar();

                                                            registrarActividad(
                                                                idUsuarioAdmin,
                                                                "CREAR_ASISTENCIA_HISTORICA",
                                                                `El administrador registro una asistencia historica para el practicante ${idPracticante} con fecha ${fechaLimpia}. Estado: ${estado}. Horas: ${horasContabilizadas}`
                                                            );

                                                            return res
                                                                .status(
                                                                    201
                                                                )
                                                                .json({
                                                                    mensaje:
                                                                        "Asistencia historica registrada correctamente",
                                                                    id_asistencia:
                                                                        idAsistencia,
                                                                    dia_semana:
                                                                        diaSemana,
                                                                    estado,
                                                                    horas_reales:
                                                                        Number(
                                                                            horasReales.toFixed(
                                                                                2
                                                                            )
                                                                        ),
                                                                    horas_contabilizadas:
                                                                        horasContabilizadas
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
                }
            );
        }
    );
};

const actualizarAsistencia = (req, res) => {
    const { id } = req.params;
    const idUsuario = req.usuario.id_usuario;

    const {
        hora_entrada_real,
        hora_salida_real,
        observaciones
    } = req.body || {};

    // ==========================================
    // OBTENER ASISTENCIA Y HORARIO
    // ==========================================

    const sqlBuscar = `
        SELECT
            a.id_asistencia,
            a.id_practicante,
            a.id_horario,
            a.fecha,
            a.hora_entrada_real,
            a.hora_salida_real,
            h.hora_entrada AS hora_entrada_esperada,
            h.hora_salida AS hora_salida_esperada
        FROM asistencias a
        INNER JOIN horarios h
            ON a.id_horario = h.id_horario
        WHERE a.id_asistencia = ?
    `;

    db.query(
        sqlBuscar,
        [id],
        (errorBuscar, resultados) => {
            if (errorBuscar) {
                console.error(
                    "Error consultando asistencia:",
                    errorBuscar
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar la asistencia"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje:
                        "Asistencia no encontrada"
                });
            }

            const asistenciaActual =
                resultados[0];

            const nuevaEntrada =
                hora_entrada_real ??
                asistenciaActual.hora_entrada_real;

            const nuevaSalida =
                hora_salida_real ??
                asistenciaActual.hora_salida_real;

            // ==========================================
            // FUNCIÓN PARA CONVERTIR HORA A SEGUNDOS
            // ==========================================

            const convertirSegundos = (hora) => {
                if (!hora) {
                    return null;
                }

                const [h, m, s = 0] =
                    String(hora)
                        .split(":")
                        .map(Number);

                return (
                    h * 3600 +
                    m * 60 +
                    s
                );
            };

            // ==========================================
            // VALIDAR ENTRADA Y SALIDA
            // ==========================================

            if (
                nuevaEntrada &&
                nuevaSalida
            ) {
                const segundosEntrada =
                    convertirSegundos(
                        nuevaEntrada
                    );

                const segundosSalida =
                    convertirSegundos(
                        nuevaSalida
                    );

                if (
                    segundosSalida <=
                    segundosEntrada
                ) {
                    return res
                        .status(400)
                        .json({
                            mensaje:
                                "La hora de salida debe ser posterior a la hora de entrada"
                        });
                }
            }

            // ==========================================
            // CALCULAR ESTADO AUTOMÁTICAMENTE
            // ==========================================

            let nuevoEstado =
                "Pendiente";

            if (
                nuevaEntrada &&
                !nuevaSalida
            ) {
                const entradaReal =
                    convertirSegundos(
                        nuevaEntrada
                    );

                const entradaEsperada =
                    convertirSegundos(
                        asistenciaActual
                            .hora_entrada_esperada
                    );

                nuevoEstado =
                    entradaReal <=
                    entradaEsperada
                        ? "A tiempo"
                        : "Retardo";
            }

            if (
                nuevaEntrada &&
                nuevaSalida
            ) {
                const entradaReal =
                    convertirSegundos(
                        nuevaEntrada
                    );

                const entradaEsperada =
                    convertirSegundos(
                        asistenciaActual
                            .hora_entrada_esperada
                    );

                nuevoEstado =
                    entradaReal <=
                    entradaEsperada
                        ? "A tiempo"
                        : "Retardo";
            }

            if (
                !nuevaEntrada &&
                nuevaSalida
            ) {
                nuevoEstado =
                    "Incompleta";
            }

            // ==========================================
            // ACTUALIZAR ASISTENCIA
            // ==========================================

            const sqlActualizar = `
                UPDATE asistencias
                SET
                    hora_entrada_real =
                        COALESCE(
                            ?,
                            hora_entrada_real
                        ),

                    hora_salida_real =
                        COALESCE(
                            ?,
                            hora_salida_real
                        ),

                    estado = ?,

                    observaciones =
                        COALESCE(
                            ?,
                            observaciones
                        )

                WHERE id_asistencia = ?
            `;

            db.query(
                sqlActualizar,
                [
                    hora_entrada_real ??
                        null,

                    hora_salida_real ??
                        null,

                    nuevoEstado,

                    observaciones ??
                        null,

                    id
                ],
                (errorActualizar) => {
                    if (
                        errorActualizar
                    ) {
                        console.error(
                            "Error actualizando asistencia:",
                            errorActualizar
                        );

                        return res
                            .status(500)
                            .json({
                                mensaje:
                                    "Error al actualizar la asistencia"
                            });
                    }

                    // ==========================================
                    // RECALCULAR HORAS
                    // ==========================================

                    if (
                        nuevaEntrada &&
                        nuevaSalida
                    ) {
                        const segundosTrabajados =
                            convertirSegundos(
                                nuevaSalida
                            ) -
                            convertirSegundos(
                                nuevaEntrada
                            );

                        const horasReales =
                            segundosTrabajados /
                            3600;

                        const horasRedondeadas =
                            Number(
                                horasReales.toFixed(2)
                            );

                        const descripcion =
                            `Horas recalculadas automáticamente por corrección de asistencia. Tiempo real contabilizado: ${horasReales.toFixed(
                                2
                            )} h.`;

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
                                fecha =
                                    VALUES(fecha),

                                horas =
                                    VALUES(horas),

                                descripcion =
                                    VALUES(
                                        descripcion
                                    )
                        `;

                        db.query(
                            sqlHoras,
                            [
                                asistenciaActual
                                    .id_practicante,

                                asistenciaActual
                                    .id_asistencia,

                                asistenciaActual
                                    .fecha,

                                horasRedondeadas,

                                descripcion
                            ],
                            (
                                errorHoras
                            ) => {
                                if (
                                    errorHoras
                                ) {
                                    console.error(
                                        "Error recalculando horas:",
                                        errorHoras
                                    );

                                    return res
                                        .status(
                                            500
                                        )
                                        .json({
                                            mensaje:
                                                "La asistencia fue actualizada, pero ocurrió un error al recalcular las horas"
                                        });
                                }

                                registrarActividad(
                                    idUsuario,
                                    "ACTUALIZAR_ASISTENCIA",
                                    `El administrador actualizó la asistencia ${id}. Estado: ${nuevoEstado}. Horas recalculadas: ${horasRedondeadas}`
                                );

                                return res
                                    .status(
                                        200
                                    )
                                    .json({
                                        mensaje:
                                            "Asistencia y horas actualizadas correctamente",

                                        estado:
                                            nuevoEstado,

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

                        return;
                    }

                    // ==========================================
                    // SIN SALIDA COMPLETA
                    // ==========================================

                    registrarActividad(
                        idUsuario,
                        "ACTUALIZAR_ASISTENCIA",
                        `El administrador actualizó la asistencia ${id}. Estado: ${nuevoEstado}`
                    );

                    return res
                        .status(200)
                        .json({
                            mensaje:
                                "Asistencia actualizada correctamente",

                            estado:
                                nuevoEstado
                        });
                }
            );
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

    // ==========================================
    // OBTENER AL PRACTICANTE DUEÑO DE LA BITÁCORA
    // ==========================================

    const sqlBuscarBitacora = `
        SELECT
            b.id_bitacora,
            b.numero_semana,
            b.nombre_archivo,
            p.id_usuario
        FROM bitacoras b
        INNER JOIN practicantes p
            ON b.id_practicante = p.id_practicante
        WHERE b.id_bitacora = ?
        LIMIT 1
    `;

    db.query(
        sqlBuscarBitacora,
        [id],
        (errorBuscar, resultadosBitacora) => {
            if (errorBuscar) {
                console.error(
                    "Error consultando bitácora para revisión:",
                    errorBuscar
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar la bitácora"
                });
            }

            if (resultadosBitacora.length === 0) {
                return res.status(404).json({
                    mensaje: "Bitácora no encontrada"
                });
            }

            const bitacora =
                resultadosBitacora[0];

            // ==========================================
            // ACTUALIZAR ESTADO DE LA BITÁCORA
            // ==========================================

            const sqlActualizar = `
                UPDATE bitacoras
                SET
                    estado = ?,
                    observaciones = ?,
                    fecha_revision = NOW()
                WHERE id_bitacora = ?
            `;

            db.query(
                sqlActualizar,
                [
                    estado,
                    observaciones?.trim() || null,
                    id
                ],
                (errorActualizar, resultadoActualizar) => {
                    if (errorActualizar) {
                        console.error(
                            "Error revisando bitácora:",
                            errorActualizar
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al revisar la bitácora"
                        });
                    }

                    if (
                        resultadoActualizar.affectedRows === 0
                    ) {
                        return res.status(404).json({
                            mensaje:
                                "Bitácora no encontrada"
                        });
                    }

                    // ==========================================
                    // REGISTRAR ACTIVIDAD DEL ADMINISTRADOR
                    // ==========================================

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

                    // ==========================================
                    // CREAR NOTIFICACIÓN PARA EL PRACTICANTE
                    // ==========================================

                    const tipoNotificacion =
                        estado === "Aprobada"
                            ? "BITACORA_APROBADA"
                            : "BITACORA_RECHAZADA";

                    const tituloNotificacion =
                        estado === "Aprobada"
                            ? "Bitácora aprobada"
                            : "Bitácora rechazada";

                    let mensajeNotificacion =
                        `Tu bitácora de la semana ${bitacora.numero_semana} fue ${estado.toLowerCase()}.`;

                    if (
                        estado === "Rechazada" &&
                        observaciones?.trim()
                    ) {
                        mensajeNotificacion +=
                            ` Motivo: ${observaciones.trim()}`;
                    }

                    const sqlNotificacion = `
                        INSERT INTO notificaciones (
                            id_usuario,
                            seccion,
                            tipo,
                            titulo,
                            mensaje
                        )
                        VALUES (?, 'bitacoras', ?, ?, ?)
                    `;

                    db.query(
                        sqlNotificacion,
                        [
                            bitacora.id_usuario,
                            tipoNotificacion,
                            tituloNotificacion,
                            mensajeNotificacion
                        ],
                        (
                            errorNotificacion,
                            resultadoNotificacion
                        ) => {
                            if (errorNotificacion) {
                                console.error(
                                    "Error creando notificación para el practicante:",
                                    errorNotificacion
                                );
                            } else {
                                console.log(
                                    `Notificación ${tipoNotificacion} creada para usuario ${bitacora.id_usuario}. Filas:`,
                                    resultadoNotificacion.affectedRows
                                );
                            }

                            return res.status(200).json({
                                mensaje:
                                    `Bitácora ${estado.toLowerCase()} correctamente`
                            });
                        }
                    );
                }
            );
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
            archivo_pdf,
            nombre_archivo
        FROM bitacoras
        WHERE id_bitacora = ?
        LIMIT 1
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

        if (
            !bitacora.archivo_pdf ||
            bitacora.archivo_pdf.length === 0
        ) {
            return res.status(404).json({
                mensaje: "Archivo PDF no encontrado"
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
// OBTENER ALERTAS DEL ADMINISTRADOR
// ==========================================

const obtenerAlertasAdmin = (req, res) => {
    const sql = `
        SELECT *
        FROM (
            -- ==========================================
            -- PASARON 15 MINUTOS DE SU HORA DE ENTRADA
            -- Y TODAVÍA NO REGISTRA ASISTENCIA
            -- ==========================================
            SELECT
                'sin_entrada' AS tipo,
                'alta' AS nivel,
                1 AS prioridad,
                p.id_practicante,
                CONCAT_WS(
                    ' ',
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno
                ) AS practicante,
                c.nombre AS carrera,
                DATE_FORMAT(
                    CURDATE(),
                    '%Y-%m-%d'
                ) AS fecha,
                CONCAT(
                    'Su entrada estaba programada a las ',
                    TIME_FORMAT(
                        h.hora_entrada,
                        '%H:%i'
                    ),
                    ' y todavía no registra asistencia.'
                ) AS detalle
            FROM practicantes p
            INNER JOIN usuarios u
                ON p.id_usuario =
                    u.id_usuario
            INNER JOIN carreras c
                ON p.id_carrera =
                    c.id_carrera
            INNER JOIN horarios h
                ON h.id_practicante =
                    p.id_practicante
               AND h.activo = 1
            WHERE u.activo = 1
              AND h.dia_semana =
                    CASE DAYOFWEEK(CURDATE())
                        WHEN 1 THEN 'Domingo'
                        WHEN 2 THEN 'Lunes'
                        WHEN 3 THEN 'Martes'
                        WHEN 4 THEN 'Miércoles'
                        WHEN 5 THEN 'Jueves'
                        WHEN 6 THEN 'Viernes'
                        WHEN 7 THEN 'Sábado'
                    END
              AND CURTIME() >=
                    ADDTIME(
                        h.hora_entrada,
                        '00:15:00'
                    )
              AND NOT EXISTS (
                    SELECT 1
                    FROM asistencias a
                    WHERE a.id_practicante =
                            p.id_practicante
                      AND a.fecha = CURDATE()
                      AND a.hora_entrada_real
                            IS NOT NULL
              )

            UNION ALL

            -- ==========================================
            -- ENTRADA REGISTRADA, PERO SIN SALIDA
            -- ==========================================
            SELECT
                'sin_salida' AS tipo,
                'alta' AS nivel,
                2 AS prioridad,
                p.id_practicante,
                CONCAT_WS(
                    ' ',
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno
                ) AS practicante,
                c.nombre AS carrera,
                DATE_FORMAT(
                    a.fecha,
                    '%Y-%m-%d'
                ) AS fecha,
                CONCAT(
                    'Registró entrada a las ',
                    TIME_FORMAT(
                        a.hora_entrada_real,
                        '%H:%i'
                    ),
                    ' y todavía no registra salida.'
                ) AS detalle
            FROM asistencias a
            INNER JOIN practicantes p
                ON a.id_practicante =
                    p.id_practicante
            INNER JOIN usuarios u
                ON p.id_usuario =
                    u.id_usuario
            INNER JOIN carreras c
                ON p.id_carrera =
                    c.id_carrera
            WHERE a.fecha = CURDATE()
              AND u.activo = 1
              AND a.hora_entrada_real IS NOT NULL
              AND a.hora_salida_real IS NULL

            UNION ALL

            -- ==========================================
            -- TERMINÓ SU HORARIO Y NO REGISTRÓ
            -- ACTIVIDAD DIARIA
            -- ==========================================
            SELECT
                'sin_actividad' AS tipo,
                'media' AS nivel,
                3 AS prioridad,
                p.id_practicante,
                CONCAT_WS(
                    ' ',
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno
                ) AS practicante,
                c.nombre AS carrera,
                DATE_FORMAT(
                    CURDATE(),
                    '%Y-%m-%d'
                ) AS fecha,
                CONCAT(
                    'Terminó su horario de hoy (',
                    TIME_FORMAT(
                        h.hora_entrada,
                        '%H:%i'
                    ),
                    ' - ',
                    TIME_FORMAT(
                        h.hora_salida,
                        '%H:%i'
                    ),
                    ') y no ha registrado su actividad diaria.'
                ) AS detalle
            FROM practicantes p
            INNER JOIN usuarios u
                ON p.id_usuario =
                    u.id_usuario
            INNER JOIN carreras c
                ON p.id_carrera =
                    c.id_carrera
            INNER JOIN horarios h
                ON h.id_practicante =
                    p.id_practicante
               AND h.activo = 1
            WHERE u.activo = 1
              AND h.dia_semana =
                    CASE DAYOFWEEK(CURDATE())
                        WHEN 1 THEN 'Domingo'
                        WHEN 2 THEN 'Lunes'
                        WHEN 3 THEN 'Martes'
                        WHEN 4 THEN 'Miércoles'
                        WHEN 5 THEN 'Jueves'
                        WHEN 6 THEN 'Viernes'
                        WHEN 7 THEN 'Sábado'
                    END
              AND CURTIME() >= h.hora_salida
              AND NOT EXISTS (
                    SELECT 1
                    FROM actividades_diarias ad
                    WHERE ad.id_practicante =
                            p.id_practicante
                      AND ad.fecha = CURDATE()
              )

            UNION ALL

            -- ==========================================
            -- BITÁCORA NO ENTREGADA DESPUÉS DEL
            -- LÍMITE O ENTREGADA PENDIENTE DE REVISIÓN
            -- ==========================================
            SELECT
                'bitacora_pendiente' AS tipo,
                CASE
                    WHEN b.id_bitacora IS NULL
                         AND NOW() > ab.fecha_limite
                        THEN 'alta'
                    ELSE 'media'
                END AS nivel,
                4 AS prioridad,
                p.id_practicante,
                CONCAT_WS(
                    ' ',
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno
                ) AS practicante,
                c.nombre AS carrera,
                DATE_FORMAT(
                    ab.fecha_limite,
                    '%Y-%m-%d'
                ) AS fecha,
                CASE
                    WHEN b.id_bitacora IS NULL
                        THEN CONCAT(
                            'No entregó la bitácora de la semana ',
                            ab.numero_semana,
                            '. Fecha límite: ',
                            DATE_FORMAT(
                                ab.fecha_limite,
                                '%d/%m/%Y %H:%i'
                            ),
                            '.'
                        )
                    ELSE CONCAT(
                        'La bitácora de la semana ',
                        ab.numero_semana,
                        ' está pendiente de revisión.'
                    )
                END AS detalle
            FROM practicantes p
            INNER JOIN usuarios u
                ON p.id_usuario =
                    u.id_usuario
            INNER JOIN carreras c
                ON p.id_carrera =
                    c.id_carrera
            INNER JOIN actividades_bitacora ab
                ON ab.activa = 1
               AND CURDATE() >= ab.fecha_inicio
            LEFT JOIN bitacoras b
                ON b.id_practicante =
                    p.id_practicante
               AND b.numero_semana =
                    ab.numero_semana
            WHERE u.activo = 1
              AND (
                    (
                        b.id_bitacora IS NULL
                        AND NOW() >
                            ab.fecha_limite
                    )
                    OR b.estado = 'Pendiente'
              )

            UNION ALL

            -- ==========================================
            -- PRACTICANTE ENTRE 90% Y MENOS DE 100%
            -- DE SUS HORAS REQUERIDAS
            -- ==========================================
            SELECT
                'proximo_horas' AS tipo,
                'informativa' AS nivel,
                5 AS prioridad,
                p.id_practicante,
                CONCAT_WS(
                    ' ',
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno
                ) AS practicante,
                c.nombre AS carrera,
                DATE_FORMAT(
                    CURDATE(),
                    '%Y-%m-%d'
                ) AS fecha,
                CONCAT(
                    'Lleva ',
                    FORMAT(
                        COALESCE(
                            SUM(rh.horas),
                            0
                        ),
                        2
                    ),
                    ' de ',
                    FORMAT(
                        p.horas_requeridas,
                        2
                    ),
                    ' horas (',
                    FORMAT(
                        (
                            COALESCE(
                                SUM(rh.horas),
                                0
                            ) /
                            NULLIF(
                                p.horas_requeridas,
                                0
                            )
                        ) * 100,
                        1
                    ),
                    '%).'
                ) AS detalle
            FROM practicantes p
            INNER JOIN usuarios u
                ON p.id_usuario =
                    u.id_usuario
            INNER JOIN carreras c
                ON p.id_carrera =
                    c.id_carrera
            LEFT JOIN registros_horas rh
                ON p.id_practicante =
                    rh.id_practicante
            WHERE u.activo = 1
              AND p.horas_requeridas > 0
            GROUP BY
                p.id_practicante,
                u.nombre,
                u.apellido_paterno,
                u.apellido_materno,
                c.nombre,
                p.horas_requeridas
            HAVING
                COALESCE(
                    SUM(rh.horas),
                    0
                ) >= p.horas_requeridas * 0.90
                AND
                COALESCE(
                    SUM(rh.horas),
                    0
                ) < p.horas_requeridas
        ) alertas
        ORDER BY
            prioridad ASC,
            practicante ASC
    `;

    db.query(
        sql,
        (error, resultados) => {
            if (error) {
                console.error(
                    "Error obteniendo alertas del administrador:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar las alertas"
                });
            }

            const alertas = resultados.map(
                (alerta, indice) => ({
                    id:
                        `${alerta.tipo}-${alerta.id_practicante}-${indice}`,
                    tipo:
                        alerta.tipo,
                    nivel:
                        alerta.nivel,
                    id_practicante:
                        Number(
                            alerta.id_practicante
                        ),
                    practicante:
                        alerta.practicante,
                    carrera:
                        alerta.carrera,
                    fecha:
                        alerta.fecha,
                    mensaje:
                        alerta.detalle
                })
            );

            const resumen = alertas.reduce(
                (acumulado, alerta) => {
                    acumulado[alerta.tipo] =
                        (
                            acumulado[
                                alerta.tipo
                            ] || 0
                        ) + 1;

                    return acumulado;
                },
                {
                    sin_entrada: 0,
                    sin_salida: 0,
                    sin_actividad: 0,
                    bitacora_pendiente: 0,
                    proximo_horas: 0
                }
            );

            return res.status(200).json({
                total: alertas.length,
                resumen,
                alertas
            });
        }
    );
};

// ==========================================
// OBTENER ESTADÍSTICAS GENERALES
// DASHBOARD DEL ADMINISTRADOR
// ==========================================

const obtenerEstadisticas = (req, res) => {
    const sqlEstadisticas = `
        SELECT
            -- ==========================================
            -- PRACTICANTES
            -- ==========================================

            (
                SELECT COUNT(*)
                FROM practicantes
            ) AS total_practicantes,

            (
                SELECT COUNT(*)
                FROM practicantes p
                INNER JOIN usuarios u
                    ON p.id_usuario = u.id_usuario
                WHERE u.activo = 1
            ) AS practicantes_activos,

            (
                SELECT COUNT(*)
                FROM practicantes p
                INNER JOIN usuarios u
                    ON p.id_usuario = u.id_usuario
                WHERE u.activo = 0
            ) AS practicantes_inactivos,

            -- ==========================================
            -- HORAS
            -- ==========================================

            (
                SELECT COALESCE(SUM(rh.horas), 0)
                FROM registros_horas rh
            ) AS total_horas_registradas,

            (
                SELECT COALESCE(SUM(rh.horas), 0)
                FROM registros_horas rh
                WHERE rh.fecha = CURDATE()
            ) AS horas_registradas_hoy,

            -- ==========================================
            -- ASISTENCIAS DE HOY
            -- ==========================================

            (
                SELECT COUNT(*)
                FROM asistencias a
                WHERE a.fecha = CURDATE()
            ) AS asistencias_hoy,

            (
                SELECT COUNT(*)
                FROM asistencias a
                WHERE a.fecha = CURDATE()
                  AND a.estado = 'A tiempo'
            ) AS asistencias_a_tiempo_hoy,

            (
                SELECT COUNT(*)
                FROM asistencias a
                WHERE a.fecha = CURDATE()
                  AND a.estado = 'Retardo'
            ) AS retardos_hoy,

            (
                SELECT COUNT(*)
                FROM asistencias a
                WHERE a.fecha = CURDATE()
                  AND a.estado = 'Incompleta'
            ) AS asistencias_incompletas_hoy,

            (
                SELECT COUNT(*)
                FROM asistencias a
                WHERE a.fecha = CURDATE()
                  AND a.estado = 'Pendiente'
            ) AS asistencias_pendientes_hoy,

            -- ==========================================
            -- BITÁCORAS
            -- ==========================================

            (
                SELECT COUNT(*)
                FROM bitacoras b
                WHERE b.estado = 'Pendiente'
            ) AS bitacoras_pendientes,

            (
                SELECT COUNT(*)
                FROM bitacoras b
                WHERE b.estado = 'Aprobada'
            ) AS bitacoras_aprobadas,

            (
                SELECT COUNT(*)
                FROM bitacoras b
                WHERE b.estado = 'Rechazada'
            ) AS bitacoras_rechazadas,

            -- ==========================================
            -- CARRERAS
            -- ==========================================

            (
                SELECT COUNT(*)
                FROM carreras c
                WHERE c.activa = 1
            ) AS carreras_activas,

            -- ==========================================
            -- ACTIVIDADES DE BITÁCORA
            -- ==========================================

            (
                SELECT COUNT(*)
                FROM actividades_bitacora ab
                WHERE ab.activa = 1
            ) AS actividades_bitacora_activas
    `;

    // ==========================================
    // ACTIVIDAD DE LOS ÚLTIMOS 7 DÍAS
    // ==========================================

    const sqlUltimos7Dias = `
        WITH dias AS (
            SELECT CURDATE() AS fecha

            UNION ALL

            SELECT DATE_SUB(
                CURDATE(),
                INTERVAL 1 DAY
            )

            UNION ALL

            SELECT DATE_SUB(
                CURDATE(),
                INTERVAL 2 DAY
            )

            UNION ALL

            SELECT DATE_SUB(
                CURDATE(),
                INTERVAL 3 DAY
            )

            UNION ALL

            SELECT DATE_SUB(
                CURDATE(),
                INTERVAL 4 DAY
            )

            UNION ALL

            SELECT DATE_SUB(
                CURDATE(),
                INTERVAL 5 DAY
            )

            UNION ALL

            SELECT DATE_SUB(
                CURDATE(),
                INTERVAL 6 DAY
            )
        ),

        resumen_asistencias AS (
            SELECT
                a.fecha,

                COUNT(*) AS asistencias,

                SUM(
                    CASE
                        WHEN a.estado = 'A tiempo'
                        THEN 1
                        ELSE 0
                    END
                ) AS a_tiempo,

                SUM(
                    CASE
                        WHEN a.estado = 'Retardo'
                        THEN 1
                        ELSE 0
                    END
                ) AS retardos,

                SUM(
                    CASE
                        WHEN a.estado = 'Incompleta'
                        THEN 1
                        ELSE 0
                    END
                ) AS incompletas,

                SUM(
                    CASE
                        WHEN a.estado = 'Pendiente'
                        THEN 1
                        ELSE 0
                    END
                ) AS pendientes

            FROM asistencias a

            WHERE a.fecha BETWEEN
                DATE_SUB(
                    CURDATE(),
                    INTERVAL 6 DAY
                )
                AND CURDATE()

            GROUP BY a.fecha
        ),

        resumen_horas AS (
            SELECT
                rh.fecha,
                COALESCE(
                    SUM(rh.horas),
                    0
                ) AS horas

            FROM registros_horas rh

            WHERE rh.fecha BETWEEN
                DATE_SUB(
                    CURDATE(),
                    INTERVAL 6 DAY
                )
                AND CURDATE()

            GROUP BY rh.fecha
        )

        SELECT
            DATE_FORMAT(
                d.fecha,
                '%Y-%m-%d'
            ) AS fecha,

            COALESCE(
                ra.asistencias,
                0
            ) AS asistencias,

            COALESCE(
                ra.a_tiempo,
                0
            ) AS a_tiempo,

            COALESCE(
                ra.retardos,
                0
            ) AS retardos,

            COALESCE(
                ra.incompletas,
                0
            ) AS incompletas,

            COALESCE(
                ra.pendientes,
                0
            ) AS pendientes,

            COALESCE(
                rh.horas,
                0
            ) AS horas

        FROM dias d

        LEFT JOIN resumen_asistencias ra
            ON ra.fecha = d.fecha

        LEFT JOIN resumen_horas rh
            ON rh.fecha = d.fecha

        ORDER BY d.fecha ASC
    `;

    db.query(
        sqlEstadisticas,
        (errorEstadisticas, resultados) => {
            if (errorEstadisticas) {
                console.error(
                    "Error obteniendo estadísticas del dashboard:",
                    errorEstadisticas
                );

                return res.status(500).json({
                    mensaje:
                        "Error al consultar las estadísticas del dashboard"
                });
            }

            const datos =
                resultados[0] || {};

            const asistenciasHoy =
                Number(
                    datos.asistencias_hoy || 0
                );

            const asistenciasATiempo =
                Number(
                    datos.asistencias_a_tiempo_hoy ||
                    0
                );

            const porcentajePuntualidad =
                asistenciasHoy > 0
                    ? Number(
                          (
                              (
                                  asistenciasATiempo /
                                  asistenciasHoy
                              ) *
                              100
                          ).toFixed(2)
                      )
                    : 0;

            // ==========================================
            // CONSULTAR LOS ÚLTIMOS 7 DÍAS
            // ==========================================

            db.query(
                sqlUltimos7Dias,
                (
                    errorActividad,
                    resultadosActividad
                ) => {
                    if (errorActividad) {
                        console.error(
                            "Error obteniendo actividad de los últimos 7 días:",
                            errorActividad
                        );

                        return res.status(500).json({
                            mensaje:
                                "Error al consultar la actividad de los últimos 7 días"
                        });
                    }

                    const actividadUltimos7Dias =
                        resultadosActividad.map(
                            (registro) => ({
                                fecha:
                                    registro.fecha,

                                asistencias:
                                    Number(
                                        registro.asistencias ||
                                        0
                                    ),

                                a_tiempo:
                                    Number(
                                        registro.a_tiempo ||
                                        0
                                    ),

                                retardos:
                                    Number(
                                        registro.retardos ||
                                        0
                                    ),

                                incompletas:
                                    Number(
                                        registro.incompletas ||
                                        0
                                    ),

                                pendientes:
                                    Number(
                                        registro.pendientes ||
                                        0
                                    ),

                                horas:
                                    Number(
                                        registro.horas ||
                                        0
                                    )
                            })
                        );

                    return res.status(200).json({
                        // ==========================================
                        // PRACTICANTES
                        // ==========================================

                        total_practicantes:
                            Number(
                                datos.total_practicantes ||
                                0
                            ),

                        practicantes_activos:
                            Number(
                                datos.practicantes_activos ||
                                0
                            ),

                        practicantes_inactivos:
                            Number(
                                datos.practicantes_inactivos ||
                                0
                            ),

                        // ==========================================
                        // HORAS
                        // ==========================================

                        total_horas_registradas:
                            Number(
                                datos.total_horas_registradas ||
                                0
                            ),

                        horas_registradas_hoy:
                            Number(
                                datos.horas_registradas_hoy ||
                                0
                            ),

                        // ==========================================
                        // ASISTENCIAS DE HOY
                        // ==========================================

                        asistencias_hoy:
                            asistenciasHoy,

                        asistencias_a_tiempo_hoy:
                            asistenciasATiempo,

                        retardos_hoy:
                            Number(
                                datos.retardos_hoy ||
                                0
                            ),

                        asistencias_incompletas_hoy:
                            Number(
                                datos.asistencias_incompletas_hoy ||
                                0
                            ),

                        asistencias_pendientes_hoy:
                            Number(
                                datos.asistencias_pendientes_hoy ||
                                0
                            ),

                        porcentaje_puntualidad_hoy:
                            porcentajePuntualidad,

                        // ==========================================
                        // BITÁCORAS
                        // ==========================================

                        bitacoras_pendientes:
                            Number(
                                datos.bitacoras_pendientes ||
                                0
                            ),

                        bitacoras_aprobadas:
                            Number(
                                datos.bitacoras_aprobadas ||
                                0
                            ),

                        bitacoras_rechazadas:
                            Number(
                                datos.bitacoras_rechazadas ||
                                0
                            ),

                        // ==========================================
                        // CARRERAS
                        // ==========================================

                        carreras_activas:
                            Number(
                                datos.carreras_activas ||
                                0
                            ),

                        // ==========================================
                        // ACTIVIDADES DE BITÁCORA
                        // ==========================================

                        actividades_bitacora_activas:
                            Number(
                                datos.actividades_bitacora_activas ||
                                0
                            ),

                        // ==========================================
                        // GRÁFICA ÚLTIMOS 7 DÍAS
                        // ==========================================

                        actividad_ultimos_7_dias:
                            actividadUltimos7Dias
                    });
                }
            );
        }
    );
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

// ==========================================
// ACTUALIZAR PRACTICANTE
// ==========================================

const actualizarPracticante = (req, res) => {
    const { id } = req.params;
    const idUsuarioAdmin = req.usuario.id_usuario;

    const {
        nombre,
        apellido_paterno,
        apellido_materno,
        correo,
        matricula,
        telefono,
        universidad,
        id_carrera,
        fecha_inicio,
        fecha_fin,
        horas_requeridas
    } = req.body || {};

    if (
        nombre === undefined &&
        apellido_paterno === undefined &&
        apellido_materno === undefined &&
        correo === undefined &&
        matricula === undefined &&
        telefono === undefined &&
        universidad === undefined &&
        id_carrera === undefined &&
        fecha_inicio === undefined &&
        fecha_fin === undefined &&
        horas_requeridas === undefined
    ) {
        return res.status(400).json({
            mensaje: "Debes proporcionar al menos un dato para actualizar"
        });
    }

    const sqlBuscar = `
        SELECT id_usuario
        FROM practicantes
        WHERE id_practicante = ?
    `;

    db.query(sqlBuscar, [id], (errorBuscar, resultados) => {
        if (errorBuscar) {
            console.error(
                "Error buscando practicante:",
                errorBuscar
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

        const idUsuarioPracticante =
            resultados[0].id_usuario;

        const sqlUsuario = `
            UPDATE usuarios
            SET
                nombre = COALESCE(?, nombre),
                apellido_paterno = COALESCE(?, apellido_paterno),
                apellido_materno = COALESCE(?, apellido_materno),
                correo = COALESCE(?, correo)
            WHERE id_usuario = ?
        `;

        db.query(
            sqlUsuario,
            [
                nombre ?? null,
                apellido_paterno ?? null,
                apellido_materno ?? null,
                correo ?? null,
                idUsuarioPracticante
            ],
            (errorUsuario) => {
                if (errorUsuario) {
                    if (errorUsuario.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            mensaje: "El correo ya está registrado"
                        });
                    }

                    console.error(
                        "Error actualizando usuario:",
                        errorUsuario
                    );

                    return res.status(500).json({
                        mensaje: "Error al actualizar los datos del usuario"
                    });
                }

                const sqlPracticante = `
                    UPDATE practicantes
                    SET
                        matricula = COALESCE(?, matricula),
                        telefono = COALESCE(?, telefono),
                        universidad = COALESCE(?, universidad),
                        id_carrera = COALESCE(?, id_carrera),
                        fecha_inicio = COALESCE(?, fecha_inicio),
                        fecha_fin = COALESCE(?, fecha_fin),
                        horas_requeridas = COALESCE(?, horas_requeridas)
                    WHERE id_practicante = ?
                `;

                db.query(
                    sqlPracticante,
                    [
                        matricula ?? null,
                        telefono ?? null,
                        universidad ?? null,
                        id_carrera ?? null,
                        fecha_inicio ?? null,
                        fecha_fin ?? null,
                        horas_requeridas ?? null,
                        id
                    ],
                    (errorPracticante) => {
                        if (errorPracticante) {
                            console.error(
                                "Error actualizando practicante:",
                                errorPracticante
                            );

                            return res.status(500).json({
                                mensaje: "Error al actualizar el practicante"
                            });
                        }

                        registrarActividad(
                            idUsuarioAdmin,
                            "ACTUALIZAR_PRACTICANTE",
                            `El administrador actualizó los datos del practicante ${id}`
                        );

                        return res.status(200).json({
                            mensaje: "Practicante actualizado correctamente"
                        });
                    }
                );
            }
        );
    });
};

// ==========================================
// ELIMINAR PRACTICANTE
// SOLO SE PERMITE SI ESTÁ DESACTIVADO
// ==========================================

const eliminarPracticante = (req, res) => {
    const { id } = req.params;
    const idUsuarioAdmin = req.usuario.id_usuario;

    const sqlBuscar = `
        SELECT
            p.id_practicante,
            p.id_usuario,
            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,
            u.activo
        FROM practicantes p
        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario
        WHERE p.id_practicante = ?
    `;

    db.query(sqlBuscar, [id], (errorBuscar, resultados) => {
        if (errorBuscar) {
            console.error(
                "Error buscando practicante para eliminar:",
                errorBuscar
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

        if (Number(practicante.activo) === 1) {
            return res.status(400).json({
                mensaje:
                    "No puedes eliminar un practicante activo. Desactívalo primero."
            });
        }

        const nombrePracticante = [
            practicante.nombre,
            practicante.apellido_paterno,
            practicante.apellido_materno
        ]
            .filter(Boolean)
            .join(" ");

        const idUsuarioPracticante = practicante.id_usuario;

        db.getConnection((errorConexion, connection) => {
            if (errorConexion) {
                console.error(
                    "Error obteniendo conexión para eliminar practicante:",
                    errorConexion
                );

                return res.status(500).json({
                    mensaje: "Error al iniciar la eliminación"
                });
            }

            connection.beginTransaction((errorTransaccion) => {
                if (errorTransaccion) {
                    connection.release();

                    console.error(
                        "Error iniciando transacción:",
                        errorTransaccion
                    );

                    return res.status(500).json({
                        mensaje: "Error al iniciar la eliminación"
                    });
                }

                connection.query(
                    `
                        DELETE FROM practicantes
                        WHERE id_practicante = ?
                    `,
                    [id],
                    (errorPracticante, resultadoPracticante) => {
                        if (errorPracticante) {
                            return connection.rollback(() => {
                                connection.release();

                                console.error(
                                    "Error eliminando practicante:",
                                    errorPracticante
                                );

                                return res.status(500).json({
                                    mensaje:
                                        "Error al eliminar el practicante"
                                });
                            });
                        }

                        if (resultadoPracticante.affectedRows === 0) {
                            return connection.rollback(() => {
                                connection.release();

                                return res.status(404).json({
                                    mensaje: "Practicante no encontrado"
                                });
                            });
                        }

                        connection.query(
                            `
                                DELETE FROM usuarios
                                WHERE id_usuario = ?
                            `,
                            [idUsuarioPracticante],
                            (errorUsuario, resultadoUsuario) => {
                                if (errorUsuario) {
                                    return connection.rollback(() => {
                                        connection.release();

                                        console.error(
                                            "Error eliminando usuario del practicante:",
                                            errorUsuario
                                        );

                                        return res.status(500).json({
                                            mensaje:
                                                "Error al eliminar la cuenta del practicante"
                                        });
                                    });
                                }

                                if (resultadoUsuario.affectedRows === 0) {
                                    return connection.rollback(() => {
                                        connection.release();

                                        return res.status(500).json({
                                            mensaje:
                                                "No se encontró la cuenta de usuario asociada al practicante"
                                        });
                                    });
                                }

                                connection.commit((errorCommit) => {
                                    if (errorCommit) {
                                        return connection.rollback(() => {
                                            connection.release();

                                            console.error(
                                                "Error confirmando eliminación:",
                                                errorCommit
                                            );

                                            return res.status(500).json({
                                                mensaje:
                                                    "Error al confirmar la eliminación"
                                            });
                                        });
                                    }

                                    connection.release();

                                    registrarActividad(
                                        idUsuarioAdmin,
                                        "ELIMINAR_PRACTICANTE",
                                        `El administrador eliminó al practicante ${nombrePracticante} con ID ${id}`
                                    );

                                    return res.status(200).json({
                                        mensaje:
                                            "Practicante eliminado correctamente"
                                    });
                                });
                            }
                        );
                    }
                );
            });
        });
    });
};


// ==========================================
// ACTIVAR O DESACTIVAR PRACTICANTE
// ==========================================

const actualizarEstadoPracticante = (req, res) => {
    const { id } = req.params;
    const idUsuarioAdmin = req.usuario.id_usuario;
    const { activo } = req.body || {};

    if (
        activo !== 0 &&
        activo !== 1 &&
        activo !== false &&
        activo !== true
    ) {
        return res.status(400).json({
            mensaje: "El campo activo debe ser 1 o 0"
        });
    }

    const nuevoEstado = Number(activo);

    const sql = `
        UPDATE usuarios u
        INNER JOIN practicantes p
            ON u.id_usuario = p.id_usuario
        SET u.activo = ?
        WHERE p.id_practicante = ?
    `;

    db.query(
        sql,
        [nuevoEstado, id],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error actualizando estado del practicante:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al actualizar el estado del practicante"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje: "Practicante no encontrado"
                });
            }

            const accion =
                nuevoEstado === 1
                    ? "ACTIVAR_PRACTICANTE"
                    : "DESACTIVAR_PRACTICANTE";

            const descripcion =
                nuevoEstado === 1
                    ? `El administrador activó al practicante ${id}`
                    : `El administrador desactivó al practicante ${id}`;

            registrarActividad(
                idUsuarioAdmin,
                accion,
                descripcion
            );

            return res.status(200).json({
                mensaje:
                    nuevoEstado === 1
                        ? "Practicante activado correctamente"
                        : "Practicante desactivado correctamente",
                id_practicante: Number(id),
                activo: nuevoEstado
            });
        }
    );
};

// ==========================================
// OBTENER ACTIVIDADES DE BITÁCORA
// ==========================================

const obtenerActividadesBitacora = (req, res) => {
    const sql = `
        SELECT
            id_actividad,
            numero_semana,
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            fecha_limite,
            activa,
            fecha_creacion
        FROM actividades_bitacora
        ORDER BY numero_semana DESC, id_actividad DESC
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo actividades de bitácora:",
                error
            );

            return res.status(500).json({
                mensaje:
                    "Error al consultar las actividades de bitácora"
            });
        }

        return res.status(200).json({
            total_actividades: resultados.length,
            actividades: resultados
        });
    });
};


// ==========================================
// CREAR ACTIVIDAD DE BITÁCORA
// ==========================================

const crearActividadBitacora = (req, res) => {
    const idUsuarioAdmin = req.usuario.id_usuario;

    const {
        numero_semana,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        fecha_limite
    } = req.body || {};

    if (
        !numero_semana ||
        !titulo ||
        !descripcion ||
        !fecha_inicio ||
        !fecha_fin ||
        !fecha_limite
    ) {
        return res.status(400).json({
            mensaje:
                "Semana, título, descripción, fechas y fecha límite son obligatorios"
        });
    }

    const semana = Number(numero_semana);

    if (
        !Number.isInteger(semana) ||
        semana <= 0
    ) {
        return res.status(400).json({
            mensaje:
                "El número de semana debe ser un entero mayor a 0"
        });
    }

    const fechaInicioLimpia =
        String(fecha_inicio || "")
            .slice(0, 10);

    const fechaFinLimpia =
        String(fecha_fin || "")
            .slice(0, 10);

    if (
        fechaFinLimpia <
        fechaInicioLimpia
    ) {
        return res.status(400).json({
            mensaje:
                "La fecha de fin no puede ser anterior a la fecha de inicio"
        });
    }

    const sql = `
        INSERT INTO actividades_bitacora (
            numero_semana,
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            fecha_limite
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            semana,
            titulo.trim(),
            descripcion.trim(),
            fecha_inicio,
            fecha_fin,
            fecha_limite
        ],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error creando actividad de bitácora:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al crear la actividad de bitácora"
                });
            }

            registrarActividad(
                idUsuarioAdmin,
                "CREAR_ACTIVIDAD_BITACORA",
                `El administrador creó la actividad de bitácora de la semana ${semana}: ${titulo.trim()}`
            );

            
            // ==========================================
            // NOTIFICAR NUEVA BITÁCORA A PRACTICANTES
            // ==========================================

            const sqlNotificacion = `
                INSERT INTO notificaciones (
                    id_usuario,
                    seccion,
                    tipo,
                    titulo,
                    mensaje
                )
                SELECT
                    u.id_usuario,
                    'bitacoras',
                    'NUEVA_ACTIVIDAD_BITACORA',
                    'Nueva bitácora disponible',
                    ?
                FROM usuarios u
                INNER JOIN roles r
                    ON u.id_rol = r.id_rol
                WHERE r.nombre = 'Practicante'
                  AND u.activo = 1
            `;

            const mensajeNotificacion =
                `Se publicó la bitácora de la semana ${semana}: ${titulo.trim()}. Revisa la sección de Bitácoras para consultar las instrucciones y la fecha límite.`;

            db.query(
                sqlNotificacion,
                [mensajeNotificacion],
                (errorNotificacion, resultadoNotificacion) => {
                    if (errorNotificacion) {
                        console.error(
                            "Error creando notificación de nueva bitácora:",
                            errorNotificacion
                        );
                    } else {
                        console.log(
                            "Notificaciones de nueva bitácora creadas:",
                            resultadoNotificacion.affectedRows
                        );
                    }
                }
            );

            return res.status(201).json({
                mensaje:
                    "Actividad de bitácora creada correctamente",
                id_actividad: resultado.insertId
            });
        }
    );
};


// ==========================================
// ACTUALIZAR ACTIVIDAD DE BITÁCORA
// ==========================================

const actualizarActividadBitacora = (req, res) => {
    const { id } = req.params;
    const idUsuarioAdmin = req.usuario.id_usuario;

    const {
        numero_semana,
        titulo,
        descripcion,
        fecha_inicio,
        fecha_fin,
        fecha_limite
    } = req.body || {};

    if (
        numero_semana === undefined &&
        titulo === undefined &&
        descripcion === undefined &&
        fecha_inicio === undefined &&
        fecha_fin === undefined &&
        fecha_limite === undefined
    ) {
        return res.status(400).json({
            mensaje:
                "Debes proporcionar al menos un dato para actualizar"
        });
    }

    const sql = `
        UPDATE actividades_bitacora
        SET
            numero_semana = COALESCE(?, numero_semana),
            titulo = COALESCE(?, titulo),
            descripcion = COALESCE(?, descripcion),
            fecha_inicio = COALESCE(?, fecha_inicio),
            fecha_fin = COALESCE(?, fecha_fin),
            fecha_limite = COALESCE(?, fecha_limite)
        WHERE id_actividad = ?
    `;

    db.query(
        sql,
        [
            numero_semana ?? null,
            titulo !== undefined
                ? titulo.trim()
                : null,
            descripcion !== undefined
                ? descripcion.trim()
                : null,
            fecha_inicio ?? null,
            fecha_fin ?? null,
            fecha_limite ?? null,
            id
        ],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error actualizando actividad de bitácora:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al actualizar la actividad de bitácora"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje:
                        "Actividad de bitácora no encontrada"
                });
            }

            registrarActividad(
                idUsuarioAdmin,
                "ACTUALIZAR_ACTIVIDAD_BITACORA",
                `El administrador actualizó la actividad de bitácora ${id}`
            );

            return res.status(200).json({
                mensaje:
                    "Actividad de bitácora actualizada correctamente"
            });
        }
    );
};


// ==========================================
// ACTIVAR O DESACTIVAR ACTIVIDAD DE BITÁCORA
// ==========================================

const actualizarEstadoActividadBitacora = (req, res) => {
    const { id } = req.params;
    const idUsuarioAdmin = req.usuario.id_usuario;
    const { activa } = req.body || {};

    if (
        activa !== 0 &&
        activa !== 1 &&
        activa !== false &&
        activa !== true
    ) {
        return res.status(400).json({
            mensaje:
                "El campo activa debe ser 1 o 0"
        });
    }

    const nuevoEstado = Number(activa);

    const sql = `
        UPDATE actividades_bitacora
        SET activa = ?
        WHERE id_actividad = ?
    `;

    db.query(
        sql,
        [nuevoEstado, id],
        (error, resultado) => {
            if (error) {
                console.error(
                    "Error actualizando estado de actividad:",
                    error
                );

                return res.status(500).json({
                    mensaje:
                        "Error al actualizar el estado de la actividad"
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    mensaje:
                        "Actividad de bitácora no encontrada"
                });
            }

            registrarActividad(
                idUsuarioAdmin,
                nuevoEstado === 1
                    ? "ACTIVAR_ACTIVIDAD_BITACORA"
                    : "DESACTIVAR_ACTIVIDAD_BITACORA",
                nuevoEstado === 1
                    ? `El administrador activó la actividad de bitácora ${id}`
                    : `El administrador desactivó la actividad de bitácora ${id}`
            );

            return res.status(200).json({
                mensaje:
                    nuevoEstado === 1
                        ? "Actividad activada correctamente"
                        : "Actividad desactivada correctamente",
                id_actividad: Number(id),
                activa: nuevoEstado
            });
        }
    );
};

// ==========================================
// ELIMINAR ACTIVIDAD DE BITÁCORA
// ==========================================

const eliminarActividadBitacora = (req, res) => {
    const { id } = req.params;
    const idUsuarioAdmin = req.usuario.id_usuario;

    const idActividad = Number(id);

    if (
        !Number.isInteger(idActividad) ||
        idActividad <= 0
    ) {
        return res.status(400).json({
            mensaje:
                "El id de la actividad de bitácora es inválido"
        });
    }

    db.getConnection((errorConexion, connection) => {
        if (errorConexion) {
            console.error(
                "Error obteniendo conexión:",
                errorConexion
            );

            return res.status(500).json({
                mensaje:
                    "Error al conectar con la base de datos"
            });
        }

        connection.beginTransaction(
            (errorTransaccion) => {
                if (errorTransaccion) {
                    connection.release();

                    return res.status(500).json({
                        mensaje:
                            "Error al iniciar la eliminación de la actividad"
                    });
                }

                const rollback = (
                    status,
                    mensaje,
                    error = null
                ) => {
                    connection.rollback(() => {
                        connection.release();

                        if (error) {
                            console.error(
                                mensaje,
                                error
                            );
                        }

                        return res
                            .status(status)
                            .json({ mensaje });
                    });
                };

                connection.query(
                    `
                        SELECT id_actividad
                        FROM actividades_bitacora
                        WHERE id_actividad = ?
                        LIMIT 1
                    `,
                    [idActividad],
                    (errorActividad, actividadResultado) => {
                        if (errorActividad) {
                            return rollback(
                                500,
                                "Error al consultar la actividad de bitácora",
                                errorActividad
                            );
                        }

                        if (
                            actividadResultado.length === 0
                        ) {
                            return rollback(
                                404,
                                "Actividad de bitácora no encontrada"
                            );
                        }

                        connection.query(
                            `
                                SELECT COUNT(*) AS total
                                FROM bitacoras
                                WHERE id_actividad = ?
                            `,
                            [idActividad],
                            (
                                errorBitacoras,
                                bitacorasResultado
                            ) => {
                                if (errorBitacoras) {
                                    return rollback(
                                        500,
                                        "Error al consultar las bitácoras asociadas",
                                        errorBitacoras
                                    );
                                }

                                const totalBitacoras =
                                    Number(
                                        bitacorasResultado[0]
                                            ?.total || 0
                                    );

                                connection.query(
                                    `
                                        DELETE FROM bitacoras
                                        WHERE id_actividad = ?
                                    `,
                                    [idActividad],
                                    (errorEliminarBitacoras) => {
                                        if (
                                            errorEliminarBitacoras
                                        ) {
                                            return rollback(
                                                500,
                                                "Error al eliminar las bitácoras asociadas",
                                                errorEliminarBitacoras
                                            );
                                        }

                                        connection.query(
                                            `
                                                DELETE FROM actividades_bitacora
                                                WHERE id_actividad = ?
                                            `,
                                            [idActividad],
                                            (
                                                errorEliminarActividad,
                                                resultadoActividad
                                            ) => {
                                                if (
                                                    errorEliminarActividad
                                                ) {
                                                    return rollback(
                                                        500,
                                                        "Error al eliminar la actividad de bitácora",
                                                        errorEliminarActividad
                                                    );
                                                }

                                                if (
                                                    resultadoActividad.affectedRows ===
                                                    0
                                                ) {
                                                    return rollback(
                                                        404,
                                                        "Actividad de bitácora no encontrada"
                                                    );
                                                }

                                                connection.commit(
                                                    (errorCommit) => {
                                                        if (
                                                            errorCommit
                                                        ) {
                                                            return rollback(
                                                                500,
                                                                "Error al completar la eliminación",
                                                                errorCommit
                                                            );
                                                        }

                                                        connection.release();

                                                        registrarActividad(
                                                            idUsuarioAdmin,
                                                            "ELIMINAR_ACTIVIDAD_BITACORA",
                                                            `El administrador eliminó la actividad de bitácora ${idActividad} junto con ${totalBitacoras} entrega(s) asociada(s)`
                                                        );

                                                        return res
                                                            .status(200)
                                                            .json({
                                                                mensaje:
                                                                    "Actividad y entregas PDF eliminadas correctamente",
                                                                bitacoras_eliminadas:
                                                                    totalBitacoras
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
            }
        );
    });
};

// ==========================================
// OBTENER TODAS LAS ASISTENCIAS
// ==========================================

const obtenerAsistenciasGeneral = (req, res) => {
    const sql = `
        SELECT
            a.id_asistencia,
            a.id_practicante,
            a.fecha,

            a.hora_entrada_real,
            a.hora_salida_real,

            h.hora_entrada AS hora_entrada_esperada,
            h.hora_salida AS hora_salida_esperada,

            a.estado,
            a.observaciones,

            p.matricula,

            u.nombre,
            u.apellido_paterno,
            u.apellido_materno,

            c.nombre AS carrera,

            rh.horas AS horas_contabilizadas

        FROM asistencias a

        INNER JOIN practicantes p
            ON a.id_practicante = p.id_practicante

        INNER JOIN usuarios u
            ON p.id_usuario = u.id_usuario

        INNER JOIN horarios h
            ON a.id_horario = h.id_horario

        LEFT JOIN carreras c
            ON p.id_carrera = c.id_carrera

        LEFT JOIN registros_horas rh
            ON rh.id_asistencia = a.id_asistencia

        ORDER BY
            a.fecha DESC,
            a.id_asistencia DESC
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo asistencias generales:",
                error
            );

            return res.status(500).json({
                mensaje:
                    "Error al consultar las asistencias"
            });
        }

        const asistencias = resultados.map(
            (asistencia) => ({
                ...asistencia,

                nombre_practicante: [
                    asistencia.nombre,
                    asistencia.apellido_paterno,
                    asistencia.apellido_materno
                ]
                    .filter(Boolean)
                    .join(" "),

                horas_contabilizadas:
                    asistencia.horas_contabilizadas !== null
                        ? Number(
                              asistencia.horas_contabilizadas
                          )
                        : null
            })
        );

        return res.status(200).json({
            total_asistencias: asistencias.length,
            asistencias
        });
    });
};

// ==========================================
// CAMBIAR CONTRASEÑA DEL ADMINISTRADOR
// ==========================================

const cambiarPasswordAdmin = async (req, res) => {
    const idUsuario = req.usuario.id_usuario;

    const {
        password_actual,
        password_nueva,
        confirmar_password
    } = req.body || {};

    // Validar campos obligatorios
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

    // Confirmar nueva contraseña
    if (password_nueva !== confirmar_password) {
        return res.status(400).json({
            mensaje:
                "La nueva contraseña y su confirmación no coinciden"
        });
    }

    // Longitud mínima
    if (password_nueva.length < 8) {
        return res.status(400).json({
            mensaje:
                "La nueva contraseña debe tener al menos 8 caracteres"
        });
    }

    // Requisitos de seguridad
    const tieneMayuscula = /[A-Z]/.test(password_nueva);
    const tieneMinuscula = /[a-z]/.test(password_nueva);
    const tieneNumero = /\d/.test(password_nueva);

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
        SELECT password_hash
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
                    "Error consultando contraseña del administrador:",
                    errorBuscar
                );

                return res.status(500).json({
                    mensaje: "Error al consultar la cuenta"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: "Usuario no encontrado"
                });
            }

            try {
                const usuario = resultados[0];

                // Comprobar contraseña actual
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

                // No permitir reutilizar contraseña
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

                // Crear hash
                const nuevoHash = await bcrypt.hash(
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
                    [nuevoHash, idUsuario],
                    (errorActualizar, resultado) => {
                        if (errorActualizar) {
                            console.error(
                                "Error actualizando contraseña del administrador:",
                                errorActualizar
                            );

                            return res.status(500).json({
                                mensaje:
                                    "Error al actualizar la contraseña"
                            });
                        }

                        if (resultado.affectedRows === 0) {
                            return res.status(404).json({
                                mensaje:
                                    "Usuario no encontrado"
                            });
                        }

                        registrarActividad(
                            idUsuario,
                            "CAMBIAR_PASSWORD",
                            "El administrador actualizó su contraseña"
                        );

                        return res.status(200).json({
                            mensaje:
                                "Contraseña actualizada correctamente",
                            debe_cambiar_password: 0
                        });
                    }
                );
            } catch (errorPassword) {
                console.error(
                    "Error procesando contraseña del administrador:",
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

module.exports = {
    // Practicantes
    obtenerPracticantes,
    crearPracticanteAdmin,
    obtenerPracticantePorId,
    actualizarEstadoPracticante,
    actualizarPracticante,
    eliminarPracticante,
    obtenerAsistenciasGeneral,

    // Horarios y asistencias
    obtenerHorarioPracticante,
    obtenerAsistenciasPracticante,
    crearAsistenciaHistorica,
    actualizarAsistencia,
    crearHorarioPracticante,
    actualizarHorario,

    // Horas
    obtenerHorasPracticante,
    actualizarRegistroHoras,
    eliminarRegistroHoras,

    // Bitácoras
    obtenerBitacorasPracticante,
    revisarBitacora,
    obtenerArchivoBitacoraAdmin,

    // Carreras
    obtenerCarreras,
    crearCarrera,
    actualizarCarrera,

    // Alertas y estadísticas
    obtenerAlertasAdmin,
    obtenerEstadisticas,

    // Actividades de bitácora
    obtenerActividadesBitacora,
    crearActividadBitacora,
    actualizarActividadBitacora,
    actualizarEstadoActividadBitacora,
    eliminarActividadBitacora,

    // Historial de actividades
    obtenerHistorialActividades,

    // Administrador
    cambiarPasswordAdmin,
    crearAdministrador,
    obtenerAdministradores
    
};