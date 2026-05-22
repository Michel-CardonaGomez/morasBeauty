const service = require('../services/resena.service')

const crear = async (req, res) => {
  try {
    const clienteId     = req.headers['x-usuario-id']
    const clienteNombre = req.headers['x-usuario-nombre']
    const resena = await service.crear({ ...req.body, clienteId, clienteNombre })
    res.status(201).json(resena)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const listarPorServicio = async (req, res) => {
  try {
    const resultado = await service.listarPorServicio(req.params.servicioId)
    res.json(resultado)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const listarTodas = async (req, res) => {
  try {
    const resenas = await service.listarTodas()
    res.json(resenas)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { crear, listarPorServicio, listarTodas }