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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario } = req.body;
  if (!NodoID || !PlantillaID || !SegmentoID || !EvidenciaID || !RutaImagen || !IdUsuario) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    await sql.connect(config);
    const result = await sql.request()
      .input('NodoID', sql.Int, NodoID)
      .input('PlantillaID', sql.Int, PlantillaID)
      .input('SegmentoID', sql.Int, SegmentoID)
      .input('EvidenciaID', sql.Int, EvidenciaID)
      .input('RutaImagen', sql.NVarChar(250), RutaImagen)
      .input('IdUsuario', sql.NVarChar(50), IdUsuario)
      .execute('sp_InsertPlantillaImagenes');
    await sql.close();
    return res.status(200).json({ PlantillaImagenID: result.recordset[0].PlantillaImagenID });
  } catch (error) {
    await sql.close();
    return res.status(500).json({ error: error.message });
  }
}
