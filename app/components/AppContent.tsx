'use client';
import React, { useState, useEffect } from 'react';

interface AppContentProps {
  children: React.ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  // Obtener usuario actual de localStorage (sin contexto de autenticación)
  const [usuarioActual, setUsuarioActual] = useState('');
  useEffect(() => {
    let usuario = '';
    if (typeof window !== 'undefined') {
      usuario = localStorage.getItem('usuario') || '';
    }
    setUsuarioActual(usuario || 'Invitado');
  }, []);

  // Renderizar siempre la aplicación (sin loading ni logout)
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
