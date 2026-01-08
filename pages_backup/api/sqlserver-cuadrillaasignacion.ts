import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// Configuración de conexión (ajusta según tu entorno)
const config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_HOST,
  database: process.env.SQLSERVER_DB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { id_cuadrilla, idsite, corresite, fecha, Estado, UsuarioCreacion, FechaCreacion } = req.body;
  console.log('Payload recibido:', req.body);
  if (!id_cuadrilla || !idsite || !corresite) {
    console.error('Faltan datos obligatorios:', { id_cuadrilla, idsite, corresite });
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO CuadrillaAsignacion (id_cuadrilla, idsite, corresite, fecha, Estado, UsuarioCreacion, FechaCreacion)
      VALUES (${id_cuadrilla}, ${idsite}, ${corresite}, ${fecha}, ${Estado}, ${UsuarioCreacion}, ${FechaCreacion})
    `;
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al insertar en SQL Server:', error);
    res.status(500).json({ error: 'Error al insertar en SQL Server', details: error });
  }
}