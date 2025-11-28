const { querySqlServer } = require('../../lib/sqlServerClient');

export default async function handler(req, res) {
  try {
    // Ejecuta el stored procedure Asignacion_Sites
    const result = await querySqlServer('EXEC Asignacion_Sites');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar sites.' });
  }
}
