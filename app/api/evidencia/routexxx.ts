import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';

// GET /api/evidencia?segmentoId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const segmentoId = searchParams.get('segmentoId');
  if (!segmentoId) {
    return NextResponse.json({ error: 'segmentoId es requerido' }, { status: 400 });
  }
  try {
    const result = await sqlQuery`SELECT EvidenciaID, SegmentoID, Nombre, EsObligatoria, Orden FROM [n8n_produccion].[dbo].[pla_Evidencia] WHERE SegmentoID = ${segmentoId} ORDER BY Orden ASC`;
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/evidencia
export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, segmentoId, esObligatoria, orden } = body;
  if (!nombre || !segmentoId || orden === undefined || esObligatoria === undefined) {
    return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
  }
  try {
    await sqlQuery`INSERT INTO [n8n_produccion].[dbo].[pla_Evidencia] (SegmentoID, Nombre, EsObligatoria, Orden) VALUES (${segmentoId}, ${nombre}, ${esObligatoria}, ${orden})`;
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
