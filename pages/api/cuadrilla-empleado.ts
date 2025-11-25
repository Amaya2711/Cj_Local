import type { NextApiRequest, NextApiResponse } from 'next';
import { querySqlServer } from '@/lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await querySqlServer('EXEC EmpleadoCuadrilla');
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cuadrillas', details: err });
  }
}
