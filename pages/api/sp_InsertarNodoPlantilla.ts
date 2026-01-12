import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool, sql } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { PlantillaID, NodoID, IdUsuario } = req.body;
  if (
    typeof PlantillaID === 'undefined' || PlantillaID === null || PlantillaID === '' ||
    typeof NodoID === 'undefined' || NodoID === null || NodoID === '' ||
    typeof IdUsuario === 'undefined' || IdUsuario === null || IdUsuario === ''
  ) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: PlantillaID, NodoID, IdUsuario' });
  }

  try {
    const pool = await getPool();
    const request = pool.request()
      .input('PlantillaID', sql.Int, parseInt(PlantillaID))
      .input('NodoID', sql.Int, parseInt(NodoID))
      .input('IdUsuario', sql.VarChar(50), IdUsuario);
    const result = await request.execute('SP_InsertarNodoPlantilla');
    return res.status(200).json(result.recordset || { success: true });
  } catch (err: any) {
    console.error('Error en /api/sp_InsertarNodoPlantilla:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err && err.message ? err.message : String(err) });
  }
}
