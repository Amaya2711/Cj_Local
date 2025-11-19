const sql = require('mssql');

const config = {
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

async function testConnection() {
  try {
    await sql.connect(config);
    const result = await sql.query(`SELECT TOP 1 * FROM usuario`);
    console.log('Conexión exitosa. Primer registro:', result.recordset[0]);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    await sql.close();
  }
}

testConnection();
