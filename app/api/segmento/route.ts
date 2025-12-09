import { NextResponse } from 'next/server';
import { sql, getPool } from '@/lib/sqlServerClient';

export async function GET(req) {
  const plantillaId = req.nextUrl.searchParams.get('plantillaId');
  try {
    const pool = await getPool();
    let query = 'SELECT SegmentoID, Nombre FROM pla_Segmento';
    if (plantillaId) {
      query += ' WHERE PlantillaID = @PlantillaID';
    }
    const request = pool.request();
    if (plantillaId) {
      request.input('PlantillaID', sql.Int, parseInt(plantillaId));
    }
    const result = await request.query(query);
    return NextResponse.json(result.recordset);
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { nombre, orden, plantillaId } = await req.json();
    const pool = await getPool();
    await pool.request()
      .input('Nombre', sql.VarChar(150), nombre)
      .input('Orden', sql.Int, parseInt(orden))
      .input('PlantillaID', sql.Int, parseInt(plantillaId))
      .query('INSERT INTO pla_Segmento (Nombre, Orden, PlantillaID) VALUES (@Nombre, @Orden, @PlantillaID)');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
