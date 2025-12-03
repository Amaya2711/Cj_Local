import React, { useState } from 'react';

function Cuadrilla_Asignar() {
  const [mensajeBuscar, setMensajeBuscar] = useState<string>('');

  return (
    <div>
      {/* ...otros elementos... */}
      <button onClick={() => setMensajeBuscar('Buscando')}>Buscar</button>
      <div style={{ marginTop: '10px', color: 'blue', fontWeight: 'bold' }}>{mensajeBuscar}</div>
      {/* ...otros elementos... */}
    </div>
  );
}

export default Cuadrilla_Asignar;