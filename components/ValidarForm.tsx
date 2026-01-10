import React, { useState } from 'react';

interface ValidarFormProps {
  onSuccess: () => void;
}


const ValidarForm: React.FC<ValidarFormProps> = ({ onSuccess }) => {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Obtener los parámetros de conexión SQLSERVER desde el backend
    try {
      const resp = await fetch('/api/mostrar-config-sqlserver');
      const config = await resp.json();
      const sqlParams = [
        `SQLSERVER_USER: ${config.SQLSERVER_USER}`,
        `SQLSERVER_PASSWORD: ${config.SQLSERVER_PASSWORD}`,
        `SQLSERVER_HOST: ${config.SQLSERVER_HOST}`,
        `SQLSERVER_DB: ${config.SQLSERVER_DB}`,
        `SQLSERVER_PORT: ${config.SQLSERVER_PORT}`
      ].join('\n');
      alert('Parámetros de conexión SQLSERVER:\n' + sqlParams);
    } catch (e) {
      alert('No se pudo obtener la configuración SQLSERVER');
    }
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
      {/* Visualización de consulta SQL y datos de conexión deshabilitada por seguridad */}
    </div>
  );
};

export default ValidarForm;
