import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
const { getTestSqlConnection } = require('../../test-sqlserver');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { Nombre, EsObligatoria } = req.body;
  if (!Nombre || typeof EsObligatoria === 'undefined') {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  try {
    const pool = await getTestSqlConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('EsObligatoria', sql.Bit, EsObligatoria)
      .execute('sp_InsertPlaEvidencia');
    const EvidenciaID = result.recordset && result.recordset[0] ? result.recordset[0].EvidenciaID : null;
    res.status(200).json({ EvidenciaID });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
}
