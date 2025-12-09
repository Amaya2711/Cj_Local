import { NextResponse } from 'next/server';
import { sqlQuery } from '../../../lib/sqlServerClient';

// POST: /api/plantilla-imagenes
export async function POST(request: Request) {
  const body = await request.json();
  if (Array.isArray(body.combinaciones)) {
    const errores = [];
    const sentenciasSQL = [];
    for (const reg of body.combinaciones) {
      const { NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario } = reg;
      if (!NodoID || !PlantillaID || !SegmentoID || !EvidenciaID || !IdUsuario) {
        errores.push(`Faltan datos requeridos en: ${JSON.stringify(reg)}`);
        continue;
      }
      try {
        const fechaRegistro = new Date().toISOString();
        const sql = `INSERT INTO Plantilla_Imagenes (NodoID, PlantillaID, SegmentoID, EvidenciaID, RutaImagen, IdUsuario, FechaRegistro) VALUES (${NodoID}, ${PlantillaID}, ${SegmentoID}, ${EvidenciaID}, '${RutaImagen || ''}', '${IdUsuario}', '${fechaRegistro}')`;
        sentenciasSQL.push(sql);
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
      return NextResponse.json({ error: errores.join('; '), sentenciasSQL }, { status: 400 });
    }
    return NextResponse.json({ success: true, sentenciasSQL });
  }
  return NextResponse.json({ error: 'Formato de datos incorrecto' }, { status: 400 });
}

// GET: /api/plantilla-imagenes?usuario=ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuario = searchParams.get('usuario');
  let where = '';
  if (usuario) where = `WHERE IdUsuario = '${usuario}'`;
  try {
    const result = await sqlQuery`SELECT * FROM [n8n_produccion].[dbo].[Plantilla_Imagenes] ${where}`;
    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
