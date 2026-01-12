import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import config from '../../test-sqlserver';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { Nombre, Descripcion } = req.body;
  if (!Nombre) {
    return res.status(400).json({ error: 'El campo Nombre es obligatorio.' });
  }
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Descripcion', sql.NVarChar(250), Descripcion || null)
      .execute('sp_InsertPlaPlantilla');
    res.status(200).json(result.recordset && result.recordset[0] ? result.recordset[0] : { success: true });
  } catch (error: any) {
    console.error('[API] sp_InsertPlaPlantilla - Error:', error);
    res.status(500).json({ error: error.message });
  }
}
