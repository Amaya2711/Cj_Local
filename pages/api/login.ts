import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

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
  const { usuario, clave } = req.body;
  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Usuario y clave son requeridos' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT * FROM USUARIO WHERE IDUSUARIO = ${usuario} AND CLAVE = ${clave}
    `;
    if (result.recordset.length > 0) {
      return res.status(200).json({ success: true, usuario: result.recordset[0] });
    } else {
      return res.status(401).json({ error: 'Usuario o clave incorrectos' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error en la autenticación', details: error });
  }
}
