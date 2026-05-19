const router = require('express').Router()
const controller = require('../controllers/servicio.controller')
const { upload } = require('../cloudinary')

const soloAdmin = (req, res, next) => {
  if (req.headers['x-usuario-rol'] !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

router.get('/',                                              controller.listar)
router.get('/:id',                                           controller.obtenerPorId)
router.post('/',              soloAdmin,                     controller.crear)
router.put('/:id',            soloAdmin,                     controller.actualizar)
router.delete('/:id',         soloAdmin,                     controller.eliminar)
router.post('/:id/fotos',     soloAdmin, upload.single('foto'), controller.subirFoto)
router.delete('/fotos/:id',   soloAdmin,                     controller.eliminarFoto)

module.exports = router