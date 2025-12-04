import type { NextApiRequest, NextApiResponse } from 'next';
import { getPool, sql } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { usuario, clave } = req.body;
  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('pIdUsuario', sql.NVarChar, usuario)
      .input('pClave', sql.NVarChar, clave)
      .execute('sp_ValidarUsuario');
    if (result.recordset && result.recordset.length > 0) {
      return res.status(200).json({ ok: true, usuario: result.recordset[0] });
    } else {
      return res.status(401).json({ error: 'Usuario o clave incorrectos' });
    }
  } catch (err: any) {
    console.error('Error en /api/login:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err && err.message ? err.message : String(err) });
  }
}
