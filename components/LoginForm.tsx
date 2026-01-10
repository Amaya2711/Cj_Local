// Declarar pb_Usuario en la interfaz Window para TypeScript
declare global {
  interface Window {
    pb_Usuario: string;
  }
}
import React, { useState } from 'react';

export default function LoginForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [sqlParamsPantalla, setSqlParamsPantalla] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Popup eliminado
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, clave }),
    });
    const data = await res.json();
    if (data.success) {
      onLogin(data.usuario);
      window.pb_Usuario = usuario; // Asignar el valor del input usuario
      localStorage.setItem('pb_Usuario', usuario); // Guardar también en localStorage
      console.log('pb_Usuario en localStorage después de login:', localStorage.getItem('pb_Usuario'));
      // Obtener coordenadas y registrar en cuadrilla_coordenadas
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const latitud = position.coords.latitude;
          const altitud = position.coords.longitude;
          await fetch('/api/cuadrilla-coordenada', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, latitud, altitud })
          });
        }, (geoError) => {
          // Si falla la geolocalización, continuar sin registrar coordenadas
         setError(data.error || 'Error de autenticación 2');
        });
      }
    } else {
      setError(data.error || 'Error de autenticación');
      localStorage.removeItem('pb_Usuario'); // Limpiar pb_Usuario si el login falla
    }
  };

  // handleShowEnvs eliminado

  return (
    <>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', padding: 24, background: '#f9f9f9', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Iniciar sesión</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label>
            Usuario:
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </label>
          <label>
            Clave:
            <input
              type="password"
              value={clave}
              onChange={e => setClave(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
            />
          </label>
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
            <button type="submit">Ingresar</button>
          </div>
        </div>
      </form>
      {/* Popup eliminado */}
    </>
  );
}

  // Archivo eliminado: LoginForm.tsx
