// [READ-FULL] Solicitud de lectura completa para analizar la respuesta de la API de empleados.
import { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '../../lib/sqlServerClient';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const pool = await getConnection();
    // Ejecuta el procedimiento almacenado sp_ObtenerCuadrillaAsignacion
    const result = await pool.request()
      // Puedes agregar parámetros aquí si el SP los requiere
      .execute('sp_ObtenerCuadrillaAsignacion');
    return res.status(200).json(result.recordset);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: errorMessage });
  }
}
