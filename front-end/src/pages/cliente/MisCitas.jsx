import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { confirmar } from "../../utils/alerta";
import { formatearHora } from "../../utils/formatoHora";

import "./MisCitas.css";

import { misCitas, cancelarCita } from "../../services/citaService";

import { getServicio } from "../../services/serviciosService";

import { getEmpleado } from "../../services/empleadoService";

const estadoBadge = (estado) => {
  const clases = {
    pendiente: "badge-pendiente",
    completada: "badge-completada",
    cancelada: "badge-cancelada",
  };

  const textos = {
    pendiente: "Pendiente",
    completada: "Completada",
    cancelada: "Cancelada",
  };

  return <span className={`badge ${clases[estado]}`}>{textos[estado]}</span>;
};

const MisCitas = () => {
  const [citas, setCitas] = useState([]);

  const [servicios, setServicios] = useState({});

  const [empleados, setEmpleados] = useState({});

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await misCitas();

        const prioridadEstado = {
          pendiente: 1,
          completada: 2,
          cancelada: 3,
        };

        const citasOrdenadas = [...data].sort((a, b) => {
          const prioridadA = prioridadEstado[a.estado] || 99;
          const prioridadB = prioridadEstado[b.estado] || 99;

          if (prioridadA !== prioridadB) {
            return prioridadA - prioridadB;
          }
          
          const fechaA = new Date(`${a.fecha}T${a.horaInicio}`);
          const fechaB = new Date(`${b.fecha}T${b.horaInicio}`);

          return fechaA - fechaB;
        });

        setCitas(citasOrdenadas);

        const idsServicios = [...new Set(data.map((c) => c.servicioId))];

        const serviciosRes = await Promise.all(
          idsServicios.map((id) =>
            getServicio(id)
              .then((r) => ({
                id,
                nombre: r.data.nombre,
              }))
              .catch(() => ({
                id,
                nombre: "Servicio no disponible",
              })),
          ),
        );

        const mapaServicios = {};

        serviciosRes.forEach(({ id, nombre }) => {
          mapaServicios[id] = nombre;
        });

        setServicios(mapaServicios);

        const idsEmpleados = [...new Set(data.map((c) => c.empleadoId))];

        const empleadosRes = await Promise.all(
          idsEmpleados.map((id) =>
            getEmpleado(id)
              .then((r) => ({
                id,
                nombre: r.data.nombre,
              }))
              .catch(() => ({
                id,
                nombre: "Empleado no disponible",
              })),
          ),
        );

        const mapaEmpleados = {};

        empleadosRes.forEach(({ id, nombre }) => {
          mapaEmpleados[id] = nombre;
        });

        setEmpleados(mapaEmpleados);
      } catch {
        toast.error("Error al cargar tus citas");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const cancelar = async (id) => {
    const result = await confirmar({
      titulo: "¿Cancelar cita?",
      texto: "Esta acción no se puede deshacer.",
      botonConfirmar: "Sí, cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelarCita(id);

      setCitas((c) =>
        c.map((cita) =>
          cita.id === id ? { ...cita, estado: "cancelada" } : cita,
        ),
      );

      toast.success("Cita cancelada");
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al cancelar");
    }
  };

  if (cargando) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="miscitas-page">
      <Navbar />

      <div className="miscitas-container">
        <h1>Mis citas</h1>

        {citas.length === 0 ? (
          <div className="miscitas-vacio">
            <p>No tienes citas agendadas aún.</p>

            <Link to="/" className="btn-dorado">
              Ver servicios
            </Link>
          </div>
        ) : (
          <div className="citas-lista">
            {citas.map((cita) => {
              const fecha = new Date(cita.fecha);

              fecha.setHours(fecha.getHours() + 12);

              const fechaValida = !isNaN(fecha);

              return (
                <div key={cita.id} className="cita-card">
                  <div className="cita-fecha">
                    <span className="cita-dia">
                      {fechaValida
                        ? fecha.toLocaleDateString("es-CO", { day: "2-digit" })
                        : "--"}
                    </span>

                    <span className="cita-mes">
                      {fechaValida
                        ? fecha.toLocaleDateString("es-CO", { month: "short" })
                        : "--"}
                    </span>
                  </div>

                  <div className="cita-info">
                    <p className="cita-hora">
                      {formatearHora(cita.horaInicio)} —{" "}
                      {formatearHora(cita.horaFin)}
                    </p>

                    <p className="cita-servicio">
                      Servicio: {servicios[cita.servicioId] || "Cargando..."}
                    </p>

                    <p className="cita-empleado">
                      Especialista:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {empleados[cita.empleadoId] || "Cargando..."}
                      </span>
                    </p>

                    <p className="cita-notas">
                      "{cita.notas?.trim() ? cita.notas : "Sin notas"}"
                    </p>
                  </div>

                  <div className="cita-acciones">
                    {estadoBadge(cita.estado)}

                    {cita.estado === "pendiente" && (
                      <button
                        className="btn-outline btn-cancelar"
                        onClick={() => cancelar(cita.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCitas;
