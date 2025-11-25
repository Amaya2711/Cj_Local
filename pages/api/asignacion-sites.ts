import type { NextApiRequest, NextApiResponse } from 'next';
import { querySqlServer } from '@/lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await querySqlServer('EXEC AsignacionSites');
    console.log('Resultado AsignacionSites:', result);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error en /api/asignacion-sites:', err);
    res.status(500).json({ error: 'Error al obtener sites', details: err });
  }
}
