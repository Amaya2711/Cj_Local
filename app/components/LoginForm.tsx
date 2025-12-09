'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

export default function LoginForm() {
    const [sqlTestResult, setSqlTestResult] = useState('');

    // Función para probar usuario en SQL Server
    const handleSqlServerTest = async () => {
      setSqlTestResult('');
      if (!formData.nombre_usuario || !formData.clave_usuario) {
        setSqlTestResult('Por favor, complete usuario y clave');
        return;
      }
      try {
        const queryText = `SELECT NombreDispositivo FROM usuario WHERE idusuario='${formData.nombre_usuario}' AND clave='${formData.clave_usuario}'`;
        const res = await fetch('/api/sqlserver-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idusuario: formData.nombre_usuario,
            clave: formData.clave_usuario
          })
        });
        const data = await res.json();
        if (res.ok && data && data.length > 0) {
          setSqlTestResult(`Consulta ejecutada: ${queryText}\nDispositivo: ${data[0].NombreDispositivo}`);
          // Iniciar sesión en la app si la consulta fue exitosa
          const result = await login(formData.nombre_usuario, formData.clave_usuario);
          if (result.success) {
            setMensaje('Acceso exitoso por SQL Server');
          } else {
            setMensaje('Acceso SQL Server válido, pero error en login de app');
          }
        } else {
          let errorMsg = `Consulta ejecutada: ${queryText}\nUsuario no encontrado o clave incorrecta en SQL Server`;
          if (data && data.error) {
            errorMsg += `\nError: ${data.error}`;
          }
          if (data && data.stack) {
            errorMsg += `\nStack trace:\n${data.stack}`;
          }
          setSqlTestResult(errorMsg);
          setMensaje('Error de conexión o credenciales inválidas en SQL Server');
        }
      } catch (err: any) {
        setSqlTestResult('Error al consultar SQL Server');
        setMensaje(err?.message || 'Error al consultar SQL Server');
      }
    };
  const auth = useAuth() as unknown as { login?: (username: string, password: string) => Promise<{ success: boolean; message: string }> } | null;
  type LoginFunction = (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  let login: LoginFunction;
  if (auth && typeof auth === 'object' && typeof auth.login === 'function') {
    login = auth.login;
  } else {
    return (
      <div style={{ color: 'white', background: '#dc2626', padding: 32, borderRadius: 12, margin: 32, textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
        <div>❌ Error de autenticación</div>
        <div style={{ marginTop: 12 }}>
          El contexto <b>AuthContext</b> no provee la función <b>login</b>.<br />
          Verifica que <b>AuthContext</b> exporte correctamente la función <b>login</b>.<br />
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 'normal', background: '#fff', color: '#dc2626', borderRadius: 8, padding: 8 }}>
            Ejemplo: <pre style={{ margin: 0 }}>{`<AuthContext.Provider value={{ login, ... }}>`}</pre>
          </div>
        </div>
      </div>
    );
  }
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

    // Validaciones básicas
    if (!formData.nombre_usuario || !formData.clave_usuario) {
      setMensaje('Por favor, complete todos los campos');
      setLoading(false);
      return;
    }

    // Intentar login usando el contexto
    const result = await login(formData.nombre_usuario, formData.clave_usuario);
    
    if (result.success) {
      // Guardar usuario en variable global y localStorage
      if (typeof window !== 'undefined') {
        window.pb_Usuario = formData.nombre_usuario;
        localStorage.setItem('pb_Usuario', formData.nombre_usuario);
        window.dispatchEvent(new Event('pbUsuarioChange'));
      }
      setMensaje(`Acceso exitoso. Usuario: ${formData.nombre_usuario}`);
      // El contexto manejará automáticamente la autenticación
      // No necesitamos redirigir manualmente
    } else {
      setMensaje(result.message);
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
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            padding: '8px',
            border: '3px solid #007bff'
          }}>
            <Image
              src="/logo.png"
              alt="CJ Telecom Logo"
              width={60}
              height={60}
              style={{ 
                objectFit: 'contain'
              }}
            />
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
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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

          {/* Botón de acceso */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#94a3b8' : '#007bff',
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
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#007bff';
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
              'Iniciar Sesión'
            )}
          </button>

          {/* Botón de prueba SQL Server */}
          <button
            type="button"
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onClick={handleSqlServerTest}
          >
            Iniciar sesión SQL
          </button>

          {/* Resultado de la prueba SQL Server */}
          {sqlTestResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '12px',
              backgroundColor: sqlTestResult.includes('válido') ? '#d1fae5' : '#fee2e2',
              border: `1px solid ${sqlTestResult.includes('válido') ? '#10b981' : '#ef4444'}`,
              color: sqlTestResult.includes('válido') ? '#065f46' : '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {sqlTestResult}
            </div>
          )}
        </form>


      </div>

      {/* CSS para animación */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}