const service = require('../services/cita.service')

const disponibilidad = async (req, res) => {
  try {
    const { empleadoId, fecha, servicioId } = req.query
    if (!empleadoId || !fecha || !servicioId)
      return res.status(400).json({ error: 'empleadoId, fecha y servicioId son requeridos' })
    const result = await service.obtenerDisponibilidad(empleadoId, fecha, servicioId)
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const agendar = async (req, res) => {
  try {
    const clienteId = req.headers['x-usuario-id']
    const cita = await service.agendar({ ...req.body, clienteId })
    res.status(201).json(cita)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const listarTodas = async (req, res) => {
  try {
    const citas = await service.listarTodas(req.query)
    res.json(citas)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const misCitas = async (req, res) => {
  try {
    const clienteId = req.headers['x-usuario-id']
    const citas = await service.listarPorCliente(clienteId)
    res.json(citas)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const citasHoy = async (req, res) => {
  try {
    const empleadoId = req.headers['x-usuario-id']
    const citas = await service.listarHoy(empleadoId)
    res.json(citas)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const cancelar = async (req, res) => {
  try {
    const rol      = req.headers['x-usuario-rol']
    const usuarioId = req.headers['x-usuario-id']
    const cita = await service.cancelar(req.params.id, rol, usuarioId)
    res.json(cita)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const completar = async (req, res) => {
  try {
    const empleadoId = req.headers['x-usuario-id']
    const cita = await service.completar(req.params.id, empleadoId)
    res.json(cita)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const obtenerPorId = async (req, res) => {
  try {
    const cita = await service.obtenerPorId(req.params.id)
    if (!cita) return res.status(404).json({ error: 'Cita no encontrada' })
    res.json(cita)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = {
  disponibilidad, agendar, listarTodas,
  misCitas, citasHoy, cancelar, completar,
  obtenerPorId  // <- nuevo
}

module.exports = {
  disponibilidad, agendar, listarTodas,
  misCitas, citasHoy, cancelar, completar, obtenerPorId
}