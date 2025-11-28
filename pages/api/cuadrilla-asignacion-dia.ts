const { sqlServerClient, querySqlServer } = require('../../lib/sqlServerClient');
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
    const { idCuadrilla } = req.query;
    if (!idCuadrilla || isNaN(Number(idCuadrilla))) {
      console.error('Parámetro idCuadrilla inválido:', idCuadrilla);
      return res.status(400).json({ error: 'Parámetro idCuadrilla inválido', value: idCuadrilla });
    }

    try {
      const sql = `EXEC sp_ObtenerCuadrillaAsignacion @idCuadrilla = ${Number(idCuadrilla)}`;
      const result = await querySqlServer(sql);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Error en sp_ObtenerCuadrillaAsignacion:', err);
      res.status(500).json({ error: 'Error interno del servidor', details: err.message, stack: err.stack, full: err });
    }
}

