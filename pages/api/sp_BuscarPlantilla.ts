import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool, sql } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Tipo, Valor, PlantillaID } = req.body;
  if (typeof Tipo === 'undefined' || (typeof Valor === 'undefined' && typeof PlantillaID === 'undefined')) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos: Tipo y Valor/PlantillaID' });
  }

  try {
    const pool = await getPool();
    const request = pool.request().input('Tipo', sql.Int, Tipo);
    // Mostrar en consola el valor recibido
    console.log('Valor recibido en backend:', { Tipo, PlantillaID, Valor });
    // Usar el parámetro correcto según la consulta, y enviarlo como INT
    let idValue = typeof PlantillaID !== 'undefined' ? PlantillaID : Valor;
    if (typeof idValue !== 'undefined' && idValue !== null && idValue !== '') {
      request.input('PlantillaID', sql.Int, parseInt(idValue));
    }
    const result = await request.execute('sp_BuscarPlantilla');
    return res.status(200).json(result.recordset || []);
  } catch (err: any) {
    console.error('Error en /api/sp_BuscarPlantilla:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err && err.message ? err.message : String(err) });
  }
}
