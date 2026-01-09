import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import config from '../../test-sqlserver';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query('EXEC sp_GetPlaSegmento');
    await sql.close();
    res.status(200).json(result.recordset);
  } catch (error: any) {
    await sql.close();
    res.status(500).json({ error: error.message });
  }
}
