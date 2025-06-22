import React, { useState } from 'react';
import './facturas.css';

export default function Factura() {
  const [form, setForm] = useState({
    cliente_nombre: '',
    cliente_identificacion: '',
    telefono: '',
    fecha_emision: '',
    descripcion: '',
    valor: '',
    observaciones: ''
  });

  const [productos, setProductos] = useState([
    { id: '', nombre: '', cantidad: '', valor: '', total: 0 }
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductoChange = (index, e) => {
    const updated = [...productos];
    updated[index][e.target.name] = e.target.value;

    if (updated[index].cantidad && updated[index].valor) {
      updated[index].total =
        parseFloat(updated[index].cantidad) * parseFloat(updated[index].valor);
    } else {
      updated[index].total = 0;
    }

    setProductos(updated);
  };

  const agregarProducto = () => {
    setProductos([...productos, { id: '', nombre: '', cantidad: '', valor: '', total: 0 }]);
  };

  const enviarFactura = async (e) => {
    e.preventDefault();

    const total = productos.reduce((acc, p) => acc + p.total, 0);

    const data = {
      nombre: form.cliente_nombre,
      identificacion: form.cliente_identificacion,
      telefono: form.telefono,
      fecha_emision: form.fecha_emision,
      observaciones: form.observaciones,
      total: total,
      productos: productos.map((p) => ({
        producto_id: p.id,
        nombre_producto: p.nombre,
        cantidad: Number(p.cantidad),
        valor_unitario: Number(p.valor)
      }))
    };

    try {
      const res = await fetch("http://localhost/factura/backend/registrar_factura.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const respuesta = await res.json();

      if (respuesta.mensaje) {
        alert(respuesta.mensaje);
        setForm({
          cliente_nombre: '',
          cliente_identificacion: '',
          telefono: '',
          fecha_emision: '',
          descripcion: '',
          valor: '',
          observaciones: ''
        });
        setProductos([{ id: '', nombre: '', cantidad: '', valor: '', total: 0 }]);
      } else {
        alert("⚠️ Error al registrar la factura.");
        console.error(respuesta);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">FACTURA ELECTRÓNICA</h2>
      <form onSubmit={enviarFactura} className="form-body">
        <input type="text" name="cliente_nombre" placeholder="Nombre del Cliente" value={form.cliente_nombre} onChange={handleChange} required />
        <input type="text" name="cliente_identificacion" placeholder="Identificación" value={form.cliente_identificacion} onChange={handleChange} required />
        <input type="tel" name="telefono" placeholder="Teléfono (Ej: 573001112233)" value={form.telefono} onChange={handleChange} required />
        <input type="date" name="fecha_emision" value={form.fecha_emision} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción del servicio" value={form.descripcion} onChange={handleChange} required />
        <textarea name="observaciones" placeholder="Observaciones (opcional)" value={form.observaciones} onChange={handleChange} />

        <div className="producto-section">
          <h3>Detalle de productos</h3>
          {productos.map((p, index) => (
            <div className="producto-row" key={index}>
              <div className="producto-col">
                <h4>ID</h4>
                <input type="text" name="id" value={p.id} onChange={(e) => handleProductoChange(index, e)} />
              </div>
              <div className="producto-col">
                <h4>Nombre</h4>
                <input type="text" name="nombre" value={p.nombre} onChange={(e) => handleProductoChange(index, e)} />
              </div>
              <div className="producto-col">
                <h4>Cantidad</h4>
                <input type="number" name="cantidad" value={p.cantidad} onChange={(e) => handleProductoChange(index, e)} />
              </div>
              <div className="producto-col">
                <h4>Valor</h4>
                <input type="number" name="valor" value={p.valor} onChange={(e) => handleProductoChange(index, e)} />
              </div>
              <div className="producto-col">
                <h4>Total</h4>
                <input type="number" value={p.total} readOnly />
              </div>
            </div>
          ))}
          <button type="button" className="agregar-btn" onClick={agregarProducto}>
            + Agregar Producto
          </button>
        </div>

        <div className="total-section">
          Total General: ${productos.reduce((acc, p) => acc + p.total, 0).toFixed(2)}
        </div>

        <button type="submit">Enviar Factura</button>
      </form>
    </div>
  );
}
