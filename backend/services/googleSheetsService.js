const { google } = require("googleapis");
const path = require("path");

require("dotenv").config();

const SPREADSHEET_ID =
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const NOMBRE_HOJA = "Actividades";

const RUTA_CREDENCIALES = path.join(
    __dirname,
    "../credentials/google-service-account.json"
);

const auth = new google.auth.GoogleAuth({
    keyFile: RUTA_CREDENCIALES,
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]
});

// ==========================================
// FORMATEAR ID
// ==========================================

const formatearId = (idActividad) => {
    return String(
        Number(idActividad)
    ).padStart(4, "0");
};

// ==========================================
// FORMATEAR FECHA
// ==========================================

const formatearFecha = (fecha) => {
    const valor = String(
        fecha || ""
    ).slice(0, 10);

    const partes = valor.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const [anio, mes, dia] = partes;

    if (
        !anio ||
        !mes ||
        !dia
    ) {
        return valor;
    }

    return `${dia}/${mes}/${anio}`;
};

// ==========================================
// OBTENER CLIENTE DE GOOGLE SHEETS
// ==========================================

const obtenerClienteSheets = async () => {
    if (!SPREADSHEET_ID) {
        throw new Error(
            "GOOGLE_SHEETS_SPREADSHEET_ID no está definido"
        );
    }

    const clienteAuth =
        await auth.getClient();

    return google.sheets({
        version: "v4",
        auth: clienteAuth
    });
};

// ==========================================
// OBTENER FILA POR ID DE ACTIVIDAD
// ==========================================

