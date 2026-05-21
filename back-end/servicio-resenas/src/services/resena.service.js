const repo = require('../repositories/resena.repository')
const axios = require('axios')
require('dotenv').config()

const CITAS_URL = process.env.CITAS_URL

const crear = async ({ clienteId, clienteNombre, servicioId, citaId, calificacion, contenido }) => {
  if (!clienteId || !clienteNombre || !servicioId || !citaId || !calificacion || !contenido)
    throw new Error('Todos los campos son obligatorios')

  if (calificacion < 1 || calificacion > 5)
    throw new Error('La calificación debe ser entre 1 y 5')

  // Verifica que no haya reseñado esta cita antes
  const existe = await repo.buscarPorCita(citaId)
  if (existe) throw new Error('Ya dejaste una reseña para esta cita')

  // Verifica que la cita exista, sea del cliente y esté completada
  const { data: cita } = await axios.get(
    `${CITAS_URL}/api/citas/${citaId}`
  ).catch(() => { throw new Error('Cita no encontrada') })

  if (cita.clienteId !== clienteId)
    throw new Error('Esta cita no te pertenece')

  if (cita.estado !== 'completada')
    throw new Error('Solo puedes reseñar citas completadas')

  if (cita.servicioId !== servicioId)
    throw new Error('La cita no corresponde a este servicio')

  return repo.crear({ clienteId, clienteNombre, servicioId, citaId, calificacion, contenido })
}

const listarPorServicio = async (servicioId) => {
  const resenas = await repo.listarPorServicio(servicioId)
  const promedio = await repo.promedioServicio(servicioId)

  return {
    resenas,
    promedio: promedio[0]?.promedio?.toFixed(1) || 0,
    total:    promedio[0]?.total || 0
  }
}

const listarTodas = () => repo.listarTodas()

module.exports = { crear, listarPorServicio, listarTodas }