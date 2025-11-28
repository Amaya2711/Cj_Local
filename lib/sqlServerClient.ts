const sql = require('mssql');

const config = {
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || 'tu_password',
  server: process.env.SQLSERVER_SERVER || '161.132.4.67',
  database: process.env.SQLSERVER_DATABASE || 'n8n_produccion',
  options: {
      encrypt: false, // Cambia a true si usas Azure o conexión cifrada
      trustServerCertificate: true
    },
    port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433
};

let pool = null;

async function sqlServerClient() {
  if (pool) {
    try {
      if (!pool.connected) await pool.connect();
      return pool;
    } catch (e) {
      pool = null;
    }
  }
  pool = await sql.connect(config);
  return pool;
}

async function querySqlServer(query) {
  const pool = await sqlServerClient();
  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { sqlServerClient, querySqlServer };
import sql from 'mssql';

// Configuración de conexión a SQL Server
const config = {
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || '7@1l6DknPRBHhtJ6eg32xss',
  server: process.env.SQLSERVER_SERVER || 'localhost',
  database: process.env.SQLSERVER_DATABASE || 'tu_base',
  options: {

    encrypt: false, // Cambia a true si usas Azure o conexión cifrada
