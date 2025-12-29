'use client';
import React, { useState, useEffect } from 'react';

interface AppContentProps {
  children: React.ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  // Renderizar solo el contenido principal y los children
  return (
    <main style={{ padding: '16px', maxWidth: 1300, margin: '0 auto' }}>
      {children}
    </main>
  );
}
