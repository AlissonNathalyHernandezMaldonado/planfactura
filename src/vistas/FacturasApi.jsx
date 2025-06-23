import React, { useState, useEffect } from 'react';

export default function FacturasAPI() {
  const [facturas, setFacturas] = useState([]);
  const [nuevoTotal, setNuevoTotal] = useState({});
  const [loading, setLoading] = useState(false);
  const API_URL = "https://facturaelectronica-gphkd8a6fvephedb.brazilsouth-01.azurewebsites.net/backend/api_facturas.php";

  const obtenerFacturas = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFacturas(data);
    } catch (error) {
      alert(" Error al obtener facturas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerFacturas();
  }, []);

  const actualizarFactura = async (id) => {
    const total = parseFloat(nuevoTotal[id]);
    if (isNaN(total)) return alert("Ingresa un total válido");

    try {
      const res = await fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total })
      });
      const data = await res.json();
      alert(data.mensaje || data.error);
      obtenerFacturas();
    } catch {
      alert(" Error al actualizar");
    }
  };

  const eliminarFactura = async (id) => {
    if (!window.confirm("¿Eliminar esta factura?")) return;

    try {
      const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      alert(data.mensaje || data.error);
      obtenerFacturas();
    } catch {
      alert(" Error al eliminar");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Lista de Facturas</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : facturas.length === 0 ? (
        <p>No hay facturas registradas</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Nuevo Total</th>
              <th>Actualizar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.cliente}</td>
                <td>{f.fecha_emision}</td>
                <td>${f.total}</td>
                <td>
                  <input
                    type="number"
                    placeholder="Nuevo total"
                    value={nuevoTotal[f.id] || ""}
                    onChange={(e) =>
                      setNuevoTotal({ ...nuevoTotal, [f.id]: e.target.value })
                    }
                    style={{ width: 80 }}
                  />
                </td>
                <td>
                  <button onClick={() => actualizarFactura(f.id)}>Actualizar</button>
                </td>
                <td>
                  <button onClick={() => eliminarFactura(f.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
      <button onClick={obtenerFacturas}> Recargar Facturas</button>
    </div>
  );
}
