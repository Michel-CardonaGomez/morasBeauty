const prisma = require('../prismaClient')

const listar = () => prisma.servicio.findMany({
  where: { activo: true },
  include: { fotos: { orderBy: { orden: 'asc' } } },
  orderBy: { creadoEn: 'desc' }
})

const listarTodos = () => prisma.servicio.findMany({
  include: { fotos: { orderBy: { orden: 'asc' } } },
  orderBy: { creadoEn: 'desc' }
})

const buscarPorId = (id) => prisma.servicio.findUnique({
  where: { id },
  include: { fotos: { orderBy: { orden: 'asc' } } }
})

const crear = (data) => prisma.servicio.create({ data })

const actualizar = (id, data) => prisma.servicio.update({
  where: { id }, data
})

const eliminar = (id) => prisma.servicio.update({
  where: { id },
  data: { activo: false }
})

const agregarFoto = (data) => prisma.servicioFoto.create({ data })

const buscarFoto = (id) => prisma.servicioFoto.findUnique({ where: { id } })

const eliminarFoto = (id) => prisma.servicioFoto.delete({ where: { id } })

module.exports = {
  listar, listarTodos, buscarPorId,
  crear, actualizar, eliminar,
  agregarFoto, buscarFoto, eliminarFoto
}