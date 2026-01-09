import { NextApiRequest, NextApiResponse } from 'next';
const sql = require('mssql');

const config = {
  user: 'sa',
  password: '7@1l6DknPRBHhtJ6eg32xss',
  server: '161.132.4.67',
  port: 1433,
  database: 'n8n_produccion',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { PlantillaID } = req.body;
  if (!PlantillaID) {
    return res.status(400).json({ error: 'Falta el parámetro PlantillaID' });
  }

  try {
    // Cerrar conexiones previas si existen
    if (sql.connected) {
      await sql.close();
    }
    await sql.connect(config);
    // Ejecutar el store con @Tipo=3 y @PlantillaID
    const request = new sql.Request();
    request.input('Tipo', sql.Int, 3);
    request.input('PlantillaID', sql.Int, PlantillaID);
    const result = await request.execute('sp_BuscarPlantilla');
    if (!result.recordset || result.recordset.length === 0) {
      await sql.close();
      return res.status(404).json({ error: 'No se encontró la plantilla' });
    }
    await sql.close();
    res.status(200).json({ data: result.recordset });
  } catch (error) {
    try { await sql.close(); } catch {}
    res.status(500).json({ error: error.message || 'Error en la base de datos' });
  }
}
