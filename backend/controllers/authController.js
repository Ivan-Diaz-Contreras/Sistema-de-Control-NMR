const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ==========================================
// REGISTRO DE PRACTICANTE
// ==========================================

const registrarPracticante = async (req, res) => {
    try {
        console.log("Entró a registrarPracticante");
        console.log(req.body);

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
        } = req.body;

        // Validar campos obligatorios
        if (
            !nombre ||
            !apellido_paterno ||
            !correo ||
            !password ||
            !id_carrera ||
            !fecha_inicio ||
            !horas_requeridas
        ) {
            return res.status(400).json({
                mensaje: "Faltan campos obligatorios"
            });
        }

        console.log("Buscando correo en la base de datos...");

        // Comprobar si el correo ya está registrado
        db.query(
            "SELECT id_usuario FROM usuarios WHERE correo = ?",
            [correo],
            async (error, resultados) => {
                console.log("Terminó consulta de correo");

                if (error) {
                    console.error("Error buscando correo:", error);

                    return res.status(500).json({
                        mensaje: "Error al consultar la base de datos"
                    });
                }

                if (resultados.length > 0) {
                    return res.status(409).json({
                        mensaje: "El correo ya está registrado"
                    });
                }

                try {
                    console.log("Generando hash de contraseña...");

                    const passwordHash = await bcrypt.hash(password, 10);

                    console.log("Hash generado correctamente");

                    // Buscar el rol Practicante
                    db.query(
                        "SELECT id_rol FROM roles WHERE nombre = 'Practicante'",
                        (errorRol, resultadoRol) => {
                            console.log("Terminó consulta del rol");

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

                            if (resultadoRol.length === 0) {
                                return res.status(500).json({
                                    mensaje:
                                        "No se encontró el rol Practicante"
                                });
                            }

                            const idRol = resultadoRol[0].id_rol;

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

                            console.log("Registrando usuario...");

                            db.query(
                                sqlUsuario,
                                [
                                    nombre,
                                    apellido_paterno,
                                    apellido_materno || null,
                                    correo,
                                    passwordHash,
                                    idRol
                                ],
                                (errorUsuario, resultadoUsuario) => {
                                    if (errorUsuario) {
                                        console.error(
                                            "Error registrando usuario:",
                                            errorUsuario
                                        );

                                        return res.status(500).json({
                                            mensaje:
                                                "Error al registrar el usuario"
                                        });
                                    }

                                    console.log(
                                        "Usuario registrado correctamente"
                                    );

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

                                    console.log(
                                        "Registrando perfil del practicante..."
                                    );

                                    db.query(
                                        sqlPracticante,
                                        [
                                            idUsuario,
                                            id_carrera,
                                            matricula || null,
                                            telefono || null,
                                            universidad || null,
                                            fecha_inicio,
                                            fecha_fin || null,
                                            horas_requeridas
                                        ],
                                        (errorPracticante) => {
                                            if (errorPracticante) {
                                                console.error(
                                                    "Error registrando practicante:",
                                                    errorPracticante
                                                );

                                                return res.status(500).json({
                                                    mensaje:
                                                        "El usuario fue creado, pero ocurrió un error al crear el perfil del practicante"
                                                });
                                            }

                                            console.log(
                                                "Practicante registrado correctamente"
                                            );

                                            return res.status(201).json({
                                                mensaje:
                                                    "Practicante registrado correctamente",
                                                id_usuario: idUsuario
                                            });
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
    } catch (error) {
        console.error("Error general en registro:", error);

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
                id_rol
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
        console.error("Error general en login:", error);

        return res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
};

// ==========================================
// EXPORTAR FUNCIONES
// ==========================================

module.exports = {
    registrarPracticante,
    login
};