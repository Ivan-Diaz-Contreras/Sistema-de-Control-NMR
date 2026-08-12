const bcrypt = require("bcrypt");
const db = require("../config/db");

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

        // Comprobar si el correo ya está registrado
        db.query(
            "SELECT id_usuario FROM usuarios WHERE correo = ?",
            [correo],
            async (error, resultados) => {
                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        mensaje: "Error al consultar la base de datos"
                    });
                }

                if (resultados.length > 0) {
                    return res.status(409).json({
                        mensaje: "El correo ya está registrado"
                    });
                }

                // Cifrar contraseña
                const passwordHash = await bcrypt.hash(password, 10);

                // Buscar el rol Practicante
                db.query(
                    "SELECT id_rol FROM roles WHERE nombre = 'Practicante'",
                    (errorRol, resultadoRol) => {
                        if (errorRol || resultadoRol.length === 0) {
                            return res.status(500).json({
                                mensaje: "No se encontró el rol Practicante"
                            });
                        }

                        const idRol = resultadoRol[0].id_rol;

                        // Crear usuario
                        const sqlUsuario = `
                            INSERT INTO usuarios
                            (
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
                                nombre,
                                apellido_paterno,
                                apellido_materno || null,
                                correo,
                                passwordHash,
                                idRol
                            ],
                            (errorUsuario, resultadoUsuario) => {
                                if (errorUsuario) {
                                    console.error(errorUsuario);

                                    return res.status(500).json({
                                        mensaje: "Error al registrar el usuario"
                                    });
                                }

                                const idUsuario = resultadoUsuario.insertId;

                                // Crear perfil del practicante
                                const sqlPracticante = `
                                    INSERT INTO practicantes
                                    (
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
                                            console.error(errorPracticante);

                                            return res.status(500).json({
                                                mensaje:
                                                    "El usuario fue creado, pero ocurrió un error al crear el perfil del practicante"
                                            });
                                        }

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
            }
        );
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
};

module.exports = {
    registrarPracticante
};