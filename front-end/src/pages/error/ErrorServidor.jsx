import { useNavigate } from 'react-router-dom'
import { ServerCrash } from 'lucide-react'
import './Error.css'

const ErrorServidor = () => {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon error-icon-danger">
          <ServerCrash size={40} />
        </div>
        <p className="error-code">500</p>
        <h1>Error del servidor</h1>
        <p className="error-desc">
          Algo salió mal en nuestro servidor. Por favor intenta de nuevo
          en unos minutos.
        </p>
        <div className="error-acciones">
          <button className="btn-dorado" onClick={() => window.location.reload()}>
            Reintentar
          </button>
          <button className="btn-outline" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorServidor