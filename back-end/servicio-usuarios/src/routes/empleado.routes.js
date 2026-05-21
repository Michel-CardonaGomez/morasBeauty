const router = require('express').Router()
const controller = require('../controllers/empleado.controller')
const { soloAdmin } = require('../middlewares/roles.middleware')

router.get('/', controller.listar)
router.post('/',          soloAdmin, controller.crear)
router.put('/:id',        soloAdmin, controller.actualizar)
router.get('/:id/horario',           controller.obtenerHorario)
router.get('/servicio/:servicioId', controller.obtenerEmpleadosPorServicio)
router.get('/:id',                     controller.getEmpleado)
router.patch('/:id/desactivar', soloAdmin, controller.desactivar) 
router.patch('/:id/activar',    soloAdmin, controller.activar)  

module.exports = router