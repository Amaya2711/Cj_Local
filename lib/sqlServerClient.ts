import sql from 'mssql';

export const config = {
  user: 'sa',
  password: '7@1l6DknPRBHhtJ6eg32xss',
  server: '161.132.4.67',
  port: 1433,
  database: 'n8n_produccion',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export async function querySqlServer(query: string) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error al conectar o consultar SQL Server:', err);
    throw err;
  }
}
