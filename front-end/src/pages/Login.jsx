import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Scissors } from 'lucide-react'
import './Auth.css'

const Login = () => {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

const handleSubmit = async e => {
  e.preventDefault()
  setCargando(true)
  try {
    const { data } = await api.post('/api/auth/login', form)
    login(data)
    toast.success(`Bienvenida, ${data.usuario.nombre}`)
    if (data.usuario.rol === 'admin')         navigate('/admin/servicios')
    else if (data.usuario.rol === 'empleado') navigate('/agenda')
    else navigate('/')
  } catch (e) {
    const mensaje = e.response?.data?.error || 'Credenciales incorrectas'
    toast.error(mensaje, { duration: 4000 })
  } finally {
    setCargando(false)
  }
}

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Scissors size={28} color="#C9A84C" />
          <span>Moras Beauty</span>
        </div>
        <h2>Iniciar sesión</h2>
        <p className="auth-sub">Bienvenida de vuelta</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
          <button type="submit" className="btn-dorado btn-full" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}

export default Login