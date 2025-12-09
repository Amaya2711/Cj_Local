import sql from 'mssql';

const config = {
  user: process.env.SQLSERVER_USER || 'usuario',
  password: process.env.SQLSERVER_PASSWORD || 'password',
  server: process.env.SQLSERVER_HOST || 'localhost',
  port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433,
  database: process.env.SQLSERVER_DB || 'nombre_bd',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool: any;

export async function getPool() {
  if (!pool) {
    console.log('Conexión SQL Server - Parámetros:');
    console.log('user:', config.user);
    console.log('password:', config.password ? '***' : undefined);
    console.log('server:', config.server);
    console.log('database:', config.database);
    pool = await sql.connect(config);
  }
  return pool;
}

export { sql };

// Función genérica para ejecutar consultas SQL
export async function querySqlServer(query: string, params: any[] = []) {
  const pool = await getPool();
  const request = pool.request();
  // Si hay parámetros, agregarlos
  params.forEach((param) => {
    request.input(param.name, param.type, param.value);
  });
  return await request.query(query);
}

// Configuración de conexión a SQL Server
export const MSSQL_CONFIG = {
  user: process.env.DB_USER || process.env.SQLSERVER_USER || 'usuario',
  password: process.env.DB_PASSWORD || process.env.SQLSERVER_PASSWORD || 'password',
  server: process.env.DB_SERVER || process.env.SQLSERVER_HOST || 'localhost',
  database: process.env.DB_DATABASE || process.env.SQLSERVER_DB || 'nombre_bd',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : (process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};
