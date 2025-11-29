import { NextResponse } from 'next/server';
const { querySqlServer } = require('../../../lib/sqlServerClient');

export async function GET() {
  try {
    console.log('Llamando SP: EXEC Asignacion_Sites');
    const result = await querySqlServer('EXEC Asignacion_Sites');
    console.log('Resultado crudo del SP:', result);
    if (!Array.isArray(result)) {
      console.error('El resultado no es un array:', result);
      return NextResponse.json([]);
    }
    // Validar que los campos requeridos existan
    const mapped = result.map((row: any) => ({
      NroInterno: row.NroInterno ?? row.nrointerno ?? row.nroInterno ?? '',
      Concatenado: row.Concatenado ?? row.concatenado ?? '',
      ...row
    }));
    console.log('Resultado mapeado:', mapped);
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Error en /api/asignacion-sites:', error);
    return NextResponse.json({ error: 'Error al obtener sites', details: error?.message || error }, { status: 500 });
  }
}
