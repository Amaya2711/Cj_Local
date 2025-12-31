import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

interface CuadrillaReporte {
  id: number;
  fecha: string;
  estado: string;
  cuadrilla: string;
  Empleado?: string;
  ValorIni?: number;
  Concatenado?: string;
  // ...otros campos relevantes
}

const PanelKPI: React.FC = () => {
  const [data, setData] = useState<CuadrillaReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoy, setHoy] = useState('');

  useEffect(() => {
    // Obtener la fecha actual en la zona horaria de Perú (America/Lima)
    const getLimaDate = () => {
      try {
        // Obtener la fecha local de Lima como string yyyy-mm-dd
        const limaString = new Date().toLocaleString('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' });
        // en-CA da formato yyyy-mm-dd
        return limaString;
      } catch {
        // Fallback si Intl no está disponible
        const now = new Date();
        // Perú es UTC-5
        const limaOffset = -5 * 60;
        const localOffset = now.getTimezoneOffset();
        const diff = (limaOffset - localOffset) * 60 * 1000;
        const limaDate = new Date(now.getTime() + diff);
        // Obtener yyyy-mm-dd local
        const yyyy = limaDate.getFullYear();
        const mm = String(limaDate.getMonth() + 1).padStart(2, '0');
        const dd = String(limaDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    };
    setHoy(getLimaDate());
    setLoading(true);
    fetch('/api/obtener-cuadrilla-reporte')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => setError('Error al cargar datos'))
      .finally(() => setLoading(false));
  }, []);

  // Filtrar registros del día actual
  const dataHoy = data.filter(d => d.fecha && d.fecha.startsWith(hoy));

  // Agrupar por Empleado, ValorIni, Concatenado
  type GroupKey = string;
  const groupBy = (arr: CuadrillaReporte[], keys: (keyof CuadrillaReporte)[]) => {
    const map = new Map<GroupKey, CuadrillaReporte[]>();
    arr.forEach(item => {
      const groupKey = keys.map(k => item[k] ?? '').join('|');
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(item);
    });
    return map;
  };
  const kpiGroups = groupBy(dataHoy, ['Empleado', 'ValorIni']);

  // --- Pie chart data (por ValorIni) ---
  const valorIniCounts: Record<string, number> = {};
  dataHoy.forEach(d => {
    const key = d.ValorIni ?? 'Sin ValorIni';
    valorIniCounts[key] = (valorIniCounts[key] || 0) + 1;
  });
  // Definir colores fijos por estado
  const estadoColor: Record<string, string> = {
    'ASIGNADO': '#ef4444',
    'CERRADO': '#6366f1',
    'CERRAR': '#6366f1',
    'CIERRE': '#f59e42',
    'NEUTRALIZADO': '#059669',
    'VALIDAR': '#2563eb',
    'Sin ValorIni': '#a21caf',
    // Puedes agregar más estados si es necesario
  };
  // Generar colores para las etiquetas del pie chart
  const pieLabels = Object.keys(valorIniCounts);
  const pieColors = pieLabels.map(label => estadoColor[label?.toUpperCase?.()] || '#eab308');
  const pieData = {
    labels: pieLabels,
    datasets: [
      {
        label: 'Total',
        data: Object.values(valorIniCounts),
        backgroundColor: pieColors,
        borderWidth: 1,
      },
    ],
  };

  // --- Bar chart data (por Empleado y ValorIni) ---
  // Eje X: Empleado, series: ValorIni
  const empleadosSet = new Set<string>();
  const valorIniSet = new Set<string>();
  dataHoy.forEach(d => {
    empleadosSet.add(d.Empleado ?? 'Sin Empleado');
    valorIniSet.add(d.ValorIni ? String(d.ValorIni) : 'Sin ValorIni');
  });
  const empleados = Array.from(empleadosSet).sort();
  const valorInis = Array.from(valorIniSet).sort();
  // Construir matriz de datos
  const barDatasets = valorInis.map((valorIni) => ({
    label: valorIni,
    data: empleados.map(emp =>
      dataHoy.filter(d => (d.Empleado ?? 'Sin Empleado') === emp && (d.ValorIni ? String(d.ValorIni) : 'Sin ValorIni') === valorIni).length
    ),
    backgroundColor: estadoColor[valorIni?.toUpperCase?.()] || '#eab308',
  }));
  const barData = {
    labels: empleados,
    datasets: barDatasets,
  };

  return (
    <div style={{ margin: '32px 0' }}>
      <h2 style={{ color: '#222c36', marginBottom: 16 }}>KPI's</h2>
      {loading ? <div>Cargando...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <>
          {/* Contenedor flex para alinear los gráficos */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', columnGap: 48, rowGap: 0, marginBottom: 32 }}>
            {/* Pie chart por ValorIni */}
            <div style={{ width: 400, minWidth: 300, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400, boxSizing: 'border-box' }}>
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Distribución por ValorIni</h3>
              <div style={{ width: '100%', height: '100%', maxHeight: 320, maxWidth: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pie data={pieData} options={{ maintainAspectRatio: false, responsive: true }} width={320} height={320} />
              </div>
            </div>
            {/* Bar chart por Empleado y ValorIni */}
            <div style={{ width: 600, minWidth: 300, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400, boxSizing: 'border-box' }}>
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Detalle por Empleado y ValorIni</h3>
              <Bar data={barData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: false },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true },
                },
              }} />
            </div>
          </div>
          {/* Tabla de KPIs */}
          <div style={{ marginBottom: 32 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#e5e7eb' }}>
                  <th style={{ padding: 8, border: '1px solid #cbd5e1' }}>Empleado</th>
                  <th style={{ padding: 8, border: '1px solid #cbd5e1' }}>ValorIni</th>
                  <th style={{ padding: 8, border: '1px solid #cbd5e1' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[...kpiGroups.entries()]
                  .map(([key, group]) => {
                    const [Empleado, ValorIni] = key.split('|');
                    return { key, group, Empleado, ValorIni, total: group.length };
                  })
                  .sort((a, b) => {
                    if (a.Empleado < b.Empleado) return -1;
                    if (a.Empleado > b.Empleado) return 1;
                    // Si Empleado es igual, ordenar por ValorIni numérico
                    const valA = Number(a.ValorIni);
                    const valB = Number(b.ValorIni);
                    return valA - valB;
                  })
                  .map(({ key, Empleado, ValorIni, total }) => (
                    <tr key={key}>
                      <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{Empleado}</td>
                      <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{ValorIni}</td>
                      <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default PanelKPI;
