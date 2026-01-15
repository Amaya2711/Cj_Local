export const dynamic = 'force-dynamic';
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
            pSegmento: row.segmentoid ?? '',
            pCheck: row.pCheck ?? 0
          });
          // Ejecutar el SP y obtener el Id_Auto directamente del output
          const request = pool.request()
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
            .input('pSegmento', row.segmentoid ?? '')
            .input('pCheck', row.pCheck ?? 0);
          const insertResult = await request.execute('sp_CrearAsignacion');
          const idAuto = insertResult.recordset?.[0]?.Id_Auto;
          console.log('Resultado sp_CrearAsignacion:', insertResult, 'Id_Auto:', idAuto);
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
        let SegmentoID = row.SegmentoID ?? row.segmentoid ?? row.segmentoID ?? row.segmentoId;
        if (SegmentoID === undefined || SegmentoID === null || SegmentoID === '') SegmentoID = 0;
        let Segmento = row.Segmento ?? row.segmento;
        if (Segmento === undefined || Segmento === null) Segmento = '';
        const NodoID = row.nodoid ?? row.NodoID ?? row.pNodo ?? null;
        const PlantillaID = row.plantillaid ?? row.PlantillaID ?? row.pPlantilla ?? null;
        if (!id_cuadrilla || !idsite || !correlativo) {
          console.log('Faltan parámetros requeridos para seguimiento:', { id_cuadrilla, idsite, correlativo });
          continue;
        }
        try {
          // 1. Crear nueva asignación para obtener un nuevo Id_Auto
          console.log('Insertando en CuadrillaAsignacion (para seguimiento) con:', {
            pidCuadrilla: id_cuadrilla,
            pidsite: idsite,
            pcorresite: correlativo,
            pNroInterno: row.NroInterno,
            pFecha: row.fecha,
            pEstado: 3, // Estado para seguimiento
            pUsuario: usuario,
            ptipotrabajo: row.ptipotrabajo ?? row.TipoTrabajo ?? '',
            pNodo: NodoID,
            pPlantilla: PlantillaID,
            pSegmento: SegmentoID
          });
          await pool.request()
            .input('pidCuadrilla', id_cuadrilla)
            .input('pidsite', idsite)
            .input('pcorresite', correlativo)
            .input('pNroInterno', row.NroInterno)
            .input('pFecha', row.fecha)
            .input('pEstado', 3)
            .input('pUsuario', usuario)
            .input('ptipotrabajo', row.ptipotrabajo ?? row.TipoTrabajo ?? '')
            .input('pNodo', NodoID)
            .input('pPlantilla', PlantillaID)
            .input('pSegmento', SegmentoID)
            .input('pCheck', row.pCheck ?? 0) // Nuevo parámetro agregado
            .execute('sp_CrearAsignacion');

          // 2. Obtener el nuevo Id_Auto generado
          const idAutoResult = await pool.request().query('SELECT TOP 1 Id_Auto FROM CuadrillaAsignacion ORDER BY Id_Auto DESC');
          const idAuto = idAutoResult.recordset?.[0]?.Id_Auto;

          // 3. Ejecutar el SP de seguimiento (opcional, si se requiere)
          console.log('Ejecutando sp_CrearSeguimiento con:', {
            pidCuadrilla: id_cuadrilla,
            pNroInterno: row.NroInterno,
            pFecha: row.fecha,
            pEstado: 3,
            pUsuario: usuario,
            ptipotrabajo: row.ptipotrabajo ?? ''
          });
          await pool.request()
            .input('pidCuadrilla', sql.Int, Number(id_cuadrilla))
            .input('pNroInterno', sql.Numeric(18,0), Number(row.NroInterno))
            .input('pFecha', sql.NVarChar(15), row.fecha)
            .input('pEstado', sql.Int, 3)
            .input('pUsuario', sql.NVarChar(10), usuario)
            .input('ptipotrabajo', sql.NVarChar(250), row.ptipotrabajo ?? '')
            .execute('sp_CrearSeguimiento');

          // 4. Insertar en PlantillaSeguimientoImagenes con el nuevo Id_Auto
          if (PlantillaID) {
            console.log('Ejecutando SP_InsertarPlantillaSeguimientoImagenes con:', {
              PlantillaID, Id_Auto: idAuto, IdUsuario: usuario
            });
            await pool.request()
              .input('PlantillaID', PlantillaID)
              .input('Id_Auto', idAuto)
              .input('IdUsuario', usuario)
              .execute('SP_InsertarPlantillaSeguimientoImagenes');
          } else {
            console.log('No se ejecuta SP_InsertarPlantillaSeguimientoImagenes por falta de PlantillaID:', { PlantillaID });
          }
        } catch (err: any) {
          // Manejar error de clave duplicada
          if (err && err.number === 2627 && err.message && err.message.includes('PlantillaSeguimientoImagenes')) {
            console.error('Registro duplicado en PlantillaSeguimientoImagenes:', err);
            return Response.json({ error: 'Ya existe un registro de PlantillaSeguimientoImagenes para este Id_Auto y PlantillaID.', detalle: err }, { status: 409 });
          }
          console.error('Error SQL al crear seguimiento o insertar plantilla:', err);
          return Response.json({ error: `Error al crear seguimiento o insertar plantilla: ${err.message || err}`, detalle: err }, { status: 500 });
        }
      }
      return Response.json({ success: true, message: 'Seguimientos y plantillas creados exitosamente.' });
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
