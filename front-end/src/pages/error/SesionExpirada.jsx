import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import './Error.css'

const SesionExpirada = () => {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon error-icon-warning">
          <Clock size={40} />
        </div>
        <p className="error-code">401</p>
        <h1>Tu sesión ha expirado</h1>
        <p className="error-desc">
          Llevas un tiempo sin actividad y por seguridad cerramos tu sesión
          automáticamente. Inicia sesión de nuevo para continuar.
        </p>
        <div className="error-acciones">
          <button className="btn-dorado" onClick={() => navigate('/login')}>
            Iniciar sesión
          </button>
          <button className="btn-outline" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default SesionExpirada