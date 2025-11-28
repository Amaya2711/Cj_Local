// --- FUNCIONES PARA ASIGNACIÓN DE CUADRILLA ---
import sql from 'mssql';

// Graba una asignación de cuadrilla en la tabla CUADRILLAASIGNACION
export async function grabarAsignacionCuadrilla(id_cuadrilla: number, idsite: string, correlativo: number) {
  const pool = await sql.connect(process.env.SQLSERVER_CONN_STR as string);
    await pool.request()
        .input('ID_CUADRILLA', sql.Int, id_cuadrilla)
        .input('IDSITE', sql.VarChar(50), idsite)
        .input('CORRESITE', sql.Int, correlativo)
        .query(`INSERT INTO CUADRILLAASIGNACION (ID_CUADRILLA, IDSITE, CORRESITE, ESTADO, FECHA, FECHACREACION, USUARIOCREACION)
          VALUES (@ID_CUADRILLA, @IDSITE, @CORRESITE, 3, CONVERT(date, GETDATE()), GETDATE(), SYSTEM_USER)`);
}

// Obtiene las asignaciones del día actual
export async function obtenerAsignacionesDia() {
  const pool = await sql.connect(process.env.SQLSERVER_CONN_STR as string);
  const result = await pool.request()
    .query(`SELECT ID_CUADRILLA, IDSITE, CORRESITE, FECHA, USUARIOCREACION
            FROM CUADRILLAASIGNACION
            WHERE CONVERT(date, FECHA) = CONVERT(date, GETDATE())`);
  return result.recordset;
}

export const config = {
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

export async function querySqlServer(query: string) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error al conectar o consultar SQL Server:', err);
    throw err;
  }
}

// Asegurarse de que executeQuery esté exportada correctamente
// Si ya existe, solo asegurarse que sea 'export function executeQuery'
// Si no existe, agregar una función dummy temporal para evitar errores
// (El usuario debe reemplazar la lógica real si es necesario)

// Ejemplo de exportación:
export async function executeQuery(query: string): Promise<any[]> {
  return await querySqlServer(query);
}

// Si ya existe, omitir este bloque
