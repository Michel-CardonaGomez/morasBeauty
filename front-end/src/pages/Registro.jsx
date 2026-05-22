import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Scissors } from "lucide-react";
import "./Auth.css";

const Registro = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmar: "",
  });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validarPassword = (password) => {
    if (password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    if (!/[a-zA-Z]/.test(password))
      return "La contraseña debe contener al menos una letra";
    if (!/[0-9]/.test(password))
      return "La contraseña debe contener al menos un número";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorPassword = validarPassword(form.password);
    if (errorPassword) {
      toast.error(errorPassword);
      return;
    }

    if (form.password !== form.confirmar) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!/^\d{10}$/.test(form.telefono)) {
      toast.error("El teléfono debe tener 10 dígitos");
      return;
    }

    setCargando(true);
    try {
      const { data } = await api.post("/api/auth/registro", {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
      });
      login(data);
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al registrarse");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Scissors size={28} color="#C9A84C" />
          <span>Moras Beauty</span>
        </div>
        <h2>Crear cuenta</h2>
        <p className="auth-sub">Únete a nuestra comunidad</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="3001234567"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="password-hints">
            <span className={form.password.length >= 8 ? "hint ok" : "hint"}>
              ✓ Mínimo 8 caracteres
            </span>
            <span
              className={/[a-zA-Z]/.test(form.password) ? "hint ok" : "hint"}
            >
              ✓ Al menos una letra
            </span>
            <span className={/[0-9]/.test(form.password) ? "hint ok" : "hint"}>
              ✓ Al menos un número
            </span>
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-dorado btn-full"
            disabled={cargando}
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
