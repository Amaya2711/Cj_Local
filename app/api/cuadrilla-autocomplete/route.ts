import { NextRequest } from 'next/server';
import sql from 'mssql';

// Configuración de conexión SQL Server
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  if (!q || q.length < 2) {
    return new Response(JSON.stringify([]), { status: 400 });
  }
  try {
    // @ts-ignore
    await sql.connect(config);
    // @ts-ignore
    const result = await sql.query`EXEC EmpleadoCuadrilla @busqueda = ${q}`;
    const cuadrillas = result.recordset.map((row: any) => ({
      id: row.id || row.Id || row.ID,
      nombre: row.nombre || row.Nombre || row.NOMBRE,
    }));
    return new Response(JSON.stringify(cuadrillas), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error consultando cuadrillas', detalle: error }), { status: 500 });
  }
}