const obtenerNumeroFilaPorId = async (
    sheets,
    idActividad
) => {
    const response =
        await sheets.spreadsheets.values.get({
            spreadsheetId:
                SPREADSHEET_ID,
            range:
                `${NOMBRE_HOJA}!A2:A`
        });

    const filas =
        response.data.values || [];

    const idBuscado =
        Number(idActividad);

    const indice = filas.findIndex(
        (fila) => {
            const valorFila = String(
                fila?.[0] ?? ""
            )
                .trim()
                .replace(/^'/, "");

            return (
                Number(valorFila) ===
                idBuscado
            );
        }
    );

    if (indice === -1) {
        return null;
    }

    // A2 corresponde al índice 0.
    return indice + 2;
};

// ==========================================
// OBTENER SHEET ID DE LA PESTAÑA
// ==========================================

const obtenerSheetId = async (
    sheets
) => {
    const response =
        await sheets.spreadsheets.get({
            spreadsheetId:
                SPREADSHEET_ID,
            fields:
                "sheets.properties"
        });

    const hoja =
        response.data.sheets?.find(
            (item) =>
                item.properties?.title ===
                NOMBRE_HOJA
        );

    if (!hoja) {
        throw new Error(
            `No existe la hoja "${NOMBRE_HOJA}"`
        );
    }

    return hoja.properties.sheetId;
};

// ==========================================
// CREAR ARREGLO DE VALORES
// ==========================================

const crearValoresActividad = ({
    id_actividad_diaria,
    fecha,
    empresa,
    nombre,
    matricula,
    carrera,
    horario,
    actividad
}) => {
    return [
        [
            formatearId(
                id_actividad_diaria
            ),
            formatearFecha(fecha),
            empresa || "",
            nombre || "",
            matricula || "",
            carrera || "",
            horario || "",
            actividad || ""
        ]
    ];
};

// ==========================================
// AGREGAR FILA
// ==========================================

const agregarFilaActividad = async ({
    id_actividad_diaria,
    fecha,
    empresa,
    nombre,
    matricula,
    carrera,
    horario,
    actividad
}) => {
    const sheets =
        await obtenerClienteSheets();

    // Protección contra duplicados:
    // si el ID ya existe, actualizamos esa fila
    // en lugar de insertar una nueva.
    const numeroFila =
        await obtenerNumeroFilaPorId(
            sheets,
            id_actividad_diaria
        );

    if (numeroFila) {
        const valores =
            crearValoresActividad({
                id_actividad_diaria,
                fecha,
                empresa,
                nombre,
                matricula,
                carrera,
                horario,
                actividad
            });

        const response =
            await sheets.spreadsheets.values.update({
                spreadsheetId:
                    SPREADSHEET_ID,

                range:
                    `${NOMBRE_HOJA}!A${numeroFila}:H${numeroFila}`,

                // RAW evita que Google convierta
                // 0001 en 1 o en una fecha.
                valueInputOption:
                    "RAW",

                requestBody: {
                    values: valores
                }
            });

        return {
            ...response.data,
            accion:
                "actualizada_existente"
        };
    }

    const valores =
        crearValoresActividad({
            id_actividad_diaria,
            fecha,
            empresa,
            nombre,
            matricula,
            carrera,
            horario,
            actividad
        });

    const response =
        await sheets.spreadsheets.values.append({
            spreadsheetId:
                SPREADSHEET_ID,

            range:
                `${NOMBRE_HOJA}!A:H`,

            // RAW conserva exactamente
            // 0001 y 25/08/2026.
            valueInputOption:
                "RAW",

            insertDataOption:
                "INSERT_ROWS",

            requestBody: {
                values: valores
            }
        });

    return {
        ...response.data,
        accion:
            "agregada"
    };
};

// ==========================================
// ACTUALIZAR FILA EXISTENTE
// ==========================================

const actualizarFilaActividad = async ({
    id_actividad_diaria,
    fecha,
    empresa,
    nombre,
    matricula,
    carrera,
    horario,
    actividad
}) => {
    const sheets =
        await obtenerClienteSheets();

    const numeroFila =
        await obtenerNumeroFilaPorId(
            sheets,
            id_actividad_diaria
        );

    // Si no existe en Sheets, la agregamos.
    // agregarFilaActividad volverá a comprobar
    // el ID antes de insertar.
    if (!numeroFila) {
        return agregarFilaActividad({
            id_actividad_diaria,
            fecha,
            empresa,
            nombre,
            matricula,
            carrera,
            horario,
            actividad
        });
    }

    const valores =
        crearValoresActividad({
            id_actividad_diaria,
            fecha,
            empresa,
            nombre,
            matricula,
            carrera,
            horario,
            actividad
        });

    const response =
        await sheets.spreadsheets.values.update({
            spreadsheetId:
                SPREADSHEET_ID,

            range:
                `${NOMBRE_HOJA}!A${numeroFila}:H${numeroFila}`,

            valueInputOption:
                "RAW",

            requestBody: {
                values: valores
            }
        });

    return {
        ...response.data,
        accion:
            "actualizada"
    };
};

// ==========================================
// ELIMINAR FILA
// ==========================================

const eliminarFilaActividad = async (
    idActividad
) => {
    const sheets =
        await obtenerClienteSheets();

    const numeroFila =
        await obtenerNumeroFilaPorId(
            sheets,
            idActividad
        );

    if (!numeroFila) {
        return {
            eliminada: false,
            motivo:
                "La actividad no existe en Google Sheets"
        };
    }

    const sheetId =
        await obtenerSheetId(sheets);

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId:
            SPREADSHEET_ID,

        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension:
                                "ROWS",

                            // Google usa índices desde 0.
                            // Ejemplo:
                            // fila 2 -> startIndex 1
                            startIndex:
                                numeroFila - 1,

                            endIndex:
                                numeroFila
                        }
                    }
                }
            ]
        }
    });

    return {
        eliminada: true,
        fila: numeroFila
    };
};

// ==========================================
// COMPROBAR SI EXISTE UNA ACTIVIDAD
// ==========================================

const existeActividadEnSheets = async (
    idActividad
) => {
    const sheets =
        await obtenerClienteSheets();

    const numeroFila =
        await obtenerNumeroFilaPorId(
            sheets,
            idActividad
        );

    return Boolean(numeroFila);
};

module.exports = {
    agregarFilaActividad,
    actualizarFilaActividad,
    eliminarFilaActividad,
    existeActividadEnSheets
};