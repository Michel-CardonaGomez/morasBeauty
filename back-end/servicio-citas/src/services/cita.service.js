const axios = require("axios");
const repo = require("../repositories/cita.repository");
require("dotenv").config();

console.log("USUARIOS_URL:", process.env.USUARIOS_URL);
console.log("CATALOGO_URL:", process.env.CATALOGO_URL);
const USUARIOS_URL = process.env.USUARIOS_URL;
const CATALOGO_URL = process.env.CATALOGO_URL;

const generarBloquesDisponibles = (
  horaInicioJornada,
  horaFinJornada,
  citasDelDia,
  duracionMin,
  fecha,
) => {
  const bloques = [];

  const aMinutos = (hora) => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  };

  const aHora = (minutos) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const BUFFER_MINUTOS = 15; // bloque de seguridad entre citas

  const jornadaInicio = aMinutos(horaInicioJornada);
  const jornadaFin = aMinutos(horaFinJornada);

  const ahora = new Date();
  const fechaConsulta = new Date(fecha + "T12:00:00");
  const esHoy = ahora.toDateString() === fechaConsulta.toDateString();
  const minutosAhora = esHoy ? ahora.getHours() * 60 + ahora.getMinutes() : 0;

  const ocupados = citasDelDia
    .filter((c) => c.estado !== "completada")
    .map((c) => {
      const inicioCita = aMinutos(c.horaInicio);
      const finCita = aMinutos(c.horaFin);
      const estaActiva = c.estado === "pendiente";

      // Si la cita está pendiente y ya pasó su hora fin estimada
      // agrega el buffer de seguridad
      const finReal =
        esHoy && estaActiva && minutosAhora > finCita
          ? finCita + BUFFER_MINUTOS
          : finCita;

      return { inicio: inicioCita, fin: finReal };
    })
    .sort((a, b) => a.inicio - b.inicio);

  console.log(
    "=== CITAS DEL DIA ===",
    citasDelDia.map((c) => ({
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      estado: c.estado,
    })),
  );
  console.log("Ocupados calculados:", ocupados);
  console.log("Minutos ahora:", minutosAhora);
  console.log("Es hoy:", esHoy);

  for (let t = jornadaInicio; t + duracionMin <= jornadaFin; t += 15) {
    const bloqueInicio = t;
    const bloqueFin = t + duracionMin;

    const choca = ocupados.some(
      (o) => bloqueInicio < o.fin && bloqueFin > o.inicio,
    );
    const yaPaso = esHoy && bloqueInicio <= minutosAhora;

    bloques.push({
      inicio: aHora(bloqueInicio),
      fin: aHora(bloqueFin),
      ocupado: choca || yaPaso,
    });
  }

  return bloques;
};

const calcularHoraFin = (horaInicio, duracionMin) => {
  const [h, m] = horaInicio.split(":").map(Number);
  const totalMin = h * 60 + m + duracionMin;
  const hFin = Math.floor(totalMin / 60);
  const mFin = totalMin % 60;
  return `${String(hFin).padStart(2, "0")}:${String(mFin).padStart(2, "0")}`;
};

const obtenerDisponibilidad = async (empleadoId, fecha, servicioId) => {
  const { data: horarios } = await axios.get(
    `${USUARIOS_URL}/api/empleados/${empleadoId}/horario`,
  );

  const { data: servicio } = await axios.get(
    `${CATALOGO_URL}/api/servicios/${servicioId}`,
  );

  const diaSemana = new Date(fecha + "T12:00:00")
    .toLocaleDateString("es-CO", { weekday: "long" })
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const horarioDia = horarios.find((h) => h.diaSemana === diaSemana);
  if (!horarioDia)
    return {
      disponible: false,
      mensaje: "El empleado no trabaja ese día",
      bloques: [],
    };

  const citasDelDia = await repo.listarPorEmpleadoYFecha(empleadoId, fecha);

  const bloques = generarBloquesDisponibles(
    horarioDia.horaInicio,
    horarioDia.horaFin,
    citasDelDia,
    servicio.duracionMin,
    fecha,
  );

  return {
    disponible: true,
    bloques,
    duracionMin: servicio.duracionMin,
  };
};

const agendar = async ({
  clienteId,
  empleadoId,
  servicioId,
  fecha,
  horaInicio,
  notas,
}) => {
  // Valida que el servicio exista y obtiene duración
  const { data: servicio } = await axios.get(
    `${CATALOGO_URL}/api/servicios/${servicioId}`,
  );

  const horaFin = calcularHoraFin(horaInicio, servicio.duracionMin);

  // Verifica que no haya solapamiento
  const solapamiento = await repo.verificarSolapamiento(
    empleadoId,
    fecha,
    horaInicio,
    horaFin,
  );
  if (solapamiento) throw new Error("Ese horario ya está ocupado");

  return repo.crear({
    clienteId,
    empleadoId,
    servicioId,
    fecha: new Date(fecha + "T12:00:00"),
    horaInicio,
    horaFin,
    notas,
  });
};

const listarTodas = (filtros) => repo.listarTodas(filtros);

const listarPorCliente = (clienteId) => repo.listarPorCliente(clienteId);

const listarHoy = (empleadoId) => repo.listarHoy(empleadoId);

const cancelar = async (id, rolUsuario, usuarioId) => {
  const cita = await repo.buscarPorId(id);
  if (!cita) throw new Error("Cita no encontrada");

  if (rolUsuario === "cliente" && cita.clienteId !== usuarioId)
    throw new Error("No puedes cancelar una cita que no es tuya");

  if (cita.estado === "completada")
    throw new Error("No puedes cancelar una cita ya completada");

  return repo.actualizarEstado(id, "cancelada");
};

const completar = async (id, empleadoId) => {
  const cita = await repo.buscarPorId(id);
  if (!cita) throw new Error("Cita no encontrada");

  if (cita.empleadoId !== empleadoId)
    throw new Error("No puedes completar una cita que no es tuya");

  const horaFin = new Date().toTimeString().slice(0, 5)

  return repo.actualizarEstado(id, "completada", horaFin);
};

const obtenerPorId = (id) => repo.buscarPorId(id);

module.exports = {
  obtenerDisponibilidad,
  agendar,
  listarTodas,
  listarPorCliente,
  listarHoy,
  cancelar,
  completar,
  obtenerPorId,
};
