const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

let pool;

const getPool = async () => {
    if (!pool) {
        pool = await sql.connect(dbConfig);
        console.log("SQL Connected");
    }
    return pool;
};

module.exports = { sql, getPool };


//PRUEBAS 
// const sql = require('mssql');
// require('dotenv').config();

// const dbConfig = {
//     user: process.env.DB_USER,          // ✅ corregido
//     password: process.env.DB_PASSWORD,
//     server: process.env.DB_SERVER,      // ✅ corregido
//     database: process.env.DB_DATABASE,
//     port: parseInt(process.env.DB_PORT),
//     options: {
//         encrypt: true,
//         trustServerCertificate: true
//     }
// };

// let pool;

// const getPool = async () => {
//     if (!pool) {
//         pool = await sql.connect(dbConfig);
//         console.log("SQL Connected");
//     }
//     return pool;
// };

// module.exports = { sql, getPool };