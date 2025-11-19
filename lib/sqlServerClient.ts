import sql from 'mssql';

export const config = {
  user: 'sa',
  password: '@3IS0@ejwU4A7VOHba990',
  server: '161.132.48.29',
  port: 8966,
  database: 'JC_Db',
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
    throw err;
  }
}
