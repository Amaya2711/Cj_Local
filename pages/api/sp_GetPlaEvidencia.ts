import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import config from '../../test-sqlserver';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    await sql.connect(config);
    // Permitir pasar parámetros desde el frontend si es necesario
    const { segmentoId } = req.body;
    const request = new sql.Request();
    if (segmentoId) {
      request.input('SegmentoID', sql.Int, segmentoId);
      const result = await request.execute('sp_GetPlaEvidencia');
      await sql.close();
      res.status(200).json(result.recordset);
    } else {
      // Si no hay parámetro, ejecuta sin parámetros
      const result = await request.execute('sp_GetPlaEvidencia');
      await sql.close();
      res.status(200).json(result.recordset);
    }
  } catch (error: any) {
    await sql.close();
    console.error('sp_GetPlaEvidencia error:', error);
    res.status(500).json({ error: error.message, details: error });
  }
}
