export const dynamic = 'force-dynamic';
import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { idEmpleado, fecha } = req.query;
  if (!idEmpleado || !fecha) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  try {
    // Ejecutar el store SP_ObtenerFechaRuta con @pidEmpleado y @pfechaBase
    const result = await sql`EXEC SP_ObtenerFechaRuta @pidEmpleado = ${idEmpleado}, @pfechaBase = ${fecha}`;
    res.status(200).json(result?.recordset || []);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Error al ejecutar el store' });
  }
}
