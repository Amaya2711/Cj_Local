import { NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  user: 'sa',
  password: '7@1l6DknPRBHhtJ6eg32xss',
  server: '161.132.4.67',
  port: 1433,
  database: 'n8n_produccion',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idCuadrilla = searchParams.get('cuadrilla') || '';
  const pFechaIni = searchParams.get('fechaIni') || '';
  const pFechaFin = searchParams.get('fechaFin') || '';
  const pEstado = searchParams.get('estado') || '';

  try {
    await sql.connect(config);
    // Usar los nombres reales de los parámetros del store
    const result = await sql.query(`EXEC sp_ObtenerCuadrillaReporte @idCuadrilla=${idCuadrilla ? `'${idCuadrilla}'` : 'NULL'}, @pFechaIni=${pFechaIni ? `'${pFechaIni}'` : 'NULL'}, @pFechaFin=${pFechaFin ? `'${pFechaFin}'` : 'NULL'}, @pEstado=${pEstado ? `'${pEstado}'` : 'NULL'}`);
    const data = Array.isArray(result.recordset) ? result.recordset : [];
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Error al ejecutar sp_ObtenerCuadrillaReporte:', err);
    return NextResponse.json({ error: 'Error al obtener datos', details: err.message }, { status: 500 });
  } finally {
    await sql.close();
  }
}
