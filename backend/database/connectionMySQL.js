import mysql from 'mysql2/promise';

export let db;

export async function conectarDB() {
    db = await mysql.createPool({
        host: process.env.DB_HOST_DEV,
        port: 3306,
        database: process.env.DB_NAME,
        user: process.env.DB_USER_DEV,
        password: process.env.DB_PASS_DEV,
        waitForConnections: true,
        connectionLimit: 10, // Número máximo de conexiones en el pool
        queueLimit: 0       // Sin límite para la cola de solicitudes
    });

    console.log('Base de datos conectada');
}

