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

export async function GET() {
  try {
    await sql.connect(config);
    const result = await sql.query('EXEC sp_EstadosWeb');
    let estados = Array.isArray(result.recordset) ? result.recordset : [];
    estados = estados.map(e => ({
      id: e.id || e.Id || e.ID || e.codigo || e.cod || '',
      nombre: e.nombre || e.Nombre || e.descripcion || e.desc || ''
    })).filter(e => e.id && e.nombre);
    if (estados.length === 0) {
      return NextResponse.json({ error: 'No se encontraron estados en la base de datos.' }, { status: 404 });
    }
    return NextResponse.json(estados, { status: 200 });
  } catch (err) {
    console.error('Error al obtener estados:', err);
    return NextResponse.json({ error: 'Error al obtener estados', details: err.message }, { status: 500 });
  } finally {
    await sql.close();
  }
}
