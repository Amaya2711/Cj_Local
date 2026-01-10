// SOLO PARA PRUEBAS: Elimina este archivo en producción
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    SQLSERVER_USER: process.env.SQLSERVER_USER,
    SQLSERVER_PASSWORD: process.env.SQLSERVER_PASSWORD,
    SQLSERVER_HOST: process.env.SQLSERVER_HOST,
    SQLSERVER_DB: process.env.SQLSERVER_DB,
    SQLSERVER_PORT: process.env.SQLSERVER_PORT,
  });
}
