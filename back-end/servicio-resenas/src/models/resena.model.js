const mongoose = require('mongoose')

const resenaSchema = new mongoose.Schema({
  clienteId:    { type: String, required: true },
  clienteNombre:{ type: String, required: true },
  servicioId:   { type: String, required: true },
  citaId:       { type: String, required: true, unique: true },
  calificacion: { type: Number, required: true, min: 1, max: 5 },
  contenido:    { type: String, required: true, trim: true }
}, {
  timestamps: { createdAt: 'creadoEn' }
})

module.exports = mongoose.model('Resena', resenaSchema)