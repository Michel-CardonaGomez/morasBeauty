const prisma = require('../prismaClient')

const crearUsuario = (data) => prisma.usuario.create({ data })

const buscarPorEmail = (email) => prisma.usuario.findUnique({ where: { email } })

const buscarPorId = (id) => prisma.usuario.findUnique({ where: { id } })

const listarEmpleados = () => prisma.usuario.findMany({
  where: { rol: 'empleado'},
  include: { horarios: true, servicios: true }
})

const actualizarEmpleado = (id, data) => prisma.usuario.update({
  where: { id },
  data
})

const crearHorario = (data) => prisma.horarioEmpleado.create({ data })

const eliminarHorarios = (empleadoId) => prisma.horarioEmpleado.deleteMany({
  where: { empleadoId }
})

const asignarServicio = (empleadoId, servicioId) =>
  prisma.empleadoServicio.upsert({
    where: { empleadoId_servicioId: { empleadoId, servicioId } },
    update: {},
    create: { empleadoId, servicioId }
  })

const eliminarServicios = (empleadoId) => prisma.empleadoServicio.deleteMany({
  where: { empleadoId }
})

const obtenerHorario = (empleadoId) => prisma.horarioEmpleado.findMany({
  where: { empleadoId }
})

const obtenerEmpleadosPorServicio = async (servicioId) => {
  const relaciones = await prisma.empleadoServicio.findMany({
    where: { servicioId },
    include: {
      empleado: true
    }
  });

  return relaciones.map(r => r.empleado);
};
const desactivarEmpleado = (id) => prisma.usuario.update({
  where: { id },
  data: { activo: false }
})

const activarEmpleado = (id) => prisma.usuario.update({
  where: { id },
  data: { activo: true }
})

module.exports = {
  crearUsuario, buscarPorEmail, buscarPorId, listarEmpleados,
  actualizarEmpleado, crearHorario, eliminarHorarios,
  asignarServicio, eliminarServicios, obtenerHorario, obtenerEmpleadosPorServicio, desactivarEmpleado, activarEmpleado
}