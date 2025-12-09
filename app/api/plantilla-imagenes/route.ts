import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';

// GET: /api/plantilla-imagenes?usuario=ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuario = searchParams.get('usuario');
  let where = '';
  if (usuario) where = `WHERE IdUsuario = '${usuario}'`;
  try {
    const result = await sqlQuery`SELECT * FROM [n8n_produccion].[dbo].[Plantilla_Imagenes] ${where}`;
    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

// POST: /api/plantilla-imagenes
export async function POST(request: Request) {
  const body = await request.json();
  const { NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario } = body;
    const idUsuario = (typeof globalThis !== 'undefined' && (globalThis as any).pb_Usuario) ? (globalThis as any).pb_Usuario : '';
    if (!NodoID || !PlantillaID || !SegmentoID || !EvidenciaID || !idUsuario) {
    return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
  }
  try {
      await sqlQuery`INSERT INTO [n8n_produccion].[dbo].[Plantilla_Imagenes] (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario) VALUES (${NodoID}, ${PlantillaID}, ${SegmentoID}, ${EvidenciaID}, ${RutaImagen || ''}, ${idUsuario})`;
    return NextResponse.json({ success: true });
  } catch (error) {
    let errorMsg = 'Error desconocido';
    if (error instanceof Error) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
