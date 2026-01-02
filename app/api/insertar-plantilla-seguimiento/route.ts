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
    // Verificar si se insertaron filas (depende del driver, aquí asumimos que result.length > 0 si hubo inserción)
    let mensaje = '';
    if (Array.isArray(result) && result.length > 0) {
      mensaje = 'Seguimiento insertado correctamente.';
    } else {
      mensaje = 'No se insertó ningún registro. Verifique los parámetros o si ya existe la relación.';
    }
    return NextResponse.json({ success: true, mensaje, filas: result });
  } catch (error) {
    let errorMsg = 'Error desconocido';
    if (error instanceof Error) errorMsg = error.message;
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
