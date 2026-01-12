import sql from 'mssql';

export function getSqlConfig() {
  return {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'CjTelecom',
    options: {
      encrypt: false, // Cambia a true si usas Azure
      trustServerCertificate: true
    }
  };
}

