export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../lib/sqlServerClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const store = searchParams.get('store');
    const pool = await getPool();
    let result;
    if (store === 'sp_GetPlaPlantilla') {
      result = await pool.request().execute('sp_GetPlaPlantilla');
    } else {
      // Por defecto ejecuta el store anterior (puedes ajustar esto si lo deseas)
      const tipo = Number(searchParams.get('tipo') || '1');
      result = await pool.request()
        .input('Tipo', sql.Int, tipo)
        .execute('sp_BuscarPlantilla');
    }
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('Error en /api/plantillas:', err);
    return NextResponse.json({ error: err.message || 'Error al consultar plantillas' }, { status: 500 });
  }
}
