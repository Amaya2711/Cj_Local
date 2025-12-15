// Revisión: Validar si existen layouts globales o imports indirectos de menús.
// Por favor, muestra el contenido completo de este archivo para revisión.
// Revisión: Buscar referencias a 'Cuadrillas' o menús hardcodeados en este archivo.

import type { Metadata } from 'next'
import { AuthProvider } from './context/AuthContext'
import AppContent from './components/AppContent'


export const metadata: Metadata = {
  title: 'Sistema de Gestión - Rork',
  description: 'Sistema de Gestión con Sites, Cuadrillas y Tickets',
}
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
