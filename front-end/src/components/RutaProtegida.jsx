import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RutaProtegida = ({ children, roles }) => {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/sesion-expirada" />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/no-autorizado" />

  return children
}

export default RutaProtegida