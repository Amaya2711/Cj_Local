import React, { useState } from 'react';

// Puedes personalizar los combos según tus necesidades
const GoogleMapsForm: React.FC = () => {
  const [combo1, setCombo1] = useState('');
  const [combo2, setCombo2] = useState('');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>Formulario de Google Maps</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div>
          <label>Combo 1:&nbsp;</label>
          <select value={combo1} onChange={e => setCombo1(e.target.value)}>
            <option value="">Seleccione una opción</option>
            <option value="opcion1">Opción 1</option>
            <option value="opcion2">Opción 2</option>
          </select>
        </div>
        <div>
          <label>Combo 2:&nbsp;</label>
          <select value={combo2} onChange={e => setCombo2(e.target.value)}>
            <option value="">Seleccione una opción</option>
            <option value="opcionA">Opción A</option>
            <option value="opcionB">Opción B</option>
          </select>
        </div>
        {/* Puedes agregar más combos aquí */}
      </form>
      <div style={{ width: '100%', height: 500, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px #0002' }}>
        <iframe
          title="Mapa de Perú"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6339647.964024019!2d-81.410697!3d-9.189967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8e573b5b7e1%3A0x1e6e7e7e7e7e7e7e!2sPer%C3%BA!5e0!3m2!1ses-419!2spe!4v1700000000000!5m2!1ses-419!2spe"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default GoogleMapsForm;
