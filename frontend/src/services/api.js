const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

// ==========================================
// PROCESAR RESPUESTA
// ==========================================

const procesarRespuesta = async (respuesta) => {
    const texto = await respuesta.text();

    let datos = {};

    if (texto) {
        try {
            datos = JSON.parse(texto);
        } catch (error) {
            console.error(
                "La respuesta del servidor no es JSON:",
                texto
            );

            throw new Error(
                "El servidor devolvió una respuesta inválida"
            );
        }
    }

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            `Error del servidor (${respuesta.status})`
        );
    }

    return datos;
};

// ==========================================
// LOGIN
// ==========================================

export const login = async (correo, password) => {
    const respuesta = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                password
            })
        }
    );

    return procesarRespuesta(respuesta);
};

// ==========================================
// OBTENER PERFIL
// ==========================================

export const obtenerPerfil = async (token) => {
    const respuesta = await fetch(
        `${API_URL}/api/practicantes/perfil`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return procesarRespuesta(respuesta);
};

// ==========================================
// OBTENER AVANCE
// ==========================================

export const obtenerAvance = async (token) => {
    const respuesta = await fetch(
        `${API_URL}/api/practicantes/avance`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return procesarRespuesta(respuesta);
};

// ==========================================
// OBTENER HORAS
// ==========================================

export const obtenerHoras = async (token) => {
    const respuesta = await fetch(
        `${API_URL}/api/practicantes/horas`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return procesarRespuesta(respuesta);
};