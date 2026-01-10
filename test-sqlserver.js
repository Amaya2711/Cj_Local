const sql = require('mssql');

const config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_HOST,
  port: 1433,
  database: process.env.SQLSERVER_DB,
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
