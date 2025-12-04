import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../lib/sqlServerClient';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().execute('EmpleadoCuadrilla');
    return NextResponse.json(result.recordset);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error inesperado', details: error }, { status: 500 });
  }
}
