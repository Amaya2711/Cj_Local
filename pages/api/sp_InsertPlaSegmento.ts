import type { NextApiRequest, NextApiResponse } from 'next';
const sql = require('mssql');
const { getTestSqlConnection } = require('../../test-sqlserver');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { Nombre, Orden } = req.body;
  if (!Nombre) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  try {
    const pool = await getTestSqlConnection();
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Orden', sql.Int, Orden !== undefined ? Orden : 1)
      .execute('sp_InsertPlaSegmento');
    const SegmentoID = result.recordset && result.recordset[0] ? result.recordset[0].SegmentoID : null;
    res.status(200).json({ SegmentoID });
  } catch (error: any) {
    console.error('Error en sp_InsertPlaSegmento:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
}
