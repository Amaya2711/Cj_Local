import type { Metadata } from 'next'
import { AuthProvider } from './context/AuthContext'
import AppContent from './components/AppContent'

export const metadata: Metadata = {
  title: 'Sistema de Gestión - Rork',
  description: 'Sistema de Gestión con Sites, Cuadrillas y Tickets',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
        <body>
          <AuthWrapper>{children}</AuthWrapper>
        </body>
import './globals.css';
import AuthWrapper from '../components/AuthWrapper';

export const metadata = {
  title: 'CjTelecom BaseWeb',
  description: 'Sistema de gestión de cuadrillas y sites',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
}
