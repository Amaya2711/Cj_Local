import { NextResponse } from 'next/server';
import { sql, getPool } from '@/lib/sqlServerClient';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT NodoID, Nombre FROM pla_NodoPrincipal');
    return NextResponse.json(result.recordset);
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nombre, descripcion } = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('Nombre', sql.VarChar(100), nombre)
      .input('Descripcion', sql.VarChar(500), descripcion)
      .query('INSERT INTO pla_NodoPrincipal (Nombre, Descripcion) VALUES (@Nombre, @Descripcion)');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
