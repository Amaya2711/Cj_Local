import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

const config = {
  user: 'sa',
  password: '***', // Reemplaza por tu contraseña real
  server: '161.132.4.67',
  database: 'n8n_produccion',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { store } = req.query;

  if (store !== 'sp_GetPlaPlantilla') {
    return res.status(400).json({ error: 'Store no soportado' });
  }

  try {
    // Conexión a SQL Server
    await sql.connect(config);
    const result = await sql.query('EXEC sp_GetPlaPlantilla');
    await sql.close();
    return res.status(200).json(result.recordset);
  } catch (error) {
    await sql.close();
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error);
    return res.status(500).json({ error: errorMessage });
  }
}
