import { ConnectionPool } from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_DATABASE || '',
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
  port: parseInt(process.env.DB_PORT || '1433', 10),
};

if (!dbConfig.user || !dbConfig.password || !dbConfig.server || !dbConfig.database) {
  throw new Error('Missing required environment variables for database connection');
}

let pool: ConnectionPool;

export const getConnection = async (): Promise<ConnectionPool> => {
  if (!pool) {
    pool = await new ConnectionPool(dbConfig).connect();
  }
  return pool;
};
