'use client';
import { useState, useEffect } from 'react';

export default function NuevaCuadrilla() {
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [usuariosSql, setUsuariosSql] = useState<{ nombreempleado: string; IdEmpleadoCj: number }[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const [filtroEmpleado, setFiltroEmpleado] = useState('');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const filteredEmpleados = usuariosSql.filter(u =>
    u.nombreempleado &&
    u.nombreempleado.toLowerCase().includes(filtroEmpleado.toLowerCase())
  );

  useEffect(() => {
    async function fetchUsuariosSql() {
      setLoadingUsuarios(true);
      try {
        const res = await fetch('/api/sqlserver-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `select b.nombreempleado, a.IdEmpleadoCj from EmpleadoCjdetalle a left outer join empleadocj b on a.IdEmpleadoCj = b.IdEmpleado where b.idactivo=1 and b.NombreEmpleado is not null order by b.NombreEmpleado` })
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsuariosSql(data);
        }
      } catch (error) {
        // Manejar error si es necesario
      }
      setLoadingUsuarios(false);
    }
    fetchUsuariosSql();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setMensaje("");
    const form = e.target;
    const nombre = form.nombre.value.trim();
    const zona = form.zona.value.trim();
    const telefono = form.telefono.value.trim();
    const correo = form.correo.value.trim();
    const empleadoCj = empleadoSeleccionado;

    let newErrors: any = {};
    if (!nombre) newErrors.nombre = "El nombre es obligatorio.";
    if (!zona) newErrors.zona = "La zona es obligatoria.";
    if (!empleadoCj) newErrors.empleadoCj = "Debe seleccionar un empleado.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Aquí puedes agregar la lógica para guardar la cuadrilla, por ejemplo usando supabase
      // await supabase.from('cuadrillas').insert([{ nombre, zona, telefono, correo, empleadoCj }]);
      setMensaje("Cuadrilla registrada correctamente.");
      form.reset();
      setEmpleadoSeleccionado("");
    } catch (error) {
      setMensaje("Error al registrar la cuadrilla.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 32 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Registrar Nueva Cuadrilla</h2>
      {/* Usuarios SQL Server */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <h4 style={{ marginBottom: 8 }}>Usuarios disponibles en SQL Server:</h4>
        <input
          type="text"
          placeholder="Escriba para buscar empleado..."
          value={filtroEmpleado}
          onChange={e => {
            setFiltroEmpleado(e.target.value);
            setEmpleadoSeleccionado('');
            setActiveSuggestion(0);
          }}
          onKeyDown={e => {
            if (!filteredEmpleados.length) return;
            if (e.key === 'ArrowDown') {
              setActiveSuggestion(prev => Math.min(prev + 1, filteredEmpleados.length - 1));
            } else if (e.key === 'ArrowUp') {
              setActiveSuggestion(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
              const empleado = filteredEmpleados[activeSuggestion];
              if (empleado) {
                setEmpleadoSeleccionado(empleado.IdEmpleadoCj.toString());
                setFiltroEmpleado(empleado.nombreempleado);
              }
            }
          }}
          style={{ width: '100%', marginBottom: 8, padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
          autoComplete="off"
        />
        {loadingUsuarios ? (
          <div>Cargando usuarios...</div>
        ) : (
          filtroEmpleado && !empleadoSeleccionado && (
            <ul style={{
              position: 'absolute',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              width: '100%',
              maxHeight: 180,
              overflowY: 'auto',
              margin: 0,
              padding: 0,
              listStyle: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              {filteredEmpleados.map((u, idx) => (
                <li
                  key={u.IdEmpleadoCj}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    background: idx === activeSuggestion ? '#e0e7ff' : 'transparent',
                  }}
                  onMouseEnter={() => setActiveSuggestion(idx)}
                  onClick={() => {
                    setEmpleadoSeleccionado(u.IdEmpleadoCj.toString());
                    setFiltroEmpleado(u.nombreempleado);
                  }}
                >
                  {u.nombreempleado}
                </li>
              ))}
            </ul>
          )
        )}
        {/* Campo oculto para guardar el ID seleccionado */}
        <input type="hidden" name="empleadoCj" value={empleadoSeleccionado} />
      </div>
      <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label>Nombre *</label>
            <input name="nombre" type="text" className="input" autoComplete="off" />
            {errors.nombre && <div className="error">{errors.nombre}</div>}
          </div>
          <div style={{ marginBottom: 18 }}>
            <label>Zona *</label>
            <input name="zona" type="text" className="input" autoComplete="off" />
            {errors.zona && <div className="error">{errors.zona}</div>}
          </div>
          <div style={{ marginBottom: 18 }}>
            <label>Teléfono</label>
            <input name="telefono" type="text" className="input" autoComplete="off" />
            {errors.telefono && <div className="error">{errors.telefono}</div>}
          </div>
          <div style={{ marginBottom: 18 }}>
            <label>Correo</label>
            <input name="correo" type="email" className="input" autoComplete="off" />
            {errors.correo && <div className="error">{errors.correo}</div>}
          </div>
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', marginTop: 24 }}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          {mensaje && <div className="mensaje" style={{ marginTop: 18 }}>{mensaje}</div>}
        </form>
      </div>
    );
}
