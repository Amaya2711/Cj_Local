import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// Configuración de conexión SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
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
  const { idCuadrilla, pFechaIni, pFechaFin } = req.body;
  if (!idCuadrilla || !pFechaIni || !pFechaFin) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`EXEC sp_ObtenerCuadrillaAprobar @idCuadrilla = ${idCuadrilla}, @pFechaIni = ${pFechaIni}, @pFechaFin = ${pFechaFin}`;
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: 'Error ejecutando búsqueda', detalle: error });
  }
}
