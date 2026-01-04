import type { NextApiRequest, NextApiResponse } from 'next';

// Simulación de base de datos en memoria
let ubicaciones: any[] = [
  // Puedes agregar ubicaciones iniciales aquí si lo deseas
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Retorna todas las ubicaciones
    return res.status(200).json(ubicaciones);
  }

  if (req.method === 'POST') {
    const { nombreubicacion, latitud, longitud, direccion, referencia, accion } = req.body;
    if (accion !== 1) {
      return res.status(400).json({ error: 'Acción no soportada' });
    }
    if (!nombreubicacion || !latitud || !longitud || !direccion || !referencia) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    // Simula el guardado y genera un id
    const nuevaUbicacion = {
      idubicacion: ubicaciones.length + 1,
      nombreubicacion,
      latitud,
      longitud,
      direccion,
      referencia
    };
    ubicaciones.push(nuevaUbicacion);
    // Puedes retornar solo la nueva o toda la lista
    return res.status(200).json(nuevaUbicacion);
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
