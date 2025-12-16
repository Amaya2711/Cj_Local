import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/sqlServerClient';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idEmpleado = searchParams.get('idEmpleado');
    const fecha = searchParams.get('fecha');
    if (!idEmpleado || !fecha) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }
    const pool = await getConnection();
    const result = await pool.request()
      .input('pfechaBase', sql.NVarChar, fecha)
      .input('pIdCuadrilla', sql.Int, Number(idEmpleado))
      .execute('SP_ObtenerFechaRuta');
    return NextResponse.json(result.recordset || []);
  } catch (error: any) {
    console.error('Error en SP_ObtenerFechaRuta:', error);
    return NextResponse.json({ error: error?.message ? error.message : (typeof error === 'string' ? error : JSON.stringify(error)) }, { status: 500 });
  }
}
