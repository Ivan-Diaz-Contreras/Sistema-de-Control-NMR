const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: require("fs").readFileSync(
            require("path").join(
                __dirname,
                "../../database/isrgrootx1.pem"
            )
        )
    },

    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

db.getConnection((error, connection) => {
    if (error) {
        console.error(
            "Error al conectar con TiDB Cloud:",
            error.message
        );
        return;
    }

    console.log("Conectado correctamente a TiDB Cloud");

    connection.release();
});

module.exports = db;
