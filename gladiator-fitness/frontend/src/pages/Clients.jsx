import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const emptyForm = {
  id: null,
  cedula: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  fechaNacimiento: '',
  direccion: '',
  username: '',
  password: '',
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadClients(q = '') {
    const { data } = await axiosClient.get('/clients', { params: q ? { q } : {} });
    setClients(data);
  }

  useEffect(() => {
    loadClients();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadClients(search);
  }

  function startEdit(client) {
    setEditing(true);
    setForm({
      id: client.id,
      cedula: client.cedula,
      nombres: client.nombres,
      apellidos: client.apellidos,
      email: client.email || '',
      telefono: client.telefono || '',
      fechaNacimiento: client.fechaNacimiento || '',
      direccion: client.direccion || '',
      username: client.user?.username || '',
      password: '',
    });
    setMessage('');
    setError('');
  }

  function resetForm() {
    setEditing(false);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (editing) {
        await axiosClient.put(`/clients/${form.id}`, form);
        setMessage('Cliente actualizado correctamente.');
      } else {
        await axiosClient.post('/clients', form);
        setMessage('Cliente registrado correctamente.');
      }
      resetForm();
      loadClients(search);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el cliente.');
    }
  }

  async function toggleActive(client) {
    setError('');
    setMessage('');
    try {
      const action = client.active ? 'deactivate' : 'activate';
      await axiosClient.patch(`/clients/${client.id}/${action}`);
      loadClients(search);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estado del cliente.');
    }
  }

  return (
    <div>
      <h2>Gestión de clientes</h2>

      <div className="card">
        <h3>{editing ? 'Editar cliente' : 'Registrar cliente'}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Cédula
              <input value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} required />
            </label>
            <label>
              Nombres
              <input value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
            </label>
            <label>
              Apellidos
              <input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Teléfono
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </label>
            <label>
              Fecha de nacimiento
              <input
                type="date"
                value={form.fechaNacimiento || ''}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
              />
            </label>
            <label>
              Dirección
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </label>
            {!editing && (
              <>
                <label>
                  Usuario de acceso (opcional)
                  <input
                    value={form.username}
                    placeholder="Por defecto: la cédula"
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </label>
                <label>
                  Contraseña (opcional)
                  <input
                    type="password"
                    value={form.password}
                    placeholder="Por defecto: la cédula"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </label>
              </>
            )}
          </div>
          <div className="toolbar">
            <button className="btn" type="submit">{editing ? 'Guardar cambios' : 'Registrar cliente'}</button>
            {editing && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Clientes</h3>
        </div>
        <form className="toolbar" onSubmit={handleSearch}>
          <input
            placeholder="Buscar por nombre, apellido, cédula o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-small" type="submit">Buscar</button>
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => { setSearch(''); loadClients(''); }}
          >
            Limpiar
          </button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.cedula}</td>
                <td>{c.nombres} {c.apellidos}</td>
                <td>{c.email || '-'}</td>
                <td>{c.telefono || '-'}</td>
                <td>{c.user?.username || '-'}</td>
                <td>
                  <span className={`badge ${c.active ? 'badge-success' : 'badge-danger'}`}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="toolbar" style={{ margin: 0 }}>
                    <button className="btn btn-outline btn-small" onClick={() => startEdit(c)}>Editar</button>
                    <button className="btn btn-small" onClick={() => toggleActive(c)}>
                      {c.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={7}>No hay clientes registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
