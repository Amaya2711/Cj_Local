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
    // Probar el SP directamente
    const result = await new sql.Request()
      .input('Accion', sql.Int, 2)
      .execute('SP_Ubicacion');
    console.log('Conexión exitosa. Resultado SP_Ubicacion:', result.recordset);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    await sql.close();
  }
}

testConnection();
