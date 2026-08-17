const verificarPracticante = (req, res, next) => {
    // verificarToken debe ejecutarse antes de este middleware
    if (!req.usuario) {
        return res.status(401).json({
            mensaje: "Usuario no autenticado"
        });
    }

    // En nuestra base de datos:
    // 1 = Practicante
    // 2 = Administrador
    if (req.usuario.id_rol !== 1) {
        return res.status(403).json({
            mensaje: "No tienes permisos de practicante"
        });
    }

    next();
};

module.exports = verificarPracticante;