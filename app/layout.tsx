
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import GoogleMapsScriptLoader from '../components/GoogleMapsScriptLoader';
import AppContent from './components/AppContent';
import { AuthProvider } from './context/AuthContext';

export const metadata: Metadata = {
  title: 'Sistema de Gestión - Rork',
  description: 'Sistema de Gestión con Sites, Cuadrillas y Tickets',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
