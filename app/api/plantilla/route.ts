export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { sql, getPool } from '@/lib/sqlServerClient';

import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
