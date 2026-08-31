const ZONA_HORARIA =
    process.env.APP_TIMEZONE ||
    "America/Mexico_City";

// ==========================================
// OBTENER PARTES DE FECHA Y HORA
// ==========================================

const obtenerPartes = () => {
    const partes =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: ZONA_HORARIA,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                weekday: "long"
            }
        ).formatToParts(new Date());

    return Object.fromEntries(
        partes
            .filter(
                (parte) =>
                    parte.type !== "literal"
            )
            .map(
                (parte) => [
                    parte.type,
                    parte.value
                ]
            )
    );
};

// ==========================================
// OBTENER FECHA ACTUAL
// YYYY-MM-DD
// ==========================================

const obtenerFechaActual = () => {
    const partes = obtenerPartes();

    return [
        partes.year,
        partes.month,
        partes.day
    ].join("-");
};

// ==========================================
// OBTENER HORA ACTUAL
// HH:mm:ss
// ==========================================

const obtenerHoraActual = () => {
    const partes = obtenerPartes();

    // Algunos entornos Intl pueden devolver "24"
    // para medianoche. Para SQL usamos "00".
    const hora =
        partes.hour === "24"
            ? "00"
            : partes.hour;

    return [
        hora,
        partes.minute,
        partes.second
    ].join(":");
};

// ==========================================
// OBTENER FECHA Y HORA
// YYYY-MM-DD HH:mm:ss
// ==========================================

const obtenerFechaHoraActual = () =>
    `${obtenerFechaActual()} ${obtenerHoraActual()}`;

// ==========================================
// OBTENER DÍA DE LA SEMANA
// ==========================================

const obtenerDiaSemanaActual = () => {
    const fecha = obtenerFechaActual();
    const [anio, mes, dia] =
        fecha.split("-").map(Number);

    const fechaReferencia =
        new Date(
            Date.UTC(
                anio,
                mes - 1,
                dia,
                12,
                0,
                0
            )
        );

    const indice =
        fechaReferencia.getUTCDay();

    const dias = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    ];

    return dias[indice];
};

// ==========================================
// FORMATEAR FECHA
// DD/MM/YYYY
// ==========================================

const formatearFecha = (fecha) => {
    if (!fecha) {
        return "";
    }

    const valor =
        String(fecha).slice(0, 10);

    const [anio, mes, dia] =
        valor.split("-");

    if (!anio || !mes || !dia) {
        return valor;
    }

    return `${dia}/${mes}/${anio}`;
};

module.exports = {
    ZONA_HORARIA,
    obtenerFechaActual,
    obtenerHoraActual,
    obtenerFechaHoraActual,
    obtenerDiaSemanaActual,
    formatearFecha
};
