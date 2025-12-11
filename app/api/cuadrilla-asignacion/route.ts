import * as sql from 'mssql';
import { getPool } from '../../../lib/sqlServerClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const asignaciones = body.asignaciones;
    const usuario = body.usuario;
    console.log('POST /api/cuadrilla-asignacion - Body:', JSON.stringify(body));
    if (!asignaciones || !Array.isArray(asignaciones) || asignaciones.length === 0) {
      console.error('No se recibieron asignaciones válidas:', asignaciones);
      return Response.json({ error: 'No se recibieron asignaciones válidas.', detalle: asignaciones }, { status: 400 });
    }
    if (!usuario) {
      console.error('No se recibió el usuario:', usuario);
      return Response.json({ error: 'No se recibió el usuario.', detalle: usuario }, { status: 400 });
    }
    const pool = await getPool();
    let result = [];
    if (body.crearAsignacion) {
      // Insertar en CuadrillaAsignacion y obtener Id_Auto
      for (const row of asignaciones) {
        try {
          // Ajustar nombres y tipos de parámetros según el procedimiento almacenado
          console.log('Insertando en CuadrillaAsignacion con:', {
            pidCuadrilla: row.id_cuadrilla,
            pidsite: row.idsite,
            pcorresite: row.correlativo,
            pNroInterno: row.NroInterno,
            pFecha: row.fecha,
            pEstado: 1,
            pUsuario: usuario,
            ptipotrabajo: row.TipoTrabajo,
            pNodo: row.nodoid,
            pPlantilla: row.plantillaid,
            pSegmento: row.segmentoid
          });
          const insertResult = await pool.request()
            .input('pidCuadrilla', row.id_cuadrilla)
            .input('pidsite', row.idsite)
            .input('pcorresite', row.correlativo)
            .input('pNroInterno', row.NroInterno)
            .input('pFecha', row.fecha)
            .input('pEstado', 1)
            .input('pUsuario', usuario)
            .input('ptipotrabajo', row.TipoTrabajo)
            .input('pNodo', row.nodoid)
            .input('pPlantilla', row.plantillaid)
            .input('pSegmento', row.segmentoid)
            .execute('sp_CrearAsignacion');
          console.log('Resultado sp_CrearAsignacion:', insertResult);
          // Obtener el último Id_Auto insertado
          const idAutoResult = await pool.request().query('SELECT TOP 1 Id_Auto FROM CuadrillaAsignacion ORDER BY Id_Auto DESC');
          const idAuto = idAutoResult.recordset?.[0]?.Id_Auto;
          // Ejecutar el SP correcto para PlantillaSeguimientoImagenes
          console.log('Ejecutando SP_InsertarPlantillaSeguimientoImagenes con:', {
            NodoID: row.nodoid,
            PlantillaID: row.plantillaid,
            AutoID: idAuto,
            IdUsuario: usuario
          });
          const spResult = await pool.request()
            .input('NodoID', row.nodoid)
            .input('PlantillaID', row.plantillaid)
            .input('AutoID', idAuto)
            .input('IdUsuario', usuario)
            .execute('SP_InsertarPlantillaSeguimientoImagenes');
          console.log('Resultado SP_InsertarPlantillaSeguimientoImagenes:', spResult);
          result.push({ idAuto, spResult });
        } catch (errRow) {
          console.error('Error al procesar asignación:', row, errRow);
          result.push({ error: true, row, detalle: errRow instanceof Error ? errRow.message : errRow });
        }
      }
    } else if (body.crearSeguimiento) {
      for (const row of asignaciones) {
        const { id_cuadrilla, idsite, correlativo } = row;
        // Normalizar los nombres de los parámetros
        const SegmentoID = row.SegmentoID ?? row.segmentoid ?? row.segmentoID ?? row.segmentoId ?? null;
        const NodoID = row.nodoid ?? row.NodoID ?? row.pNodo ?? null;
        const PlantillaID = row.plantillaid ?? row.PlantillaID ?? row.pPlantilla ?? null;
        if (!id_cuadrilla || !idsite || !correlativo) {
          continue;
        }
        try {
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
          return Response.json({ error: `Error al crear seguimiento: ${err.message}` }, { status: 500 });
        }
      }
      return Response.json({ success: true, message: 'Seguimientos creados exitosamente.' });
    } else {
      console.error('No se especificó la acción a realizar. Body:', body);
      return Response.json({ error: 'No se especificó la acción a realizar.', detalle: body }, { status: 400 });
    }
    return Response.json({ success: true, result });
  } catch (err: any) {
    let errorMsg = 'Error interno del servidor';
    if (err instanceof Error) {
      errorMsg += '\n' + err.message;
      if (err.stack) errorMsg += '\n' + err.stack;
    } else {
      errorMsg += '\n' + JSON.stringify(err);
    }
    console.error('Error en POST /api/cuadrilla-asignacion:', errorMsg, err);
    return Response.json({ error: errorMsg }, { status: 500 });
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
