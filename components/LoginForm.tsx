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
  const [usuarioIngresado, setUsuarioIngresado] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mostrar los parámetros de conexión SQLSERVER en un alert
    const sqlParams = [
      `SQLSERVER_USER: ${process.env.SQLSERVER_USER}`,
      `SQLSERVER_PASSWORD: ${process.env.SQLSERVER_PASSWORD}`,
      `SQLSERVER_HOST: ${process.env.SQLSERVER_HOST}`,
      `SQLSERVER_DB: ${process.env.SQLSERVER_DB}`,
      `SQLSERVER_PORT: ${process.env.SQLSERVER_PORT}`
    ].join('\n');
    alert('Parámetros de conexión SQLSERVER:\n' + sqlParams);

    setUsuarioIngresado(usuario); // Guardar el usuario ingresado para mostrarlo siempre
    setShowPopup(true); // Mostrar el popup
    console.log('Popup disparado con usuario:', usuario);
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

  return (
    <>
      <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '0 auto', marginTop: 100 }}>
        <h2>Iniciar Sesión</h2>
        <div>
          <label>Usuario</label>
          <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} required />
        </div>
        <div>
          <label>Clave asd</label>
          <input type="password" value={clave} onChange={e => setClave(e.target.value)} required />
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <button type="submit" style={{ marginTop: 16 }}>Ingresar</button>
      </form>
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 300, textAlign: 'center', boxShadow: '0 4px 32px #0002' }}>
            <h3>Usuario Mostrar</h3>
            <div style={{ fontSize: 20, color: '#2563eb', margin: '16px 0' }}><b>{usuarioIngresado}</b></div>
            <button onClick={() => setShowPopup(false)} style={{ marginTop: 16, padding: '8px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}

  // Archivo eliminado: LoginForm.tsx
