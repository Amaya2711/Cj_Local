export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../lib/sqlServerClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = Number(searchParams.get('tipo') || '1');
    const pool = await getPool();
    const result = await pool.request()
      .input('Tipo', sql.Int, tipo)
      .execute('sp_BuscarPlantilla');
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('Error en /api/plantillas:', err);
    return NextResponse.json({ error: err.message || 'Error al consultar plantillas' }, { status: 500 });
  }
}
