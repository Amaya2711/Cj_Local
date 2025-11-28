import type { NextApiRequest, NextApiResponse } from 'next';
import { obtenerAsignacionesDia } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const data = await obtenerAsignacionesDia();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener asignaciones', detail: (err as Error).message });
  }
}

