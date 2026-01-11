import { NextApiRequest, NextApiResponse } from 'next';
import { getPool, sql } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const pool = await getPool();
    // Permitir pasar parámetros desde el frontend si es necesario
    const { segmentoId } = req.body;
    const request = pool.request();
    if (segmentoId) {
      request.input('SegmentoID', sql.Int, segmentoId);
    }
    const result = await request.execute('sp_GetPlaEvidencia');
    res.status(200).json(result.recordset);
  } catch (error: any) {
    console.error('sp_GetPlaEvidencia error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
}
