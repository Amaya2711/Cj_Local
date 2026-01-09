import type { NextApiRequest, NextApiResponse } from 'next';
const sql = require('mssql');

const config = {
  user: 'sa',
  password: '7@1l6DknPRBHhtJ6eg32xss',
  server: '161.132.4.67',
  port: 1433,
  database: 'n8n_produccion',
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
    const result = await new sql.Request().execute('sp_GetPlaEvidencia');
    res.status(200).json(result.recordset || []);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  } finally {
    await sql.close();
  }
}
