const router = require('express').Router()
const controller = require('../controllers/cita.controller')

const soloRol = (...roles) => (req, res, next) => {
  if (!roles.includes(req.headers['x-usuario-rol'])) {
    return res.status(403).json({ error: 'No tienes permiso para esta acción' })
  }
  next()
}

router.get('/disponibilidad',                                    controller.disponibilidad)
router.get('/',               soloRol('admin'),                  controller.listarTodas)
router.get('/mis-citas',      soloRol('cliente'),                controller.misCitas)
router.get('/hoy',            soloRol('empleado'),               controller.citasHoy)
router.post('/',              soloRol('cliente'),                 controller.agendar)
router.get('/:id', controller.obtenerPorId)
router.patch('/:id/cancelar', soloRol('cliente', 'admin'),       controller.cancelar)
router.patch('/:id/completar',soloRol('empleado'),               controller.completar)

module.exports = router