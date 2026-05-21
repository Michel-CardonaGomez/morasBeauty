const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const repo = require('../repositories/usuario.repository')
require('dotenv').config()

const registro = async ({ nombre, email, telefono, password }) => {
  const existe = await repo.buscarPorEmail(email)
  if (existe) throw new Error('El email ya está registrado')

  const passwordHash = await bcrypt.hash(password, 10)
  const usuario = await repo.crearUsuario({
    nombre, email, telefono, passwordHash, rol: 'cliente'
  })

  return _generarToken(usuario)
}

const login = async ({ email, password }) => {
  const usuario = await repo.buscarPorEmail(email)
  if (!usuario) throw new Error('Credenciales incorrectas')
  if (!usuario.activo) throw new Error('Usuario inactivo')

  const valida = await bcrypt.compare(password, usuario.passwordHash)
  if (!valida) throw new Error('Credenciales incorrectas')

  return _generarToken(usuario)
}

const _generarToken = (usuario) => {
  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }
  }
}

const listarEmpleados = () => repo.listarEmpleados()

const crearEmpleado = async ({ nombre, email, telefono, password, horarios, servicios }) => {
  const existe = await repo.buscarPorEmail(email)
  if (existe) throw new Error('El email ya está registrado')

  const passwordHash = await bcrypt.hash(password, 10)
  const empleado = await repo.crearUsuario({
    nombre, email, telefono, passwordHash, rol: 'empleado'
  })

  if (horarios?.length) {
    for (const h of horarios) {
      await repo.crearHorario({ empleadoId: empleado.id, ...h })
    }
  }

  if (servicios?.length) {
    for (const servicioId of servicios) {
      await repo.asignarServicio(empleado.id, servicioId)
    }
  }

  return empleado
}

const actualizarEmpleado = async (id, { nombre, telefono, activo, horarios, servicios }) => {
  const empleado = await repo.actualizarEmpleado(id, { nombre, telefono, activo })

  if (horarios) {
    await repo.eliminarHorarios(id)
    for (const h of horarios) {
      await repo.crearHorario({ empleadoId: id, ...h })
    }
  }

  if (servicios) {
    await repo.eliminarServicios(id)
    for (const servicioId of servicios) {
      await repo.asignarServicio(id, servicioId)
    }
  }

  return empleado
}

const obtenerHorario = (empleadoId) => repo.obtenerHorario(empleadoId)

const obtenerEmpleadosPorServicio = (servicioId) => repo.obtenerEmpleadosPorServicio(servicioId)

const getEmpleado = (id) => repo.buscarPorId(id)

const desactivarEmpleado = async (id) => {
  const empleado = await repo.buscarPorId(id)
  if (!empleado) throw new Error('Empleado no encontrado')
  return repo.desactivarEmpleado(id)
}

const activarEmpleado = async (id) => {
  const empleado = await repo.buscarPorId(id)
  if (!empleado) throw new Error('Empleado no encontrado')
  return repo.activarEmpleado(id)
}

module.exports = {
  registro, login, listarEmpleados,
  crearEmpleado, actualizarEmpleado, obtenerHorario, obtenerEmpleadosPorServicio, getEmpleado, desactivarEmpleado, activarEmpleado
}