import sql from 'mssql';

const config = {
  user: process.env.SQLSERVER_USER || 'sa',
  password: process.env.SQLSERVER_PASSWORD || '7@1l6DknPRBHhtJ6eg32xss',
  server: process.env.SQLSERVER_SERVER || '161.132.4.67',
  database: process.env.SQLSERVER_DATABASE || 'n8n_produccion',
  options: {
    encrypt: false, // Cambia a true si usas Azure o conexión cifrada
    trustServerCertificate: true
  },
  port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433
};

let pool: any = null;

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

async function querySqlServer(query: string) {
  const pool = await sqlServerClient();
  const result = await pool.request().query(query);
  return result.recordset;
}

export { sqlServerClient, querySqlServer, pool };

// Configuración de conexión a SQL Server
// (Eliminado: declaración duplicada de 'config')
