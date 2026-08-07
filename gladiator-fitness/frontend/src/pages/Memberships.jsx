import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const emptyType = { nombre: '', descripcion: '', duracionDias: '', precio: '' };
const emptyAssign = {
  clientId: '',
  membershipTypeId: '',
  fechaInicio: new Date().toISOString().slice(0, 10),
  monto: '',
  metodoPago: 'efectivo',
};

export default function Memberships() {
  const [types, setTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [typeForm, setTypeForm] = useState(emptyType);
  const [assignForm, setAssignForm] = useState(emptyAssign);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadAll() {
    const [typesRes, clientsRes, membershipsRes] = await Promise.all([
      axiosClient.get('/membership-types'),
      axiosClient.get('/clients', { params: { active: true } }),
      axiosClient.get('/memberships'),
    ]);
    setTypes(typesRes.data);
    setClients(clientsRes.data);
    setMemberships(membershipsRes.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateType(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosClient.post('/membership-types', typeForm);
      setTypeForm(emptyType);
      setMessage('Tipo de membresía creado.');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear el tipo de membresía.');
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosClient.post('/memberships', assignForm);
      setAssignForm({ ...emptyAssign, fechaInicio: new Date().toISOString().slice(0, 10) });
      setMessage('Membresía asignada y pago registrado correctamente.');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo asignar la membresía.');
    }
  }

  function handleTypeChange(membershipTypeId) {
    const type = types.find((t) => String(t.id) === membershipTypeId);
    setAssignForm((prev) => ({
      ...prev,
      membershipTypeId,
      monto: type ? type.precio : prev.monto,
    }));
  }

  return (
    <div>
      <h2>Gestión de membresías</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card">
        <h3>Crear tipo de membresía</h3>
        <form onSubmit={handleCreateType}>
          <div className="form-row">
            <label>
              Nombre
              <input value={typeForm.nombre} onChange={(e) => setTypeForm({ ...typeForm, nombre: e.target.value })} required />
            </label>
            <label>
              Duración (días)
              <input
                type="number"
                min="1"
                value={typeForm.duracionDias}
                onChange={(e) => setTypeForm({ ...typeForm, duracionDias: e.target.value })}
                required
              />
            </label>
            <label>
              Precio
              <input
                type="number"
                step="0.01"
                min="0"
                value={typeForm.precio}
                onChange={(e) => setTypeForm({ ...typeForm, precio: e.target.value })}
              />
            </label>
            <label>
              Descripción
              <input value={typeForm.descripcion} onChange={(e) => setTypeForm({ ...typeForm, descripcion: e.target.value })} />
            </label>
          </div>
          <button className="btn" type="submit">Crear tipo</button>
        </form>

        <table style={{ marginTop: '1rem' }}>
          <thead>
            <tr><th>Nombre</th><th>Duración</th><th>Precio</th></tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>{t.duracionDias} días</td>
                <td>${Number(t.precio).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Asignar membresía a un cliente</h3>
        <form onSubmit={handleAssign}>
          <div className="form-row">
            <label>
              Cliente
              <select
                value={assignForm.clientId}
                onChange={(e) => setAssignForm({ ...assignForm, clientId: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} ({c.cedula})</option>
                ))}
              </select>
            </label>
            <label>
              Tipo de membresía
              <select
                value={assignForm.membershipTypeId}
                onChange={(e) => handleTypeChange(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre} ({t.duracionDias} días)</option>
                ))}
              </select>
            </label>
            <label>
              Fecha de inicio
              <input
                type="date"
                value={assignForm.fechaInicio}
                onChange={(e) => setAssignForm({ ...assignForm, fechaInicio: e.target.value })}
                required
              />
            </label>
            <label>
              Monto del pago
              <input
                type="number"
                step="0.01"
                min="0"
                value={assignForm.monto}
                onChange={(e) => setAssignForm({ ...assignForm, monto: e.target.value })}
                required
              />
            </label>
            <label>
              Método de pago
              <select
                value={assignForm.metodoPago}
                onChange={(e) => setAssignForm({ ...assignForm, metodoPago: e.target.value })}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </label>
          </div>
          <button className="btn" type="submit">Asignar membresía y registrar pago</button>
        </form>
      </div>

      <div className="card">
        <h3>Membresías registradas</h3>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => (
              <tr key={m.id}>
                <td>{m.client?.nombres} {m.client?.apellidos}</td>
                <td>{m.membershipType?.nombre}</td>
                <td>{m.fechaInicio}</td>
                <td>{m.fechaVencimiento}</td>
                <td>
                  <span className={`badge ${m.estado === 'activa' ? 'badge-success' : 'badge-danger'}`}>
                    {m.estado}
                  </span>
                </td>
                <td>
                  {m.payment
                    ? `$${Number(m.payment.monto).toFixed(2)} (${m.payment.metodoPago})`
                    : '-'}
                </td>
              </tr>
            ))}
            {memberships.length === 0 && (
              <tr><td colSpan={6}>No hay membresías registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
