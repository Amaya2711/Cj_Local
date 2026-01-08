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
  const { usuario, clave } = req.body;
  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }
  try {
    await sql.connect(config);
    // Aquí deberías validar usuario y clave con tu SP o consulta
    // Ejemplo: ejecutar un SP que valide credenciales
    const result = await new sql.Request()
      .input('Accion', sql.Int, 1) // Cambia según tu SP
      .input('Usuario', sql.VarChar, usuario)
      .input('Clave', sql.VarChar, clave)
      .execute('SP_ValidarUsuario');
    if (result.recordset && result.recordset.length > 0 && result.recordset[0].valido) {
      res.status(200).json({ success: true, user: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, error: 'Usuario o clave incorrectos' });
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    res.status(500).json({ error: 'Error de conexión a SQL Server', details: err.message });
  } finally {
    await sql.close();
  }
}
