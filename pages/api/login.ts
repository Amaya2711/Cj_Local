import type { NextApiRequest, NextApiResponse } from 'next';
import { querySqlServer, sql } from '../../lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { usuario, clave } = req.body;
  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const result = await querySqlServer(
      'SELECT * FROM USUARIO WHERE IdUsuario = @usuario AND Clave = @clave',
      [
        { name: 'usuario', type: sql.NVarChar, value: usuario },
        { name: 'clave', type: sql.NVarChar, value: clave }
      ]
    );
    if (result.recordset && result.recordset.length > 0) {
      return res.status(200).json({ ok: true, usuario: result.recordset[0] });
    } else {
      return res.status(401).json({ error: 'Usuario o clave incorrectos' });
    }
  } catch (err) {
    console.error('Error en /api/login:', err);
    return res.status(500).json({ error: 'Error en el servidor', details: err?.message || err });
  }
}
