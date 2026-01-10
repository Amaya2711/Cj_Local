// SOLO PARA PRUEBAS: Elimina este archivo en producción
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    envs: process.env
  });
}