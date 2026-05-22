const router = require('express').Router()
const controller = require('../controllers/resena.controller')

const soloRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.headers['x-usuario-rol'])) {
    return res.status(403).json({ error: 'No tienes permiso para esta acción' })
  }
  next()
}

router.get('/',                          soloRol('admin'),    controller.listarTodas)
router.get('/:servicioId',                                    controller.listarPorServicio)
router.post('/',                         soloRol('cliente'),  controller.crear)

module.exports = router