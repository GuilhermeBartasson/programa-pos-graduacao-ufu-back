import { Pool, PoolClient } from 'pg';
import 'dotenv/config'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('Connected to database successfuly')
});

const query = (text: string, params: any[]) => {
    return pool.query(text, params);
}

const getDbClient = async (): Promise<PoolClient> => {
    const client = await pool.connect();

    return client;
}

export default { query, getDbClient };