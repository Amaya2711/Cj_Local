const sql = require('mssql');
const { getTestSqlConnection } = require('../../test-sqlserver');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { asignaciones, usuario, crearSeguimiento } = req.body;
  if (!Array.isArray(asignaciones) || !usuario || !crearSeguimiento) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  try {
    const pool = await getTestSqlConnection();
    for (const registro of asignaciones) {
      // Extraer parámetros
      const PlantillaID = registro.plantillaid || registro.PlantillaID;
      const IdUsuario = usuario;
      const FechaRegistro = registro.fecha || null;
      // Id_Auto debe generarse o recibirse según lógica previa
      // Aquí se asume que se genera automáticamente (puedes ajustar según tu lógica)
      const Id_Auto = registro.Id_Auto || null;
      // Ejecutar el procedimiento almacenado con el nuevo parámetro
      await pool.request()
        .input('PlantillaID', sql.Int, PlantillaID)
        .input('Id_Auto', sql.Int, Id_Auto)
        .input('IdUsuario', sql.NVarChar(15), IdUsuario)
        .input('FechaRegistro', sql.DateTime, FechaRegistro)
        .execute('SP_InsertarPlantillaSeguimientoImagenes');
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
