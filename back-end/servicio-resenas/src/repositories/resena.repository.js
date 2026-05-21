const Resena = require('../models/resena.model')

const crear = (data) => Resena.create(data)

const listarPorServicio = (servicioId) => Resena.find({ servicioId })
  .sort({ creadoEn: -1 })

const listarTodas = () => Resena.find().sort({ creadoEn: -1 })

const buscarPorCita = (citaId) => Resena.findOne({ citaId })

const promedioServicio = (servicioId) => Resena.aggregate([
  { $match: { servicioId } },
  { $group: {
    _id: '$servicioId',
    promedio: { $avg: '$calificacion' },
    total:    { $sum: 1 }
  }}
])

module.exports = {
  crear, listarPorServicio, listarTodas,
  buscarPorCita, promedioServicio
}