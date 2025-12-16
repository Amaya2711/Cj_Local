'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// import TopNav from './TopNav'; // Verificar que este import apunte a app/components/TopNav.tsx

interface AppContentProps {
  children: React.ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  const { isAuthenticated, userData, USUARIO_ACTUAL, logout, loading } = useAuth();

  // Obtener usuario actual de contexto o localStorage, y actualizar si cambia
  const [usuarioActual, setUsuarioActual] = useState('');
  useEffect(() => {
    // Priorizar nombre_usuario, luego nombre_empleado
    let usuario = userData?.nombre_usuario || userData?.nombre_empleado;
    if (!usuario && typeof window !== 'undefined') {
      usuario = localStorage.getItem('usuario') || '';
    }
    setUsuarioActual('Mas2711_2')
    //setUsuarioActual(usuario || '');
  }, [userData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#64748b' }}>Verificando acceso...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si está autenticado, mostrar la aplicación completa con navegación
  return (
    <div>
      {/* Barra superior de usuario */}
      <div style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px'
      }}>
        <div>
          <span style={{ fontWeight: '500' }}>
            Bienvenido, {usuarioActual}
          </span>
          <span style={{ marginLeft: '15px', color: '#94a3b8' }}>
            Usuario: {usuarioActual}
          </span>
        </div>
        {logout && (
          <button
            onClick={logout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #475569',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#475569')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Navegación principal usando TopNav */}
      {/* <header>
        <TopNav />
      </header> */}

      {/* Contenido principal */}
      <main style={{ padding: '16px', maxWidth: 1300, margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
