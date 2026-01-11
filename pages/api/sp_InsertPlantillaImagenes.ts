import type { NextApiRequest, NextApiResponse } from 'next';
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
  const { PlantillaID, NodoID, SegmentoID, EvidenciaID, RutaImagen } = req.body;
  // Permitir 0 como valor válido para los IDs
  if (
    typeof PlantillaID === 'undefined' || PlantillaID === null ||
    typeof NodoID === 'undefined' || NodoID === null ||
    typeof SegmentoID === 'undefined' || SegmentoID === null ||
    typeof EvidenciaID === 'undefined' || EvidenciaID === null
  ) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  try {
    // Conectar a SQL Server
    if (!sql.pool) {
      await sql.connect(config);
    }
    const request = new sql.Request();
    request.input('PlantillaID', sql.Int, PlantillaID);
    request.input('NodoID', sql.Int, NodoID);
    request.input('SegmentoID', sql.Int, SegmentoID);
    request.input('EvidenciaID', sql.Int, EvidenciaID);
    request.input('RutaImagen', sql.NVarChar(sql.MAX), RutaImagen || '');
    const result = await request.execute('sp_InsertPlantillaImagenes');
    res.status(200).json(result.recordset || { success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
