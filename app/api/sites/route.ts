import { NextResponse } from 'next/server';
import sql from 'mssql';

export async function GET() {
  try {
    const config = {
      user: 'sa',
      password: '7@1l6DknPRBHhtJ6eg32xss',
      server: '161.132.4.67',
      port: 1433,
      database: 'n8n_produccion',
      options: {
        encrypt: false,
        trustServerCertificate: true
      },
      requestTimeout: 60000
    };
    await sql.connect(config);
    // Ejecutar el store tal cual test-sqlserver.js
    const result = await new sql.Request().execute('Asignacion_Sites');
    const sites = result.recordset.map((row: any) => ({
      Concatenado: row.Concatenado,
      ...row
    }));
    return NextResponse.json(sites);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await sql.close();
  }
}
