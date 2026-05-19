const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const jwt = require('jsonwebtoken')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())

const rutasPublicas = [
  { path: '/api/auth',      method: 'POST' },
  { path: '/api/servicios', method: 'GET'  },
  { path: '/api/resenas',   method: 'GET'  },
]

const verificarToken = (req, res, next) => {
  const esPublica = rutasPublicas.some(
    r => req.path.startsWith(r.path) && req.method === r.method
  )
  if (esPublica) return next()

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.headers['x-usuario-id']     = payload.id
    req.headers['x-usuario-rol']    = payload.rol
    req.headers['x-usuario-nombre'] = payload.nombre
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

app.use(verificarToken)

const proxyOpts = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      res.status(502).json({ error: 'Servicio no disponible' })
    }
  }
})

app.use('/api/auth',      createProxyMiddleware(proxyOpts(process.env.USUARIOS_URL)))
app.use('/api/empleados', createProxyMiddleware(proxyOpts(process.env.USUARIOS_URL)))
app.use('/api/servicios', createProxyMiddleware(proxyOpts(process.env.CATALOGO_URL)))
app.use('/api/citas',     createProxyMiddleware(proxyOpts(process.env.CITAS_URL)))
app.use('/api/resenas',   createProxyMiddleware(proxyOpts(process.env.RESENAS_URL)))

const PORT = 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway corriendo en puerto ${PORT}`)
})