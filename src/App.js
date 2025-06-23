import React, { useState } from 'react';
import Factura from './vistas/facturas';      
import FacturasAPI from './vistas/FacturasApi'; 

function App() {
  const [vista, setVista] = useState('crear');

  return (
    <div>
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
        <button onClick={() => setVista('crear')}> Crear Factura</button>
        <button onClick={() => setVista('ver')}> Ver Facturas</button>
      </nav>

      {vista === 'crear' ? <Factura /> : <FacturasAPI />}
    </div>
  );
}

export default App;
