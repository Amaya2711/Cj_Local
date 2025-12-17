// Compatibilidad para endpoints que esperan getConnection
export async function getConnection() {
  return getPool();
}
import sql from 'mssql';
export { sql };



function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

export const MSSQL_CONFIG = {
  user: requireEnv('SQLSERVER_USER'),
  password: requireEnv('SQLSERVER_PASSWORD'),
  server: requireEnv('SQLSERVER_HOST'),
  port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433,
  database: requireEnv('SQLSERVER_DB'),
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
