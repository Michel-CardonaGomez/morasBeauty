import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Calendar, Settings, Scissors } from "lucide-react";
import "./Navbar.css";
import { marcarCierreIntencional } from "../api/axios";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    marcarCierreIntencional();
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <Scissors size={20} />
        <span>Moras Beauty</span>
      </Link>

      <div className="navbar-links">
        {!usuario && (
          <>
            <Link to="/login" className="nav-link">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn-dorado">
              Registrarse
            </Link>
          </>
        )}

        {usuario?.rol === "cliente" && (
          <>
            <Link to="/mis-citas" className="nav-link">
              <Calendar size={16} /> Mis citas
            </Link>
            <button onClick={handleLogout} className="nav-link btn-logout">
              <LogOut size={16} /> Salir
            </button>
          </>
        )}

        {usuario?.rol === "empleado" && (
          <>
            <Link to="/agenda" className="nav-link">
              <Calendar size={16} /> Mi agenda
            </Link>
            <button onClick={handleLogout} className="nav-link btn-logout">
              <LogOut size={16} /> Salir
            </button>
          </>
        )}

        {usuario?.rol === "admin" && (
          <>
            <Link to="/admin/servicios" className="nav-link">
              Servicios
            </Link>
            <Link to="/admin/empleados" className="nav-link">
              Empleados
            </Link>
            <Link to="/admin/citas" className="nav-link">
              Citas
            </Link>
            <button onClick={handleLogout} className="nav-link btn-logout">
              <LogOut size={16} /> Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
