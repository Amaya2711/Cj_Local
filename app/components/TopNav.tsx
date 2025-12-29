'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

// Menú de navegación principal - Actualizado con Google Maps
const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio' },
  { href: '/asignacion', label: 'Asignacion' },
  { href: '/formulario', label: 'Formulario' },
  { href: '/googlemaps', label: 'Google Mapsqqq' },
  { href: '/aprobar', label: 'Aprobar' },
];

// Renderizar el menú principal
export default function TopNav() {
  const pathname = usePathname();
  return (
    <nav style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 24px', display: 'flex', gap: 24 }}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            color: pathname === item.href ? '#007bff' : '#1e293b',
            fontWeight: pathname === item.href ? 'bold' : 500,
            textDecoration: 'none',
            fontSize: 18,
            opacity: item.disabled ? 0.5 : 1,
            pointerEvents: item.disabled ? 'none' : 'auto',
            padding: '4px 12px',
            borderRadius: 6,
            background: pathname === item.href ? '#e0e7ff' : 'transparent',
            transition: 'background 0.2s',
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
