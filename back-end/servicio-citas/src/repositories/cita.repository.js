const prisma = require('../prismaClient')

const crear = (data) => prisma.cita.create({ data })

const buscarPorId = (id) => prisma.cita.findUnique({ where: { id } })

const listarTodas = async (filtros = {}) => {
  const where = {}

  if (filtros.estado) {
    where.estado = filtros.estado
  }

  if (filtros.fecha) {
    const inicioDia = new Date(filtros.fecha + 'T00:00:00.000Z')
    const finDia    = new Date(filtros.fecha + 'T23:59:59.999Z')
    where.fecha = { gte: inicioDia, lte: finDia }
  }

  return prisma.cita.findMany({
    where,
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }]
  })
}

const listarPorCliente = (clienteId) => prisma.cita.findMany({
  where: { clienteId },
  orderBy: [{ fecha: 'desc' }, { horaInicio: 'asc' }],
})

const listarPorEmpleadoYFecha = (empleadoId, fecha) => prisma.cita.findMany({
  where: {
    empleadoId,
    fecha: new Date(fecha),
    estado: { not: 'cancelada' }
  },
  orderBy: { horaInicio: 'asc' }
})

const listarHoy = (empleadoId) => {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return prisma.cita.findMany({
    where: {
      empleadoId,
      fecha: hoy,
      estado: { not: 'cancelada' }
    },
    orderBy: { horaInicio: 'asc' }
  })
}

const actualizarEstado = (id, estado) => prisma.cita.update({
  where: { id },
  data: { estado }
})

const verificarSolapamiento = (empleadoId, fecha, horaInicio, horaFin) =>
  prisma.cita.findFirst({
    where: {
      empleadoId,
      fecha: new Date(fecha),
      estado: { not: 'cancelada' },
      AND: [
        { horaInicio: { lt: horaFin } },
        { horaFin:    { gt: horaInicio } }
      ]
    }
  })

module.exports = {
  crear, buscarPorId, listarTodas,
  listarPorCliente, listarPorEmpleadoYFecha,
  listarHoy, actualizarEstado, verificarSolapamiento
}