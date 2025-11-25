import React, { useState } from 'react';

export default function LoginForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave }),
    });
    const data = await res.json();
    if (data.success) {
      onLogin(data.usuario);
    } else {
      setError(data.error || 'Error de autenticación');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '0 auto', marginTop: 100 }}>
      <h2>Iniciar Sesión</h2>
      <div>
        <label>Usuario</label>
        <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} required />
      </div>
      <div>
        <label>Clave</label>
        <input type="password" value={clave} onChange={e => setClave(e.target.value)} required />
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <button type="submit" style={{ marginTop: 16 }}>Ingresar</button>
    </form>
  );
}
