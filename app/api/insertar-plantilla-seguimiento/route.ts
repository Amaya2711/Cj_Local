import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';

// POST: /api/insertar-plantilla-seguimiento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { NodoID, PlantillaID, AutoID, IdUsuario } = body;
    if (!NodoID || !PlantillaID || !AutoID || !IdUsuario) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 });
    }
    // Ejecutar el procedimiento almacenado
    const result = await sqlQuery`EXEC SP_InsertarPlantillaSeguimientoImagenes ${NodoID}, ${PlantillaID}, ${AutoID}, ${IdUsuario}`;
    return NextResponse.json({ success: true, result });
  } catch (error) {
    let errorMsg = 'Error desconocido';
    if (error instanceof Error) errorMsg = error.message;
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
