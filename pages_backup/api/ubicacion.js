// pages/api/ubicacion.js
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Recibe los datos de la ubicación
    const { NombreUbicacion, Latitud, Longitud, Direccion, Referencia } = req.body;
    // Aquí deberías guardar en la base de datos, pero para demo solo devolvemos los datos
    // Puedes agregar lógica de validación o guardado real aquí
    res.status(200).json({
      IdUbicacion: Math.floor(Math.random() * 100000), // Simula un ID
      NombreUbicacion,
      Latitud,
      Longitud,
      Direccion,
      Referencia,
      NroInterno: Math.floor(Math.random() * 100000) // Simula NroInterno
    });
  } else if (req.method === 'GET') {
    // Simula respuesta de ubicaciones
    res.status(200).json([]);
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
