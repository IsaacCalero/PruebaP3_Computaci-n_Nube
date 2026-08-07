import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function Attendance() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [attendances, setAttendances] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function loadClients() {
    const { data } = await axiosClient.get('/clients', { params: { active: true } });
    setClients(data);
  }

  async function loadAttendances() {
    const { data } = await axiosClient.get('/attendance');
    setAttendances(data);
  }

  useEffect(() => {
    loadClients();
    loadAttendances();
  }, []);

  async function handleCheckIn(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const { data } = await axiosClient.post('/attendance/checkin', { clientId });
      setResult({ ok: true, message: data.message });
      loadAttendances();
    } catch (err) {
      // La API responde 403 cuando la membresia esta vencida/inexistente
      // o el cliente esta inactivo: se muestra el motivo tal cual.
      setResult({ ok: false, message: err.response?.data?.message || 'No se pudo registrar el ingreso.' });
      loadAttendances();
    }
  }

  return (
    <div>
      <h2>Control de asistencia</h2>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3>Registrar entrada</h3>
        <form onSubmit={handleCheckIn}>
          <div className="form-row">
            <label>
              Cliente
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                <option value="">Seleccione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} ({c.cedula})</option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn" type="submit">Registrar ingreso</button>
        </form>
        {result && (
          <div className={`alert ${result.ok ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.75rem' }}>
            {result.message}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Historial de asistencias</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Cliente</th>
              <th>Resultado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.fechaHora).toLocaleString()}</td>
                <td>{a.client?.nombres} {a.client?.apellidos}</td>
                <td>
                  <span className={`badge ${a.resultado === 'permitido' ? 'badge-success' : 'badge-danger'}`}>
                    {a.resultado}
                  </span>
                </td>
                <td>{a.motivo || '-'}</td>
              </tr>
            ))}
            {attendances.length === 0 && (
              <tr><td colSpan={4}>No hay asistencias registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
