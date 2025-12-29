import { NextRequest } from 'next/server';
import sql from 'mssql';

const config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  server: process.env.SQLSERVER_HOST,
  database: process.env.SQLSERVER_DB,
  port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { idCuadrilla, pFechaIni, pFechaFin } = body;
  // Log de depuración
  console.log('API aprobar-busqueda - Parámetros recibidos:', { idCuadrilla, pFechaIni, pFechaFin });
  if (!idCuadrilla || !pFechaIni || !pFechaFin) {
    console.log('API aprobar-busqueda - Faltan parámetros');
    return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
  }
  try {
    // @ts-ignore
    await sql.connect(config);
    // Log de depuración antes de ejecutar el SP
    console.log('API aprobar-busqueda - Ejecutando SP:', `EXEC sp_ObtenerCuadrillaAprobar @idCuadrilla = ${idCuadrilla}, @pFechaIni = ${pFechaIni}, @pFechaFin = ${pFechaFin}`);
    // @ts-ignore
    const result = await sql.query`EXEC sp_ObtenerCuadrillaAprobar @idCuadrilla = ${idCuadrilla}, @pFechaIni = ${pFechaIni}, @pFechaFin = ${pFechaFin}`;
    console.log('API aprobar-busqueda - Resultados:', result.recordset);
    return new Response(JSON.stringify(result.recordset), { status: 200 });
  } catch (error) {
    console.error('API aprobar-busqueda - Error:', error);
    return new Response(JSON.stringify({ error: 'Error ejecutando búsqueda', detalle: error }), { status: 500 });
  }
}
