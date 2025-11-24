const sql = require('mssql');

const config = {
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
