import React, { useState } from 'react';
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

function Cuadrilla_Asignar() {
  const [mensajeBuscar, setMensajeBuscar] = useState<string>('');

  // Define the type for your data rows
  interface DataType {
    NroInterno: string;
    // Add more fields as needed
  }

  const columns: ColumnsType<DataType> = [
    {
      title: 'NroInterno',
      dataIndex: 'NroInterno',
      key: 'NroInterno',
    },
  ];

  const dataSource: DataType[] = [
    {
      NroInterno: '1',
      // Add more fields as needed
    },
    // Add more data rows as needed
  ];

  // Estado para controlar si está grabando
  const [grabando, setGrabando] = useState(false);

  const handleGrabar = async () => {
    if (grabando) return;
    setGrabando(true);
    try {
      // Implementa aquí la lógica de guardado
      // await tuFuncionDeGrabar();
    } finally {
      setGrabando(false);
    }
  };

  return (
    <>
      <div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowKey={(record) => record.NroInterno}
          style={{ width: '100%' }}
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