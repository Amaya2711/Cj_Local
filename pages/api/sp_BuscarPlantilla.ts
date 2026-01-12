import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool, sql } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { Tipo, PlantillaID, pArea } = req.body;
  // Log de entrada
  console.log('POST /api/sp_BuscarPlantilla body:', req.body);

  if (typeof Tipo === 'undefined' || typeof PlantillaID === 'undefined') {
    console.error('Faltan parámetros requeridos:', { Tipo, PlantillaID, pArea });
    return res.status(400).json({ error: 'Faltan parámetros requeridos: Tipo y PlantillaID' });
  }

  try {
    const pool = await getPool();
    const request = pool.request().input('Tipo', sql.Int, parseInt(Tipo));
    // Mostrar en consola el valor recibido
    console.log('Valor recibido en backend:', { Tipo, PlantillaID, pArea });
    // Validar y enviar PlantillaID como INT
    if (PlantillaID !== null && PlantillaID !== undefined && PlantillaID !== '') {
      const parsedPlantillaID = parseInt(PlantillaID);
      if (isNaN(parsedPlantillaID)) {
        console.error('PlantillaID no es un número válido:', PlantillaID);
        return res.status(400).json({ error: 'PlantillaID debe ser un número válido', PlantillaID });
      }
      request.input('PlantillaID', sql.Int, parsedPlantillaID);
    }
    // Si viene pArea, enviarlo como parámetro opcional y forzar a int
    if (typeof pArea !== 'undefined' && pArea !== null && pArea !== '') {
      const parsedPArea = parseInt(pArea);
      if (isNaN(parsedPArea)) {
        console.error('pArea no es un número válido:', pArea);
        return res.status(400).json({ error: 'pArea debe ser un número válido', pArea });
      }
      request.input('pArea', sql.Int, parsedPArea);
    }
    const result = await request.execute('sp_BuscarPlantilla');
    return res.status(200).json(result.recordset || []);
  } catch (err: any) {
    console.error('Error en /api/sp_BuscarPlantilla:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err && err.message ? err.message : String(err) });
  }
}
