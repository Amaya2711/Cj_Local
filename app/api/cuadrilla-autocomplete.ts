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

// Eliminar el archivo antiguo de API para evitar confusión y duplicidad
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { q } = req.query;
//   if (!q || typeof q !== 'string' || q.length < 2) {
//     return res.status(400).json([]);
//   }
//   try {
//     await sql.connect(config);
//     const result = await sql.query`EXEC EmpleadoCuadrilla @busqueda = ${q}`;
//     // Suponiendo que el SP retorna id y nombre
//     const cuadrillas = result.recordset.map((row: any) => ({
//       id: row.id || row.Id || row.ID,
//       nombre: row.nombre || row.Nombre || row.NOMBRE,
//     }));
//     res.status(200).json(cuadrillas);
//   } catch (error) {
//     res.status(500).json({ error: 'Error consultando cuadrillas', detalle: error });
//   }
// }
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.status(400).json([]);
  }
  try {
    await sql.connect(config);
    const result = await sql.query`EXEC EmpleadoCuadrilla @busqueda = ${q}`;
    // Suponiendo que el SP retorna id y nombre
    const cuadrillas = result.recordset.map((row: any) => ({
      id: row.id || row.Id || row.ID,
      nombre: row.nombre || row.Nombre || row.NOMBRE,
    }));
    res.status(200).json(cuadrillas);
  } catch (error) {
    res.status(500).json({ error: 'Error consultando cuadrillas', detalle: error });
  }
}
