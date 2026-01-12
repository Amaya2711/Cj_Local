
import type { NextApiRequest, NextApiResponse } from 'next';
const sql = require('mssql');
const { getTestSqlConnection } = require('../../test-sqlserver');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const pool = await getTestSqlConnection();
    const result = await pool.request().query('EXEC sp_GetPlaSegmento');
    res.status(200).json(result.recordset);
  } catch (error: any) {
    console.error('Error en sp_GetPlaSegmento:', error);
    res.status(500).json({ error: error.message || 'Error en el servidor' });
  }
}
