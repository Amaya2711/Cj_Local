import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// Configuración de conexión SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query('EXEC [EmpleadoCuadrilla]');
    // Se espera que el store devuelva una lista de empleados con id y nombre
    const empleados = result.recordset.map((row: any) => ({
      id: row.id || row.ID || row.IdEmpleado || row.id_empleado,
      nombre: row.nombre || row.Nombre || row.Empleado || row.nombre_empleado,
    }));
    res.status(200).json({ empleados });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados', detalle: error });
  }
}
