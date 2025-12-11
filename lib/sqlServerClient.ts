

import sql from 'mssql';
export { sql };


export const MSSQL_CONFIG = {
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


const config = MSSQL_CONFIG;
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

export async function sqlQuery(strings: TemplateStringsArray, ...values: any[]) {
  const pool = await getPool();
  let query = strings[0];
  for (let i = 0; i < values.length; i++) {
    query += (typeof values[i] === 'string' ? `'${values[i]}'` : values[i]) + strings[i + 1];
  }
  const result = await pool.request().query(query);
  return result.recordset;
}
// (removed duplicate config)
