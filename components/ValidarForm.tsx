import React, { useState } from 'react';

interface ValidarFormProps {
  onSuccess: () => void;
}

// Datos de conexión extraídos de lib/sqlServerClient.ts
const DB_CONFIG = {
  user: 'sa',
  server: '161.132.4.67',
  database: 'n8n_produccion',
  port: 1433
};

const ValidarForm: React.FC<ValidarFormProps> = ({ onSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sql, setSql] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const sqlQuery = `SELECT * FROM USUARIO WHERE ID_USUARIO = '${usuario}' AND CLAVE = '${clave}'`;
    setSql(sqlQuery);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError('Usuario o clave incorrectos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minWidth: 360,
      maxWidth: 400,
      margin: '0 auto',
      marginTop: 48,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 4px 32px #0002',
      padding: 32,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      border: '1px solid #e5e7eb',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img src="/logo-empresa.png" alt="Logo" style={{ height: 48, marginBottom: 8 }} />
        <h2 style={{ fontWeight: 700, color: '#1e293b', margin: 0 }}>Acceso al Sistema</h2>
        <div style={{ color: '#64748b', fontSize: 15, marginTop: 4 }}>Ingrese sus credenciales empresariales</div>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, color: '#334155' }}>Usuario</label>
          <input
            type="text"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
            placeholder="Ingrese su usuario"
            autoFocus
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, color: '#334155' }}>Clave</label>
          <input
            type="password"
            value={clave}
            onChange={e => setClave(e.target.value)}
            required
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 6, fontSize: 16 }}
            placeholder="Ingrese su clave"
          />
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
          {loading ? 'Validando...' : 'Ingresar'}
        </button>
      </form>
      {sql && (
        <div style={{ marginTop: 24, background: '#f1f5f9', borderRadius: 6, padding: 12, fontSize: 13, color: '#334155', fontFamily: 'monospace' }}>
          <b>Consulta SQL utilizada:</b>
          <div style={{ marginTop: 4, wordBreak: 'break-all' }}>{sql}</div>
          <div style={{ marginTop: 12 }}>
            <b>Datos de conexión:</b>
            <div>Servidor: {DB_CONFIG.server}:{DB_CONFIG.port}</div>
            <div>Base de datos: {DB_CONFIG.database}</div>
            <div>Usuario: {DB_CONFIG.user}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidarForm;
