import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

const config = {
  user: 'sa',
  password: '***',
  server: '161.132.4.67',
  database: 'n8n_produccion',
  options: { encrypt: false, trustServerCertificate: true },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await sql.connect(config);
    const result = await sql.query('EXEC sp_GetPlaEvidencia');
    await sql.close();
    return res.status(200).json(result.recordset);
  } catch (error) {
    await sql.close();
    return res.status(500).json({ error: error.message });
  }
}
