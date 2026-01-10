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
  const [sqlParamsPantalla, setSqlParamsPantalla] = useState<string>('');

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
      // Mostrar parámetros de conexión en consola y pantalla si el error es de acceso no autorizado y estamos en producción
      if ((data.error === 'Acceso no autorizado. Por favor, inicie sesión.' || error === 'Acceso no autorizado. Por favor, inicie sesión.') && process.env.NODE_ENV === 'production') {
        fetch('/api/mostrar-config-sqlserver')
          .then(resp => resp.json())
          .then(cfg => {
            const paramsStr = Object.entries(cfg)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n');
            console.log('Parametros SQLSERVER usados en Vercel:', cfg);
            setSqlParamsPantalla(paramsStr);
          })
          .catch(() => {
            console.log('No se pudo obtener los parametros SQLSERVER desde Vercel');
            setSqlParamsPantalla('No se pudo obtener los parametros SQLSERVER desde Vercel');
          });
      }
    }
  };

  const handleShowEnvs = async () => {
    try {
      const resp = await fetch('/api/mostrar-todas-envs');
      const data = await resp.json();
      const envs = data.envs || {};
      const envList = Object.entries(envs)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      alert('Variables de entorno en Vercel:\n' + envList);
    } catch (e) {
      alert('No se pudo obtener las variables de entorno');
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '0 auto', marginTop: 24 }}>
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
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'center', alignItems: 'center' }}>
          <button type="submit">Ingresar</button>
          <button
            type="button"
            onClick={handleShowEnvs}
            style={{
              background: '#eab308',
              color: '#222',
              border: '2px solid #f59e42',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #eab30833',
              letterSpacing: 1,
              textTransform: 'uppercase',
              zIndex: 1000
            }}
          >
            👁️ Ver envs Vercel
          </button>
        </div>
      </form>
      {sqlParamsPantalla && (
        <div style={{ background: '#fffbe6', color: '#222', border: '1px solid #eab308', borderRadius: 8, padding: 16, margin: '24px auto', maxWidth: 400, fontSize: 15, fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
          <b>Parámetros SQLSERVER usados en Vercel:</b>
          <br />
          {sqlParamsPantalla}
        </div>
      )}
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
