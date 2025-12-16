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
  { href: '/sites', label: 'Sites' },
  { href: '/asignacion', label: 'Asignacion' },
  { href: '/googlemaps', label: 'Google Maps' },
  { href: '/formulario', label: 'Formulariossss' },
];

// El menú principal no debe ser visible
export default function TopNav() {
  return null;
}
