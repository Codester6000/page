import {createPool} from 'mysql2/promise.js';

export const pool = createPool({
    host: 'localhost',
    port:3306,
    database:'schemamodex',
    user:'root',
    password:'root123'
})