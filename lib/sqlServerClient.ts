import sql from 'mssql';

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
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
// (Eliminado: declaración duplicada de 'config')
