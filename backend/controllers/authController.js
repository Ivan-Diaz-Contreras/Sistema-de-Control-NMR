const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ==========================================
// REGISTRO DE PRACTICANTE
// ==========================================

const registrarPracticante = async (req, res) => {
    try {
        const {
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            password,
            id_carrera,
            matricula,
            telefono,
            universidad,
            fecha_inicio,
            fecha_fin,
            horas_requeridas
        } = req.body || {};

        // ==========================================
        // VALIDAR CAMPOS OBLIGATORIOS
        // ==========================================

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

        if (!nombre.trim()) {
            return res.status(400).json({
                mensaje: "El nombre no puede estar vacío"
            });
        }

        if (!apellido_paterno.trim()) {
            return res.status(400).json({
                mensaje: "El apellido paterno no puede estar vacío"
            });
        }

        // ==========================================
        // VALIDAR CORREO
        // ==========================================

        const correoLimpio = correo.trim().toLowerCase();

        const formatoCorreo =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formatoCorreo.test(correoLimpio)) {
            return res.status(400).json({
                mensaje: "El correo no tiene un formato válido"
            });
        }

        // ==========================================
        // VALIDAR CONTRASEÑA
        // ==========================================

        if (password.length < 8) {
            return res.status(400).json({
                mensaje:
                    "La contraseña debe tener al menos 8 caracteres"
            });
        }

        // ==========================================
        // VALIDAR HORAS REQUERIDAS
        // ==========================================

        const horasRequeridasNumero =
            Number(horas_requeridas);

        if (
            !Number.isFinite(horasRequeridasNumero) ||
            horasRequeridasNumero <= 0
        ) {
            return res.status(400).json({
                mensaje:
                    "Las horas requeridas deben ser mayores a 0"
            });
        }

        // ==========================================
        // VALIDAR CARRERA
        // ==========================================

        const idCarrera = Number(id_carrera);

        if (
            !Number.isInteger(idCarrera) ||
            idCarrera <= 0
        ) {
            return res.status(400).json({
                mensaje: "El id de carrera es inválido"
            });
        }

        // ==========================================
        // VALIDAR FECHAS
        // ==========================================

        const validarFecha = (fecha) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                return false;
            }

            const fechaObjeto =
                new Date(`${fecha}T00:00:00`);

            if (Number.isNaN(fechaObjeto.getTime())) {
                return false;
            }

            const anio =
                fechaObjeto.getFullYear();

            const mes = String(
                fechaObjeto.getMonth() + 1
            ).padStart(2, "0");

            const dia = String(
                fechaObjeto.getDate()
            ).padStart(2, "0");

            return `${anio}-${mes}-${dia}` === fecha;
        };

        if (!validarFecha(fecha_inicio)) {
            return res.status(400).json({
                mensaje:
                    "La fecha de inicio no es válida"
            });
        }

        if (
            fecha_fin &&
            !validarFecha(fecha_fin)
        ) {
            return res.status(400).json({
                mensaje:
                    "La fecha de fin no es válida"
            });
        }

        if (fecha_fin) {
            const inicio =
                new Date(`${fecha_inicio}T00:00:00`);

            const fin =
                new Date(`${fecha_fin}T00:00:00`);

            if (fin < inicio) {
                return res.status(400).json({
                    mensaje:
                        "La fecha de fin no puede ser anterior a la fecha de inicio"
                });
            }
        }

        // ==========================================
        // VERIFICAR CARRERA ACTIVA
        // ==========================================

        db.query(
            `
                SELECT id_carrera
                FROM carreras
                WHERE id_carrera = ?
                  AND activa = 1
            `,
            [idCarrera],
            (errorCarrera, resultadoCarrera) => {
                if (errorCarrera) {
                    console.error(
                        "Error consultando carrera:",
                        errorCarrera
                    );

                    return res.status(500).json({
                        mensaje:
                            "Error al consultar la carrera"
                    });
                }

                if (resultadoCarrera.length === 0) {
                    return res.status(400).json({
                        mensaje:
                            "La carrera seleccionada no existe o está desactivada"
                    });
                }

                // ==========================================
                // VERIFICAR CORREO DUPLICADO
                // ==========================================

                db.query(
                    `
                        SELECT id_usuario
                        FROM usuarios
                        WHERE correo = ?
                    `,
                    [correoLimpio],
                    async (
                        errorCorreo,
                        resultadosCorreo
                    ) => {
                        if (errorCorreo) {
                            console.error(
                                "Error buscando correo:",
                                errorCorreo
                            );

                            return res.status(500).json({
                                mensaje:
                                    "Error al consultar la base de datos"
                            });
                        }

                        if (
                            resultadosCorreo.length > 0
                        ) {
                            return res.status(409).json({
                                mensaje:
                                    "El correo ya está registrado"
                            });
                        }

                        try {
                            const passwordHash =
                                await bcrypt.hash(
                                    password,
                                    10
                                );

                            // ==========================================
                            // BUSCAR ROL PRACTICANTE
                            // ==========================================

                            db.query(
                                `
                                    SELECT id_rol
                                    FROM roles
                                    WHERE nombre = 'Practicante'
                                `,
                                (
                                    errorRol,
                                    resultadoRol
                                ) => {
                                    if (errorRol) {
                                        console.error(
                                            "Error buscando rol:",
                                            errorRol
                                        );

                                        return res.status(500).json({
                                            mensaje:
                                                "Error al consultar el rol Practicante"
                                        });
                                    }

                                    if (
                                        resultadoRol.length === 0
                                    ) {
                                        return res.status(500).json({
                                            mensaje:
                                                "No se encontró el rol Practicante"
                                        });
                                    }

                                    const idRol =
                                        resultadoRol[0].id_rol;

                                    // ==========================================
                                    // INICIAR TRANSACCIÓN
                                    // ==========================================

                                    db.beginTransaction(
                                        (errorTransaccion) => {
                                            if (
                                                errorTransaccion
                                            ) {
                                                console.error(
                                                    "Error iniciando transacción:",
                                                    errorTransaccion
                                                );

                                                return res.status(500).json({
                                                    mensaje:
                                                        "Error al iniciar el registro"
                                                });
                                            }

                                            const sqlUsuario = `
                                                INSERT INTO usuarios (
                                                    nombre,
                                                    apellido_paterno,
                                                    apellido_materno,
                                                    correo,
                                                    password_hash,
                                                    id_rol
                                                )
                                                VALUES (?, ?, ?, ?, ?, ?)
                                            `;

                                            db.query(
                                                sqlUsuario,
                                                [
                                                    nombre.trim(),
                                                    apellido_paterno.trim(),
                                                    apellido_materno?.trim() || null,
                                                    correoLimpio,
                                                    passwordHash,
                                                    idRol
                                                ],
                                                (
                                                    errorUsuario,
                                                    resultadoUsuario
                                                ) => {
                                                    if (
                                                        errorUsuario
                                                    ) {
                                                        return db.rollback(
                                                            () => {
                                                                console.error(
                                                                    "Error registrando usuario:",
                                                                    errorUsuario
                                                                );

                                                                return res.status(500).json({
                                                                    mensaje:
                                                                        "Error al registrar el usuario"
                                                                });
                                                            }
                                                        );
                                                    }

                                                    const idUsuario =
                                                        resultadoUsuario.insertId;

                                                    const sqlPracticante = `
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
                                                    `;

                                                    db.query(
                                                        sqlPracticante,
                                                        [
                                                            idUsuario,
                                                            idCarrera,
                                                            matricula?.trim() || null,
                                                            telefono?.trim() || null,
                                                            universidad?.trim() || null,
                                                            fecha_inicio,
                                                            fecha_fin || null,
                                                            horasRequeridasNumero
                                                        ],
                                                        (
                                                            errorPracticante
                                                        ) => {
                                                            if (
                                                                errorPracticante
                                                            ) {
                                                                return db.rollback(
                                                                    () => {
                                                                        console.error(
                                                                            "Error registrando practicante:",
                                                                            errorPracticante
                                                                        );

                                                                        return res.status(500).json({
                                                                            mensaje:
                                                                                "Error al crear el perfil del practicante"
                                                                        });
                                                                    }
                                                                );
                                                            }

                                                            db.commit(
                                                                (
                                                                    errorCommit
                                                                ) => {
                                                                    if (
                                                                        errorCommit
                                                                    ) {
                                                                        return db.rollback(
                                                                            () => {
                                                                                console.error(
                                                                                    "Error confirmando registro:",
                                                                                    errorCommit
                                                                                );

                                                                                return res.status(500).json({
                                                                                    mensaje:
                                                                                        "Error al completar el registro"
                                                                                });
                                                                            }
                                                                        );
                                                                    }

                                                                    return res.status(201).json({
                                                                        mensaje:
                                                                            "Practicante registrado correctamente",
                                                                        id_usuario:
                                                                            idUsuario
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
                        } catch (errorHash) {
                            console.error(
                                "Error generando hash:",
                                errorHash
                            );

                            return res.status(500).json({
                                mensaje:
                                    "Error al procesar la contraseña"
                            });
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error(
            "Error general en registro:",
            error
        );

        return res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
};

// ==========================================
// LOGIN DE USUARIO
// ==========================================

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                mensaje: "Correo y contraseña son obligatorios"
            });
        }

        const sql = `
            SELECT
                id_usuario,
                nombre,
                apellido_paterno,
                apellido_materno,
                correo,
                password_hash,
                id_rol,
                activo
            FROM usuarios
            WHERE correo = ?
        `;

        db.query(sql, [correo], async (error, resultados) => {
            if (error) {
                console.error(
                    "Error consultando usuario:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al consultar la base de datos"
                });
            }

            if (resultados.length === 0) {
                return res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos"
                });
            }

            const usuario = resultados[0];

            const passwordCorrecta = await bcrypt.compare(
                password,
                usuario.password_hash
            );

            if (!passwordCorrecta) {
                return res.status(401).json({
                    mensaje: "Correo o contraseña incorrectos"
                });
            }

            // Verificar si la cuenta está activa
            if (!usuario.activo) {
                return res.status(403).json({
                    mensaje: "Tu cuenta se encuentra desactivada"
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                {
                    id_usuario: usuario.id_usuario,
                    id_rol: usuario.id_rol
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );

            return res.status(200).json({
                mensaje: "Inicio de sesión exitoso",
                token: token,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido_paterno: usuario.apellido_paterno,
                    apellido_materno: usuario.apellido_materno,
                    correo: usuario.correo,
                    id_rol: usuario.id_rol
                }
            });
        });
    } catch (error) {
        console.error(
            "Error general en login:",
            error
        );

        return res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
};

// ==========================================
// OBTENER CARRERAS ACTIVAS
// ==========================================

const obtenerCarrerasActivas = (req, res) => {
    const sql = `
        SELECT
            id_carrera,
            nombre,
            descripcion
        FROM carreras
        WHERE activa = 1
        ORDER BY nombre ASC
    `;

    db.query(sql, (error, resultados) => {
        if (error) {
            console.error(
                "Error obteniendo carreras activas:",
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
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
    registrarPracticante,
    login,
    obtenerCarrerasActivas
};