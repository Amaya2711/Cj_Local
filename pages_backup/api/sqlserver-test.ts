import { NextApiRequest, NextApiResponse } from 'next';
import { querySqlServer } from '@/lib/sqlServerClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const { idusuario, clave, query } = req.body;
  if (query) {
    // Ejecutar el query personalizado recibido en el body
    try {
      const sql = require('mssql');
      const { config } = require('@/lib/sqlServerClient');
      const pool = await sql.connect(config);
      const result = await pool.request().query(query);
      res.status(200).json(result.recordset);
    } catch (error: any) {
      console.error('Error en /api/sqlserver-test (query personalizado):', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
    return;
  }
  if (!idusuario || !clave) {
    // Si no se envían credenciales, devolver los primeros 10 usuarios
    try {
      const sql = require('mssql');
      const { config } = require('@/lib/sqlServerClient');
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT TOP 10 idusuario, clave, NombreDispositivo FROM usuario');
      res.status(200).json(result.recordset);
    } catch (error: any) {
      console.error('Error en /api/sqlserver-test (TOP 10 usuarios):', error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
    return;
  }
  try {
    const sql = require('mssql');
    const { config } = require('@/lib/sqlServerClient');
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('idusuario', sql.VarChar, idusuario)
      .input('clave', sql.VarChar, clave)
      .query('SELECT NombreDispositivo FROM usuario WHERE idusuario=@idusuario AND clave=@clave');
    res.status(200).json(result.recordset);
  } catch (error: any) {
    console.error('Error en /api/sqlserver-test (login usuario):', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
