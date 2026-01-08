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
  },
  requestTimeout: 60000 // 60 segundos
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const accion = req.query.accion || req.query.Accion || 2;
    try {
      await sql.connect(config);
      // Ejecutar el store SP_Ubicacion con @Accion=2
      const result = await new sql.Request()
        .input('Accion', sql.Int, parseInt(accion as string, 10))
        .execute('SP_Ubicacion');
      // Normalizar el nombre del campo para el frontend (usar Nombreubicacion con i minúscula)
      const ubicaciones = (result.recordset || []).map((row: any) => ({
        ...row,
        Nombreubicacion: row.Nombreubicacion || row.nombreubicacion || row.nombreUbicacion || row.NOMBREUBICACION || '',
      }));
      res.status(200).json(ubicaciones);
    } catch (err) {
      // Logging detallado en consola
      console.error('Error en /api/ubicacion:', err);
      res.status(500).json({ error: 'Error al obtener ubicaciones', details: err && err.message ? err.message : String(err) });
    } finally {
      await sql.close();
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
