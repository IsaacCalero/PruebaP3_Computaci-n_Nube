import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/dashboard/metrics')
      .then(({ data }) => setMetrics(data))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar las métricas.'));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {!metrics && !error && <p>Cargando métricas...</p>}
      {metrics && (
        <div className="grid">
          <div className="metric">
            <div className="value">{metrics.totalClientes}</div>
            <div className="label">Total de clientes</div>
          </div>
          <div className="metric">
            <div className="value" style={{ color: 'var(--success)' }}>{metrics.membresiasActivas}</div>
            <div className="label">Membresías activas</div>
          </div>
          <div className="metric">
            <div className="value" style={{ color: 'var(--danger)' }}>{metrics.membresiasVencidas}</div>
            <div className="label">Membresías vencidas</div>
          </div>
          <div className="metric">
            <div className="value">{metrics.asistenciasTotal}</div>
            <div className="label">Asistencias totales</div>
          </div>
          <div className="metric">
            <div className="value">{metrics.asistenciasHoy}</div>
            <div className="label">Asistencias de hoy</div>
          </div>
          <div className="metric">
            <div className="value">{metrics.clientesActivos}</div>
            <div className="label">Clientes activos</div>
          </div>
          <div className="metric">
            <div className="value">${Number(metrics.totalRecaudado).toFixed(2)}</div>
            <div className="label">Total recaudado</div>
          </div>
        </div>
      )}
    </div>
  );
}
