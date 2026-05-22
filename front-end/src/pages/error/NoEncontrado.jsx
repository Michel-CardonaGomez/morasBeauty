import { useNavigate } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import './Error.css'

const NoEncontrado = () => {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-card">
        <div className="error-icon error-icon-info">
          <SearchX size={40} />
        </div>
        <p className="error-code">404</p>
        <h1>Página no encontrada</h1>
        <p className="error-desc">
          La página que buscas no existe o fue movida a otra dirección.
        </p>
        <div className="error-acciones">
          <button className="btn-dorado" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoEncontrado