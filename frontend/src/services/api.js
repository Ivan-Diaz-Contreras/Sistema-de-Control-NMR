const API_URL = "http://localhost:3000";

export const login = async (correo, password) => {
    const respuesta = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo,
            password
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al iniciar sesión");
    }

    return datos;
};

export const obtenerPerfil = async (token) => {
    const respuesta = await fetch(`${API_URL}/api/practicantes/perfil`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al obtener el perfil");
    }

    return datos;
};

export const obtenerAvance = async (token) => {
    const respuesta = await fetch(`${API_URL}/api/practicantes/avance`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al obtener el avance");
    }

    return datos;
};

export const obtenerHoras = async (token) => {
    const respuesta = await fetch(`${API_URL}/api/practicantes/horas`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Error al obtener las horas");
    }

    return datos;
};
