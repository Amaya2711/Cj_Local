import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// Configuración de la conexión a SQL Server (ajusta estos valores a tu entorno)
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { EvidenciaID } = req.body;
  if (!EvidenciaID) {
    return res.status(400).json({ error: 'EvidenciaID es requerido' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`EXEC sp_EliminarEvidencia @pEvidenciaID = ${EvidenciaID}`;
    const mensaje = result.recordset && result.recordset[0] && result.recordset[0].Mensaje;
    if (mensaje && mensaje.includes('No se puede eliminar')) {
      return res.status(400).json({ error: mensaje });
    }
    return res.status(200).json({ mensaje: mensaje || 'Registro eliminado' });
  } catch (error) {
    return res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
}
