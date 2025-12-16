// Compatibilidad para endpoints que esperan getConnection
export async function getConnection() {
  return getPool();
}
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
let poolPromise: Promise<InstanceType<typeof sql.ConnectionPool>> | null = null;

export function getPool(): Promise<InstanceType<typeof sql.ConnectionPool>> {
  if (!poolPromise) {
    console.log('Conexión SQL Server - Parámetros:');
    console.log('user:', config.user);
    console.log('password:', config.password ? '***' : undefined);
    console.log('server:', config.server);
    console.log('database:', config.database);
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool: InstanceType<typeof sql.ConnectionPool>) => {
        pool.on('close', () => {
          poolPromise = null;
        });
        return pool;
      });
  }
  return poolPromise!;
}

export async function sqlQuery(strings: TemplateStringsArray, ...values: any[]) {
  const pool = await getPool();
  let query = strings[0];
  for (let i = 0; i < values.length; i++) {
    query += (typeof values[i] === 'string' ? `'${values[i]}'` : values[i]) + strings[i + 1];
  }
  const result = await (await pool).request().query(query);
  return result.recordset;
}
