const verificarAdmin = (req, res, next) => {
    // verificarToken debe ejecutarse antes de este middleware
    if (!req.usuario) {
        return res.status(401).json({
            mensaje: "Usuario no autenticado"
        });
    }

    // En nuestra base de datos:
    if (req.usuario.rol !== "Administrador") {
        return res.status(403).json({
            mensaje: "No tienes permisos de administrador"
        });
    }

    next();
};

module.exports = verificarAdmin;