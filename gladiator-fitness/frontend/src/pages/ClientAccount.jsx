import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

// Vista simplificada para el rol "cliente": su membresía y su historial
// de asistencias. La gestión (crear/editar/eliminar) queda reservada
// al administrador, tal como pide el enunciado.
export default function ClientAccount() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user?.client?.id) return;
    axiosClient.get('/memberships').then(({ data }) => setMemberships(data));
    axiosClient.get('/attendance').then(({ data }) => setAttendances(data));
    axiosClient.get('/payments').then(({ data }) => setPayments(data));
  }, [user]);

  return (
    <div>
      <h2>Hola, {user.client ? `${user.client.nombres} ${user.client.apellidos}` : user.username}</h2>

      <div className="card">
        <h3>Mis membresías</h3>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Inicio</th>
              <th>Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m) => (
              <tr key={m.id}>
                <td>{m.membershipType?.nombre}</td>
                <td>{m.fechaInicio}</td>
                <td>{m.fechaVencimiento}</td>
                <td>
                  <span className={`badge ${m.estado === 'activa' ? 'badge-success' : 'badge-danger'}`}>
                    {m.estado}
                  </span>
                </td>
              </tr>
            ))}
            {memberships.length === 0 && (
              <tr><td colSpan={4}>No tiene membresías registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Mis pagos</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Membresía</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.fechaPago}</td>
                <td>{p.membership?.membershipType?.nombre}</td>
                <td>${Number(p.monto).toFixed(2)}</td>
                <td>{p.metodoPago}</td>
                <td>
                  <span className={`badge ${p.estado === 'pagado' ? 'badge-success' : 'badge-muted'}`}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={5}>Sin pagos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Mis últimas asistencias</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Resultado</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.fechaHora).toLocaleString()}</td>
                <td>
                  <span className={`badge ${a.resultado === 'permitido' ? 'badge-success' : 'badge-danger'}`}>
                    {a.resultado}
                  </span>
                </td>
                <td>{a.motivo || '-'}</td>
              </tr>
            ))}
            {attendances.length === 0 && (
              <tr><td colSpan={3}>Sin registros de asistencia.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
