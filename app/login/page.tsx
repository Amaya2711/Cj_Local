'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    clave_usuario: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      if (!formData.nombre_usuario || !formData.clave_usuario) {
        setMensaje('Por favor, complete todos los campos');
        setLoading(false);
        return;
      }
      // Validar usuario contra SQL Server
      const res = await fetch('/api/sqlserver-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idusuario: formData.nombre_usuario,
          clave: formData.clave_usuario
        })
      });
      const data = await res.json();
      if (res.ok && data && Array.isArray(data) && data.length > 0) {
        // Usuario válido, guardar en localStorage
        const userData = {
          id_usuario: formData.nombre_usuario,
          nombre_usuario: formData.nombre_usuario,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        setMensaje('¡Acceso exitoso! Redirigiendo...');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMensaje('Usuario o contraseña incorrectos');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error en login:', error);
      setMensaje('Error del sistema. Intente nuevamente');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '20px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#007bff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '36px',
            color: 'white'
          }}>
            🔐
          </div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1a202c'
          }}>
              CJ Local
          </h1>
          <p style={{
            margin: 0,
            color: '#64748b',
            fontSize: '14px'
          }}>
            Ingrese sus credenciales para acceder
          </p>
        </div>
        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Usuario
            </label>
            <input
              type="text"
              name="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={handleInputChange}
              placeholder="Ingrese su nombre de usuario"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s',
                outline: 'none',
                backgroundColor: loading ? '#f1f5f9' : 'white'
              }}
              onFocus={e => e.target.style.borderColor = '#007bff'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              name="clave_usuario"
              value={formData.clave_usuario}
              onChange={handleInputChange}
              placeholder="Ingrese su contraseña"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'border-color 0.2s',
                outline: 'none',
                backgroundColor: loading ? '#f1f5f9' : 'white'
              }}
              onFocus={e => e.target.style.borderColor = '#007bff'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          {/* Mensaje de estado */}
          {mensaje && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: mensaje.includes('exitoso') ? '#d1fae5' : '#fee2e2',
              border: `1px solid ${mensaje.includes('exitoso') ? '#10b981' : '#ef4444'}`,
              color: mensaje.includes('exitoso') ? '#065f46' : '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {mensaje}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              backgroundColor: loading ? '#10b98180' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Verificando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
        {/* Enlaces adicionales */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{
            margin: '0 0 10px 0',
            fontSize: '12px',
            color: '#64748b'
          }}>
            ¿Necesita ayuda? Contacte al administrador del sistema
          </p>
          <Link 
            href="/" 
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontSize: '12px'
            }}
          >
            Volver al inicio
          </Link>
        </div>
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
