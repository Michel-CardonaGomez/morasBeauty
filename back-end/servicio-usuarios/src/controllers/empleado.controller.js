const service = require('../services/usuario.service')

const listar = async (req, res) => {
  try {
    const empleados = await service.listarEmpleados()
    res.json(empleados)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const crear = async (req, res) => {
  try {
    const empleado = await service.crearEmpleado(req.body)
    res.status(201).json(empleado)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const actualizar = async (req, res) => {
  try {
    const empleado = await service.actualizarEmpleado(req.params.id, req.body)
    res.json(empleado)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const obtenerHorario = async (req, res) => {
  try {
    const horario = await service.obtenerHorario(req.params.id)
    res.json(horario)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const obtenerEmpleadosPorServicio = async (req, res) => {
  try {
    const empleados = await service.obtenerEmpleadosPorServicio(req.params.servicioId)
    res.json(empleados)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const getEmpleado = async (req, res) => {
  try {
    const {id} = req.params
    const empleado = await service.getEmpleado(id)

    if (!empleado) {
      return res.status(404).json({
        error: 'Empleado no encontrado'
      })
    }

    return res.json(empleado)

  } catch (error) {

    console.error(error)

    return res.status(500).json({
      error: 'Error interno'
    })
  }
}

const desactivar = async (req, res) => {
  try {
    const empleado = await service.desactivarEmpleado(req.params.id)
    res.json(empleado)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const activar = async (req, res) => {
  try {
    const empleado = await service.activarEmpleado(req.params.id)
    res.json(empleado)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

module.exports = { listar, crear, actualizar, obtenerHorario, obtenerEmpleadosPorServicio, getEmpleado, desactivar, activar }