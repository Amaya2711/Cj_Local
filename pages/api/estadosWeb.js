
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
    const result = await sql.query('EXEC sp_EstadosWeb');
    // Validar y mapear los datos para asegurar que tengan id y nombre
    let estados = Array.isArray(result.recordset) ? result.recordset : [];
    // Si los campos son diferentes, ajusta aquí
    estados = estados.map(e => ({
      id: e.id || e.Id || e.ID || e.codigo || e.cod || '',
      nombre: e.nombre || e.Nombre || e.descripcion || e.desc || ''
    })).filter(e => e.id && e.nombre);
    if (estados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron estados en la base de datos.' });
    }
    res.status(200).json(estados);
  } catch (err) {
    console.error('Error al obtener estados:', err);
    res.status(500).json({ error: 'Error al obtener estados', details: err.message });
  } finally {
    await sql.close();
  }
}
