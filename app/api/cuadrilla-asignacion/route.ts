import * as sql from 'mssql';
import { getPool } from '../../../lib/sqlServerClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let { asignaciones, usuario } = await req.json();
    if (!usuario) {
      usuario = 'ADMIN_X';
    }
    if (!Array.isArray(asignaciones) || asignaciones.length === 0) {
      console.error('No hay datos para grabar:', asignaciones);
      return NextResponse.json({ error: 'No hay datos para grabar.' }, { status: 400 });
    }
    let errores: string[] = [];
    const sqlComandos: string[] = [];
      // Inicializar pool correctamente
      const pool = await getPool(); // Asegurarse de que el pool esté inicializado
    for (const row of asignaciones) {
      const { id_cuadrilla, idsite, correlativo } = row;
      if (!id_cuadrilla || !idsite || !correlativo) {
        errores.push(`Faltan datos en registro: ${JSON.stringify(row)}`);
        continue;
      }
      // Validar si ya existe el registro antes de insertar
      const existe = await pool.request()
        .input('id_cuadrilla', sql.Int, Number(id_cuadrilla))
        .input('idsite', sql.VarChar, row.idsite)
        .input('correlativo', sql.Int, Number(row.correlativo))
        .query(`SELECT 1 FROM CuadrillaAsignacion WHERE id_cuadrilla = @id_cuadrilla AND idsite = @idsite AND corresite = @correlativo`);
      if (existe.recordset.length > 0) {
        // Ya existe, omitir inserción y seguimiento
        continue;
      }
      try {
        // Ejecutar primero sp_CrearAsignacion SOLO UNA VEZ por registro
        await pool.request()
          .input('pidCuadrilla', sql.Int, Number(id_cuadrilla))
          .input('pidsite', sql.VarChar, row.idsite)
          .input('pcorresite', sql.Int, Number(row.correlativo))
          .input('pNroInterno', sql.Numeric(18,0), Number(row.NroInterno))
          .input('pFecha', sql.NVarChar(15), row.fecha)
          .input('pEstado', sql.Int, 3)
          .input('pUsuario', sql.NVarChar(10), usuario)
          .input('ptipotrabajo', sql.NVarChar(250), row.ptipotrabajo ?? '')
          .execute('sp_CrearAsignacion');
        // Luego ejecutar sp_CrearSeguimiento (sin pidsite y pcorresite)
        await pool.request()
          .input('pidCuadrilla', sql.Int, Number(id_cuadrilla))
          .input('pNroInterno', sql.Numeric(18,0), Number(row.NroInterno))
          .input('pFecha', sql.NVarChar(15), row.fecha)
          .input('pEstado', sql.Int, 3)
          .input('pUsuario', sql.NVarChar(10), usuario)
          .input('ptipotrabajo', sql.NVarChar(250), row.ptipotrabajo ?? '')
          .execute('sp_CrearSeguimiento');
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idCuadrilla = searchParams.get('id_cuadrilla');
  const pFecha = searchParams.get('pFecha');
  if (!idCuadrilla || !pFecha) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('idCuadrilla', sql.Int, Number(idCuadrilla))
      .input('pFecha', sql.NVarChar(15), pFecha)
      .execute('sp_ObtenerCuadrillaAsignacion');
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error, errorMessage: error instanceof Error ? error.message : String(error) }), { status: 500 });
  }
}
