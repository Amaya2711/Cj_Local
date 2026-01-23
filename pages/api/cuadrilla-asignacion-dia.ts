const { sqlServerClient, sqlQuery } = require('../../lib/sqlServerClient');
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
    // Obtener parámetros desde la query
    const { idCuadrilla, pFecha } = req.query;
    if (!idCuadrilla && !pFecha) {
      res.status(400).json({ error: 'Debe enviar al menos el idCuadrilla o la fecha.' });
      return;
    }

    try {
      // Ejecutar el procedimiento solo con los parámetros que se envíen
      let result;
      if (idCuadrilla && pFecha) {
        result = await sqlQuery`EXEC sp_ObtenerCuadrillaAsignacion @idCuadrilla = ${idCuadrilla}, @pFecha = ${pFecha}`;
      } else if (idCuadrilla) {
        result = await sqlQuery`EXEC sp_ObtenerCuadrillaAsignacion @idCuadrilla = ${idCuadrilla}`;
      } else if (pFecha) {
        result = await sqlQuery`EXEC sp_ObtenerCuadrillaAsignacion @pFecha = ${pFecha}`;
      }
      res.status(200).json(result);
    } catch (err: any) {
      console.error('Error en sp_ObtenerCuadrillaAsignacion:', err);
      res.status(500).json({ error: 'Error interno del servidor', details: err.message, stack: err.stack, full: err });
    }
}

