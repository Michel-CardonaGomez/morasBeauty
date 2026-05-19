const service = require('../services/servicio.service')

const listar = async (req, res) => {
  try {
    const rol = req.headers['x-usuario-rol']
    const servicios = rol === 'admin' ? await service.listarTodos() : await service.listar()
    res.json(servicios)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

const obtenerPorId = async (req, res) => {
  try {
    const servicio = await service.obtenerPorId(req.params.id)
    res.json(servicio)
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

const crear = async (req, res) => {
  try {
    const servicio = await service.crear(req.body)
    res.status(201).json(servicio)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const actualizar = async (req, res) => {
  try {
    const servicio = await service.actualizar(req.params.id, req.body)
    res.json(servicio)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const eliminar = async (req, res) => {
  try {
    await service.eliminar(req.params.id)
    res.json({ mensaje: 'Servicio desactivado correctamente' })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

const subirFoto = async (req, res) => {
  try {
    const { id } = req.params
    const { orden } = req.body

    const resultado = await service.agregarFoto(
      id,
      req.file,
      orden
    )

    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const eliminarFoto = async (req, res) => {
  try {
    await service.eliminarFoto(req.params.id)
    res.json({ mensaje: 'Foto eliminada correctamente' })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

module.exports = {
  listar, obtenerPorId, crear,
  actualizar, eliminar, subirFoto, eliminarFoto
}