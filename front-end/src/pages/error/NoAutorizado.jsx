import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import './Error.css'

const NoAutorizado = () => {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon error-icon-warning">
          <ShieldOff size={40} />
        </div>
        <p className="error-code">403</p>
        <h1>Acceso no autorizado</h1>
        <p className="error-desc">
          No tienes permisos para ver esta página. Si crees que es un error,
          contacta al administrador.
        </p>
        <div className="error-acciones">
          <button className="btn-outline" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoAutorizado