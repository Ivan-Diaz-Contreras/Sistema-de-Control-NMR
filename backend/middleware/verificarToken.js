const jwt = require("jsonwebtoken");
const db = require("../config/db");

const verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            mensaje: "Token no proporcionado"
        });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            mensaje: "Formato de token inválido"
        });
    }

    const token = partes[1];

    let datosUsuario;

    try {
        datosUsuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    } catch (error) {
        return res.status(401).json({
            mensaje: "Token inválido o expirado"
        });
    }

    const sql = `
        SELECT
            u.id_usuario,
            u.id_rol,
            u.activo,
            r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r
            ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ?
    `;

    db.query(
        sql,
        [datosUsuario.id_usuario],
        (error, resultados) => {
            if (error) {
                console.error(
                    "Error verificando estado del usuario:",
                    error
                );

                return res.status(500).json({
                    mensaje: "Error al verificar el usuario"
                });
            }

            if (resultados.length === 0) {
                return res.status(401).json({
                    mensaje: "Usuario no encontrado"
                });
            }

            const usuario = resultados[0];

            if (!usuario.activo) {
                return res.status(403).json({
                    mensaje: "Tu cuenta se encuentra desactivada"
                });
            }

            req.usuario = {
                id_usuario: usuario.id_usuario,
                id_rol: usuario.id_rol,
                rol: usuario.rol
            };

            next();
        }
    );
};

module.exports = verificarToken;