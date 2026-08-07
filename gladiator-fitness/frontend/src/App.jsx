import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientAccount from './pages/ClientAccount';
import Clients from './pages/Clients';
import Memberships from './pages/Memberships';
import Attendance from './pages/Attendance';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <Dashboard /> : <ClientAccount />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute roles={['admin']}>
                <Clients />
              </ProtectedRoute>
            }
          />

          <Route
            path="/membresias"
            element={
              <ProtectedRoute roles={['admin']}>
                <Memberships />
              </ProtectedRoute>
            }
          />

          <Route
            path="/asistencia"
            element={
              <ProtectedRoute roles={['admin']}>
                <Attendance />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
