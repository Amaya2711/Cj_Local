import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../lib/sqlServerClient';

export async function GET() {
  try {
     console.log('Conectando a SQL Server para sites...');
     const pool = await getPool();
     console.log('Conexión exitosa. Ejecutando store Asignacion_Sites...');
     const result = await pool.request().execute('Asignacion_Sites');
     console.log('Resultado del store Asignacion_Sites:', result.recordset);
    return NextResponse.json(result.recordset);
  } catch (error: any) {
     console.error('Error en API Asignacion_Sites:', error);
     return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
