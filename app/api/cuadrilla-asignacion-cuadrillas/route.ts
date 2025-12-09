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
    // Devolver los datos
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error en API EmpleadoCuadrilla:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  } finally {
    try { await sql.close(); } catch {}
  }
}
