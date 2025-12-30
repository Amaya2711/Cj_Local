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
    const today = new Date();
    setHoy(today.toISOString().slice(0, 10));
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
  const pieData = {
    labels: Object.keys(valorIniCounts),
    datasets: [
      {
        label: 'Total',
        data: Object.values(valorIniCounts),
        backgroundColor: [
          '#2563eb', '#059669', '#f59e42', '#ef4444', '#a21caf', '#0ea5e9', '#eab308', '#10b981', '#f43f5e', '#6366f1'
        ],
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
  const barDatasets = valorInis.map((valorIni, idx) => ({
    label: valorIni,
    data: empleados.map(emp =>
      dataHoy.filter(d => (d.Empleado ?? 'Sin Empleado') === emp && (d.ValorIni ? String(d.ValorIni) : 'Sin ValorIni') === valorIni).length
    ),
    backgroundColor: [
      '#2563eb', '#059669', '#f59e42', '#ef4444', '#a21caf', '#0ea5e9', '#eab308', '#10b981', '#f43f5e', '#6366f1'
    ][idx % 10],
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
          {/* Pie chart por ValorIni */}
          <div style={{ maxWidth: 500, margin: '0 auto 32px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24 }}>
            <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Distribución por ValorIni</h3>
            <Pie data={pieData} />
          </div>
          {/* Bar chart por Empleado y ValorIni */}
          <div style={{ maxWidth: 900, margin: '0 auto 32px auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24 }}>
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
