import React, { useState } from 'react';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import type { ColumnsType } from 'antd/es/table';

function Cuadrilla_Asignar() {
        // Estados para los campos del formulario
        const [formCuadrilla, setFormCuadrilla] = useState('');
        const [formEmpleado, setFormEmpleado] = useState('');
        const [formAsignacion, setFormAsignacion] = useState('');
        const [formFecha, setFormFecha] = useState('');
    const [mensajeAsignar, setMensajeAsignar] = useState<string>('');
  const [mensajeBuscar, setMensajeBuscar] = useState<string>('');

  // Define the type for your data rows
  interface DataType {
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

  // Eliminar dataSource, solo usar gridData

  // Estado para controlar si está grabando
  const [grabando, setGrabando] = useState(false);

  // Estado para los datos del grid
  const [gridData, setGridData] = useState<DataType[]>([]);

  // Simulación del evento Asignar
  const handleAsignar = (nuevoRegistro: any) => {
    // Solo agregar los campos permitidos
    const registroFiltrado: DataType = {
      id_cuadrilla: nuevoRegistro.id_cuadrilla,
      Empleado: nuevoRegistro.Empleado,
      Asignacion: nuevoRegistro.Asignacion,
      Fecha: nuevoRegistro.Fecha
    };
    setGridData([...gridData, registroFiltrado]);
    setMensajeAsignar('HOLA');
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
        {mensajeAsignar && (
          <div style={{ marginTop: 10, color: 'green', fontWeight: 'bold' }}>{mensajeAsignar}</div>
        )}
        <div style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder="Cuadrilla"
            value={formCuadrilla}
            onChange={e => setFormCuadrilla(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Empleado"
            value={formEmpleado}
            onChange={e => setFormEmpleado(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Asignacion"
            value={formAsignacion}
            onChange={e => setFormAsignacion(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="date"
            placeholder="Fecha"
            value={formFecha}
            onChange={e => setFormFecha(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <Button type="primary" onClick={() => handleAsignar({
            id_cuadrilla: formCuadrilla,
            Empleado: formEmpleado,
            Asignacion: formAsignacion,
            Fecha: formFecha
          })}>Asignar</Button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button type="primary" onClick={handleGrabar} disabled={grabando}>Grabar</Button>
      </div>
      {/* ...otros elementos... */}
    </>
  );
}

export default Cuadrilla_Asignar;