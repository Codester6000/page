
import mysql from 'mysql2/promise'

export let db;

export async function conectarDB() 
{
    db = await mysql.createConnection(
        {
            host: 'localhost',
            port:3306,
            database:'schemamodex',
            user:'root',
            password:'root123'
        }
    )
    
}


SELECT