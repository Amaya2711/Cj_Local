"use client";
import { useEffect, useState } from 'react';

export default function InformePage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true);
        const res = await fetch('/api/sharepoint-files');
        if (!res.ok) throw new Error('Error al obtener archivos');
        const data = await res.json();
        // Asegura que siempre sea un array
        setFiles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
      <h1 style={{ color: '#007bff', marginBottom: '24px' }}>Informe</h1>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Archivos SharePoint</h2>
      {loading && <p>Cargando archivos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && Array.isArray(files) && (
        <ul style={{ paddingLeft: '20px' }}>
          {files.length === 0 && <li>No hay archivos disponibles.</li>}
          {files.map((file) => (
            <li key={file.id} style={{ marginBottom: '10px' }}>
              <a
                href={file.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff' }}
              >
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
