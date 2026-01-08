import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
const sql = require('mssql');

export const runtime = 'nodejs';
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

export async function POST(req) {
  const body = await req.json();
  const { usuario, clave } = body;
  if (!usuario || !clave) {
    return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
  }
  try {
    await sql.connect(config);
    // Aquí deberías validar usuario y clave con tu SP o consulta
    // Ejemplo: ejecutar un SP que valide credenciales
    const result = await new sql.Request()
        .input('pIdUsuario', sql.NVarChar(50), usuario)
        .input('pClave', sql.NVarChar(10), clave)
      .execute('SP_ValidarUsuario');
    if (result.recordset && result.recordset.length > 0 && result.recordset[0].valido) {
      return NextResponse.json({ success: true, user: result.recordset[0] });
    } else {
      return NextResponse.json({ success: false, error: 'Usuario o clave incorrectos' }, { status: 401 });
    }
  } catch (err) {
    console.error('Error de conexión:', err);
    return NextResponse.json({ error: 'Error de conexión a SQL Server', details: err.message }, { status: 500 });
  } finally {
    await sql.close();
  }
}
