import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const linkClass = ({ isActive }) => `navbar-link${isActive ? ' active' : ''}`;

  return (
    <header className="navbar">
      <div className="navbar-brand">Gladiator Fitness</div>
      <nav className="navbar-links">
        {user.role === 'admin' && (
          <>
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/clientes" className={linkClass}>Clientes</NavLink>
            <NavLink to="/membresias" className={linkClass}>Membresías</NavLink>
            <NavLink to="/asistencia" className={linkClass}>Asistencia</NavLink>
          </>
        )}
        {user.role === 'cliente' && (
          <NavLink to="/" end className={linkClass}>Mi cuenta</NavLink>
        )}
      </nav>
      <div className="navbar-user">
        <span>{user.username} ({user.role})</span>
        <button className="btn btn-outline" onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
