const { sqlServerClient, querySqlServer } = require('../../../lib/sqlServerClient');
// Por favor, revisa y comparte el contenido de este archivo para depuración.
import { NextResponse } from 'next/server';
// import { executeQuery } from '../../../lib/sqlServerClient';

export async function POST(req: Request) {
  try {
    let { asignaciones, usuario } = await req.json();
    if (!usuario) {
      usuario = 'ADMIN';
    }
    if (!Array.isArray(asignaciones) || asignaciones.length === 0) {
      console.error('No hay datos para grabar:', asignaciones);
      return NextResponse.json({ error: 'No hay datos para grabar.' }, { status: 400 });
    }
    let errores: string[] = [];
    const sqlComandos: string[] = [];
    for (const row of asignaciones) {
      const { id_cuadrilla, idsite, correlativo } = row;
      if (!id_cuadrilla || !idsite || !correlativo) {
        errores.push(`Faltan datos en registro: ${JSON.stringify(row)}`);
        continue;
      }
        const sql = `INSERT INTO CuadrillaAsignacion (id_cuadrilla, idsite, corresite, fecha, Estado, UsuarioCreacion, FechaCreacion, NroInterno)
          VALUES (${Number(id_cuadrilla)}, '${idsite}', ${Number(correlativo)}, CONVERT(nvarchar(15), GETDATE(), 23), 3, '${usuario}', GETDATE(), ${row.NroInterno ?? 'NULL'})`;
      console.log('SQL ejecutado:', sql);
      sqlComandos.push(sql);
      try {
        await querySqlServer(sql);
      } catch (err: any) {
        errores.push(`Error en registro ${JSON.stringify(row)}: ${err?.message || err}`);
      }
    }
    if (errores.length > 0) {
      return NextResponse.json({ error: errores.join('; '), sql: sqlComandos }, { status: 500 });
    }
    return NextResponse.json({ ok: true, sql: sqlComandos });
  } catch (error: any) {
    console.error('Error inesperado:', error);
    return NextResponse.json({ error: error?.message || 'Error inesperado.', details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}
