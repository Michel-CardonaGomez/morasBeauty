import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

const obtenerUsuarioInicial = () => {
  try {
    const usuarioGuardado = localStorage.getItem('usuario')
    const token = localStorage.getItem('token')
    if (usuarioGuardado && token) return JSON.parse(usuarioGuardado)
    return null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(obtenerUsuarioInicial)

  const login = (datos) => {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(datos.usuario))
    setUsuario(datos.usuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

