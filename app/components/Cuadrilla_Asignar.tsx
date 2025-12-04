import React, { useState } from 'react';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import type { ColumnsType } from 'antd/es/table';

function Cuadrilla_Asignar() {
  const [mensajeBuscar, setMensajeBuscar] = useState<string>('');

  // Define the type for your data rows
  interface DataType {
    NroInterno: string;
    id_cuadrilla: string;
    Empleado: string;
    Asignacion: string;
    Fecha: string;
  }

  // Solo mostrar columnas explícitamente definidas
  const columns: ColumnsType<DataType> = [
    {
      title: 'id_cuadrilla',
      dataIndex: 'id_cuadrilla',
      key: 'id_cuadrilla',
    },
    {
      title: 'Empleado',
      dataIndex: 'Empleado',
      key: 'Empleado',
    },
    {
      title: 'Asignacion',
      dataIndex: 'Asignacion',
      key: 'Asignacion',
    },
    {
      title: 'Fecha',
      dataIndex: 'Fecha',
      key: 'Fecha',
    },
  ];

  const dataSource: DataType[] = [
    {
      NroInterno: '1',
      id_cuadrilla: 'C01',
      Empleado: 'Juan Perez',
      Asignacion: 'Tarea 1',
      Fecha: '2024-06-01'
    },
    // Add more data rows as needed
  ];

  // Estado para controlar si está grabando
  const [grabando, setGrabando] = useState(false);

  // Estado para los datos del grid
  const [gridData, setGridData] = useState<DataType[]>([]);

  // Simulación del evento Asignar
  const handleAsignar = (nuevoRegistro: any) => {
    // Filtrar solo los campos permitidos
    const registroFiltrado = {
      NroInterno: nuevoRegistro.NroInterno,
      id_cuadrilla: nuevoRegistro.id_cuadrilla,
      Empleado: nuevoRegistro.Empleado,
      Asignacion: nuevoRegistro.Asignacion,
      Fecha: nuevoRegistro.Fecha
    };
    setGridData([...gridData, registroFiltrado]);
  };

  const handleGrabar = async () => {
    if (grabando) return;
    setGrabando(true);
    try {
      // Filtrar registros únicos por NroInterno antes de enviar
      const uniqueData = dataSource.filter((item, index, self) =>
        index === self.findIndex((t) => t.NroInterno === item.NroInterno)
      );
      // Aquí deberías enviar uniqueData al backend
      // await tuFuncionDeGrabar(uniqueData);
    } finally {
      setGrabando(false);
    }
  };

  return (
    <>
      <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={gridData}
          pagination={false}
          rowKey={(record) => record.id_cuadrilla + '-' + record.Fecha}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="primary" onClick={handleGrabar} disabled={grabando}>Grabar</Button>
      </div>
      {/* ...otros elementos... */}
    </>
  );
}

export default Cuadrilla_Asignar;