import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getPool } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { usuario, latitud, altitud } = req.body;
  // Permitir 0 como valor válido para latitud/altitud
  if (!usuario || latitud === undefined || altitud === undefined) {
    return res.status(400).json({ error: 'Faltan datos requeridos', body: req.body });
  }

  try {
    const pool = await getPool();
    // Ejecutar sp_ValidarUsuario para obtener id_cuadrilla
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .execute('sp_ValidarUsuario');
    const id_cuadrilla = result.recordset[0]?.id_cuadrilla;
    if (!id_cuadrilla) {
      return res.status(404).json({ error: 'No se encontró id_cuadrilla para el usuario', usuario, recordset: result.recordset });
    }
    // Insertar en cuadrilla_coordenadas
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10); // yyyy-mm-dd
    const fecha_creacion = now.toISOString(); // yyyy-mm-ddTHH:mm:ss.sssZ
    let insertResult;
    try {
      insertResult = await pool.request()
        .input('id_cuadrilla', sql.Int, id_cuadrilla)
        .input('fecha', sql.Date, fecha)
        .input('latitud', sql.Float, latitud)
        .input('altitud', sql.Float, altitud)
        .input('usuario', sql.VarChar, usuario)
        .input('fecha_creacion', sql.DateTime, fecha_creacion)
        .query(`INSERT INTO cuadrilla_coordenadas (id_cuadrilla, fecha, latitud, altitud, usuario, fecha_creacion)
                VALUES (@id_cuadrilla, @fecha, @latitud, @altitud, @usuario, @fecha_creacion)`);
    } catch (insertError) {
      const message = insertError instanceof Error ? insertError.message : String(insertError);
      return res.status(500).json({ error: 'Error al insertar en cuadrilla_coordenadas', insertError: message, params: { id_cuadrilla, fecha, latitud, altitud, usuario, fecha_creacion } });
    }
    return res.status(200).json({ success: true, debug: { usuario, id_cuadrilla, latitud, altitud, fecha, fecha_creacion, insertResult } });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message, stack: error.stack });
    } else {
      return res.status(500).json({ error: 'Unknown error', detail: error });
    }
  }
}
