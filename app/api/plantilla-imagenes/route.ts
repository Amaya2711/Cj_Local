import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';
import { formatInTimeZone } from 'date-fns-tz';

// POST: /api/plantilla-imagenes
export async function POST(request: Request) {
  const body = await request.json();
  if (Array.isArray(body.combinaciones)) {
    const errores = [];
    const sentenciasSQL = [];
    const parametrosEjecutados = [];
    for (const reg of body.combinaciones) {
      const { NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario } = reg;
      if (!NodoID || !PlantillaID || !SegmentoID || !EvidenciaID || !IdUsuario) {
        errores.push(`Faltan datos requeridos en: ${JSON.stringify(reg)}`);
        continue;
      }
      try {
        // Validar duplicado antes de insertar
        const existe = await sqlQuery`SELECT COUNT(*) as total FROM [n8n_produccion].[dbo].[Plantilla_Imagenes] WHERE NodoID = ${NodoID} AND PlantillaID = ${PlantillaID} AND SegmentoID = ${SegmentoID} AND EvidenciaID = ${EvidenciaID}`;
        if (Array.isArray(existe) && existe[0]?.total > 0) {
          errores.push('Registro ya existe en la base de datos');
          continue;
        }
        // Fecha y hora local de Lima
        const fechaRegistro = formatInTimeZone(new Date(), 'America/Lima', 'yyyy-MM-dd HH:mm:ss');
        const sql = `INSERT INTO Plantilla_Imagenes (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario, FechaRegistro) VALUES (${NodoID}, ${PlantillaID}, ${SegmentoID}, ${EvidenciaID}, '${RutaImagen || ''}', '${IdUsuario}', '${fechaRegistro}')`;
        sentenciasSQL.push(sql);
        parametrosEjecutados.push({ NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen: RutaImagen || '', IdUsuario, FechaRegistro: fechaRegistro });
        await sqlQuery`INSERT INTO [n8n_produccion].[dbo].[Plantilla_Imagenes] (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario, FechaRegistro) VALUES (${NodoID}, ${PlantillaID}, ${SegmentoID}, ${EvidenciaID}, ${RutaImagen || ''}, ${IdUsuario}, ${fechaRegistro})`;
      } catch (error) {
        let errorMsg = 'Error desconocido';
        if (error instanceof Error) {
          errorMsg = error.message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        errores.push(errorMsg);
      }
    }
    if (errores.length > 0) {
      // Mostrar detalle de error en la terminal
      console.error('Errores en POST /api/plantilla-imagenes:', errores);
      return NextResponse.json({ error: errores.join('; '), sentenciasSQL, parametrosEjecutados }, { status: 400 });
    }
    return NextResponse.json({ success: true, sentenciasSQL, parametrosEjecutados });
  }
  return NextResponse.json({ error: 'Formato de datos incorrecto' }, { status: 400 });
}

// GET: /api/plantilla-imagenes?usuario=ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuario = searchParams.get('usuario');
  const buscarPlantilla = searchParams.get('buscarPlantilla');
  let where = '';
  try {
    if (buscarPlantilla === '1') {
      // Ejecutar el procedimiento almacenado sp_BuscarPlantilla con parámetro 1
      const result = await sqlQuery`EXEC sp_BuscarPlantilla ${1}`;
      return NextResponse.json(result);
    }
    if (usuario) where = `WHERE IdUsuario = '${usuario}'`;
    const result = await sqlQuery`SELECT * FROM [n8n_produccion].[dbo].[Plantilla_Imagenes] ${where}`;
    return NextResponse.json(result);
  } catch (error) {
    // Mostrar detalle de error en la terminal
    console.error('Error en GET /api/plantilla-imagenes:', error);
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
