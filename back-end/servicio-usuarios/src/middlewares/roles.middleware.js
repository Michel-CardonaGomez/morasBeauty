const soloAdmin = (req, res, next) => {
  if (req.headers['x-usuario-rol'] !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

const soloEmpleado = (req, res, next) => {
  if (req.headers['x-usuario-rol'] !== 'empleado') {
    return res.status(403).json({ error: 'Acceso solo para empleados' })
  }
  next()
}

module.exports = { soloAdmin, soloEmpleado }