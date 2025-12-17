'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';


// Tipos para el contexto
interface UserData {
  id_usuario: string;
  nombre_usuario: string;
  id_empleado: string;
  nombre_empleado: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  USUARIO_ACTUAL: string; // Constante global con nombre_usuario
  login: (nombreUsuario: string, claveUsuario: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // CONSTANTE GLOBAL - Siempre disponible en todo el sistema
  const USUARIO_ACTUAL = userData?.nombre_usuario || '';

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const clearAuth = () => {
    setIsAuthenticated(false);
    setUserData(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
  };

  const checkStoredAuth = () => {
    try {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userDataStr = localStorage.getItem('userData');

      if (authStatus === 'true' && userDataStr) {
        const storedUserData = JSON.parse(userDataStr);
        
        // Verificar que la sesión no sea muy antigua (8 horas)
        const loginTime = new Date(storedUserData.loginTime);
        const now = new Date();
        const diffHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (diffHours < 8) {
          setIsAuthenticated(true);
          setUserData(storedUserData);
          console.log('Sesión restaurada para:', storedUserData.nombre_usuario);
        } else {
          // Sesión expirada
          console.log('Sesión expirada');
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (nombreUsuario: string, claveUsuario: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Iniciando login para:', nombreUsuario);
      // Aquí deberías hacer la petición al backend para autenticar
      // Simulación de autenticación exitosa
      const fakeUserData = {
        id_usuario: '1',
        nombre_usuario: nombreUsuario,
        id_empleado: '123',
        nombre_empleado: 'Empleado Demo',
        loginTime: new Date().toISOString()
      };
      setIsAuthenticated(true);
      setUserData(fakeUserData);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(fakeUserData));
      return { success: true, message: 'Login exitoso' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error en login' };
    }
  };

  const logout = () => {
    console.log('Cerrando sesión para:', USUARIO_ACTUAL);
    clearAuth();
  };

  const value: AuthContextType = {
    isAuthenticated,
    userData,
    USUARIO_ACTUAL, // ← CONSTANTE GLOBAL DISPONIBLE EN TODO EL SISTEMA
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

// Función para obtener el usuario actual desde cualquier parte del sistema
export function getUsuarioActual(): string {
  if (typeof window === 'undefined') return '';
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.nombre_usuario || '';
    }
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
  }
  return '';
}