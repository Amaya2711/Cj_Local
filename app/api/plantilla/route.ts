import { NextResponse } from 'next/server';
import { sql, getPool } from '@/lib/sqlServerClient';

export async function GET(req) {
  const nodoId = req.nextUrl.searchParams.get('nodoId');
  try {
    const pool = await getPool();
    let query = 'SELECT PlantillaID, Nombre FROM pla_Plantilla';
    if (nodoId) {
      query += ' WHERE NodoID = @NodoID';
    }
    const request = pool.request();
    if (nodoId) {
      request.input('NodoID', sql.Int, parseInt(nodoId));
    }
    const result = await request.query(query);
    return NextResponse.json(result.recordset);
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nombre, descripcion, nodoId } = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('Nombre', sql.VarChar(100), nombre)
      .input('Descripcion', sql.VarChar(500), descripcion)
      .input('NodoID', sql.Int, parseInt(nodoId))
      .query('INSERT INTO pla_Plantilla (Nombre, Descripcion, NodoID) VALUES (@Nombre, @Descripcion, @NodoID)');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
