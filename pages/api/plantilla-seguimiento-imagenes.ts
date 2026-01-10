// pages/api/plantilla-seguimiento-imagenes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const config = {
      user: process.env.SQLSERVER_USER,
      password: process.env.SQLSERVER_PASSWORD,
      server: process.env.SQLSERVER_HOST,
      database: process.env.SQLSERVER_DB,
      port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
    await sql.connect(config);
    const result = await sql.query('SELECT * FROM PlantillaSeguimientoImagenes');
    res.status(200).json({ rows: result.recordset });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
