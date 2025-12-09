import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';

// GET: /api/plantilla-imagenes?usuario=ID
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const usuario = searchParams.get('usuario');
  let where = '';
  if (usuario) where = `WHERE IdUsuario = '${usuario}'`;
  try {
    const result = await sqlQuery`SELECT * FROM [n8n_produccion].[dbo].[Plantilla_Imagenes] ${where}`;
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: /api/plantilla-imagenes
export async function POST(request) {
  const body = await request.json();
  const { NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario } = body;
  if (!NodoID || !PlantillaID || !SegmentoID || !EvidenciaID || !IdUsuario) {
    return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
  }
  try {
    await sqlQuery`INSERT INTO [n8n_produccion].[dbo].[Plantilla_Imagenes] (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario) VALUES (${NodoID}, ${PlantillaID}, ${SegmentoID}, ${EvidenciaID}, ${RutaImagen || ''}, ${IdUsuario})`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
