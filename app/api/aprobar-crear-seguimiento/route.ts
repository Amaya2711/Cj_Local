import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function POST(req) {
  try {
    const body = await req.json();
    const { registros, usuario } = body; // registros: array de objetos seleccionados

    // Configuración SQL Server desde variables de entorno
    const config = {
      user: process.env.SQLSERVER_USER,
      password: process.env.SQLSERVER_PASSWORD,
      server: process.env.SQLSERVER_HOST,
      port: parseInt(process.env.SQLSERVER_PORT || '1433'),
      database: process.env.SQLSERVER_DB,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };

    await sql.connect(config);
    let resultados = [];
    for (const reg of registros) {
      const request = new sql.Request();
      request.input('pidCuadrilla', sql.Int, reg.pidCuadrilla);
      request.input('pNroInterno', sql.VarChar, reg.pNroInterno);
      request.input('pFecha', sql.Date, reg.pFecha);
      request.input('pEstado', sql.Int, 8);
      request.input('pUsuario', sql.VarChar, usuario);
      request.input('ptipotrabajo', sql.VarChar, reg.ptipotrabajo);
      const result = await request.execute('sp_CrearSeguimiento');
      resultados.push(result);
    }
    await sql.close();
    return NextResponse.json({ ok: true, resultados });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
