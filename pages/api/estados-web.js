// Endpoint real para /api/estados-web usando SQL Server y sp_EstadosWeb
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

export default async function handler(req, res) {
  try {
    await sql.connect(config);
    // Ejecutar el procedimiento almacenado
    const result = await sql.request().execute('sp_EstadosWeb');
    // Suponiendo que el SP retorna columnas id y nombre
    // Mapear correlativo -> id y valorini -> nombre
    const estados = result.recordset.map(row => ({
      id: row.correlativo?.toString() ?? '',
      nombre: row.valorini ?? ''
    }));
    res.status(200).json(estados);
  } catch (err) {
    console.error('Error en /api/estados-web:', err);
    res.status(500).json({ error: 'Error al obtener estados', details: err.message });
  } finally {
    await sql.close();
  }
}
