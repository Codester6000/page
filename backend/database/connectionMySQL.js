
import mysql from 'mysql2/promise'

export let db;

export async function conectarDB() 
{
    db = await mysql.createConnection(
        {
            host: process.env.DB_HOST_DEV,
            port:3306,
            database:process.env.DB_NAME,
            user:process.env.DB_USER_DEV,
            password:process.env.DB_PASS_DEV
        }
    )
    
}


