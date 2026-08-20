const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const DB_TIMEZONE =
    process.env.DB_TIMEZONE || "-06:00";

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(
            path.join(
                __dirname,
                "../../database/isrgrootx1.pem"
            )
        )
    },

    // Evita que mysql2 convierta automáticamente
    // las fechas a objetos Date de JavaScript.
    dateStrings: true,

    timezone: DB_TIMEZONE,

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Cada conexión nueva utiliza el horario local
// del sistema NMR. Esto afecta NOW(), CURDATE()
// y la conversión de columnas TIMESTAMP.
db.on("connection", (connection) => {
    connection.query(
        "SET time_zone = ?",
        [DB_TIMEZONE],
        (error) => {
            if (error) {
                console.error(
                    "No se pudo configurar la zona horaria de TiDB:",
                    error.message
                );
            }
        }
    );
});

db.getConnection((error, connection) => {
    if (error) {
        console.error(
            "Error al conectar con TiDB Cloud:",
            error.message
        );
        return;
    }

    connection.query(
        `
            SELECT
                NOW() AS hora_tidb,
                @@session.time_zone AS zona_horaria
        `,
        (errorZona, resultados) => {
            if (errorZona) {
                console.error(
                    "Error verificando zona horaria:",
                    errorZona.message
                );
            } else {
                console.log(
                    "Conectado correctamente a TiDB Cloud"
                );

                console.log(
                    "Zona horaria TiDB:",
                    resultados[0]?.zona_horaria
                );

                console.log(
                    "Hora TiDB:",
                    resultados[0]?.hora_tidb
                );
            }

            connection.release();
        }
    );
});

module.exports = db;