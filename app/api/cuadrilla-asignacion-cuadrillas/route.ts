import { NextResponse } from 'next/server';
import sql from 'mssql';
import { MSSQL_CONFIG } from '@/lib/sqlServerClient';

export async function GET() {
  try {
    // Conexión a SQL Server
    console.log('Conectando a SQL Server...');
    await sql.connect(MSSQL_CONFIG);
    console.log('Conexión exitosa. Ejecutando store EmpleadoCuadrilla...');
    const result = await sql.query('EXEC EmpleadoCuadrilla');
    console.log('Resultado del store:', result.recordset);
    return NextResponse.json(result.recordset);
  } catch (err) {
    let errorMsg = 'Error al consultar cuadrillas.';
    if (err instanceof Error) {
      errorMsg += ' ' + err.message;
      if ((err as any).stack) errorMsg += '\n' + (err as any).stack;
    } else {
      errorMsg += ' ' + JSON.stringify(err);
    }
    console.error('Error en API EmpleadoCuadrilla:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  } finally {
    try { await sql.close(); } catch {}
  }
}
