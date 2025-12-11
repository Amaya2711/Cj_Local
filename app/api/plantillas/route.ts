import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Lee el parámetro tipo, por defecto 1 si no viene
    const tipo = searchParams.get('tipo') || '1';
    // Ejecuta el procedimiento almacenado con el parámetro @Tipo
    const result = await sqlQuery(
      `EXEC sp_BuscarPlantilla @Tipo = @tipo`,
      { tipo: Number(tipo) }
    );
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error en /api/plantillas:', err);
    return NextResponse.json({ error: err.message || 'Error al consultar plantillas' }, { status: 500 });
  }
}
