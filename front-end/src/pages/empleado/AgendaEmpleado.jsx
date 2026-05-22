import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "./AgendaEmpleado.css";
import { obtenerHorario } from "../../services/empleadoService";
import { formatearHora } from "../../utils/formatoHora";
import { confirmar } from "../../utils/alerta";

const generarBloques = (horaInicio, horaFin, citas) => {
  const bloques = [];
  const [hI, mI] = horaInicio.split(":").map(Number);
  const [hF, mF] = horaFin.split(":").map(Number);
  let totalI = hI * 60 + mI;
  const totalF = hF * 60 + mF;

  while (totalI < totalF) {
    const h = Math.floor(totalI / 60);
    const m = totalI % 60;
    bloques.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

    const citaActual = citas.find((c) => {
      const inicioMin =
        parseInt(c.horaInicio.split(":")[0]) * 60 +
        parseInt(c.horaInicio.split(":")[1]);
      const finMin =
        parseInt(c.horaFin.split(":")[0]) * 60 +
        parseInt(c.horaFin.split(":")[1]);
      return inicioMin <= totalI && finMin > totalI;
    });

    if (citaActual) {
      totalI += 15;
    } else {
      const proximaCita = citas
        .map(
          (c) =>
            parseInt(c.horaInicio.split(":")[0]) * 60 +
            parseInt(c.horaInicio.split(":")[1]),
        )
        .filter((inicio) => inicio > totalI)
        .sort((a, b) => a - b)[0];

      if (proximaCita && proximaCita - totalI < 60) {
        totalI = proximaCita;
      } else {
        totalI += 60;
      }
    }
  }
  return bloques;
};

const AgendaEmpleado = () => {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState({});
  const [cargando, setCargando] = useState(true);
  const [rangoHorario, setRangoHorario] = useState({ inicio: "08:00", fin: "18:00" });

  const horas = useMemo(
    () => generarBloques(rangoHorario.inicio, rangoHorario.fin, citas),
    [citas, rangoHorario]
  );

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data: citasHoy } = await api.get("/api/citas/hoy");
        setCitas(citasHoy);

        const { data: horarios } = await obtenerHorario(usuario.id);

        const diaSemana = new Date()
          .toLocaleDateString("es-CO", { weekday: "long" })
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const horarioHoy = horarios.find((h) => h.diaSemana === diaSemana);

        let horaInicio = "08:00";
        let horaFin = "18:00";

        if (horarioHoy) {
          horaInicio = horarioHoy.horaInicio;
          horaFin = horarioHoy.horaFin;
        } else if (citasHoy.length > 0) {
          const horas = citasHoy.map((c) => c.horaInicio);
          const fins = citasHoy.map((c) => c.horaFin);
          horaInicio = horas.sort()[0];
          horaFin = fins.sort().reverse()[0];
        }

        setRangoHorario({ inicio: horaInicio, fin: horaFin });

        // Carga nombres de servicios
        const idsServicios = [...new Set(citasHoy.map((c) => c.servicioId))];
        const svcs = await Promise.all(
          idsServicios.map((id) =>
            api
              .get(`/api/servicios/${id}`)
              .then((r) => ({ id, nombre: r.data.nombre }))
              .catch(() => ({ id, nombre: "Servicio" })),
          ),
        );
        const mapaServicios = {};
        svcs.forEach((s) => {
          mapaServicios[s.id] = s;
        });
        setServicios(mapaServicios);
      } catch {
        toast.error("Error al cargar la agenda");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [usuario]);

  const completar = async (id) => {
    const result = await confirmar({
      titulo: "Completar cita",
      texto: "Esta acción no se puede deshacer.",
      botonConfirmar: "Sí, completar",
    });
    if (!result.isConfirmed) return;

    try {
      const { data } = await api.patch(`/api/citas/${id}/completar`);
      setCitas((c) =>
        c.map((cita) =>
          cita.id === id
            ? { ...cita, estado: "completada", horaFin: data.horaFin }
            : cita,
        ),
      );
      toast.success("Cita marcada como completada");
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al completar");
    }
  };

  const citaEnHora = (hora) => {
    const exacta = citas.find((c) => c.horaInicio === hora);
    if (exacta) return exacta;
    return citas.find((c) => c.horaInicio < hora && c.horaFin > hora);
  };

  const esComienzoDeCita = (hora) => {
    return citas.find((c) => c.horaInicio === hora);
  };

  const hoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (cargando) return <div className="loading">Cargando agenda...</div>;

  return (
    <div className="agenda-page">
      <Navbar />
      <div className="agenda-container">
        <div className="agenda-header">
          <div>
            <h1>Mi agenda</h1>
            <p className="agenda-fecha">{hoy}</p>
          </div>
          <div className="agenda-stats">
            <div className="stat">
              <span className="stat-num">{citas.length}</span>
              <span className="stat-label">Citas hoy</span>
            </div>
            <div className="stat">
              <span className="stat-num">
                {citas.filter((c) => c.estado === "completada").length}
              </span>
              <span className="stat-label">Completadas</span>
            </div>
            <div className="stat">
              <span className="stat-num">
                {citas.filter((c) => c.estado === "pendiente").length}
              </span>
              <span className="stat-label">Pendientes</span>
            </div>
          </div>
        </div>

        {horas.length === 0 ? (
          <div className="agenda-vacia">
            <p>No trabajas hoy o no hay horario registrado para este día.</p>
          </div>
        ) : (
          <div className="agenda-tabla">
            {horas.map((hora) => {
              const cita = citaEnHora(hora);
              const esInicio = esComienzoDeCita(hora);

              if (cita && !esInicio) return null;

              return (
                <div
                  key={hora}
                  className={`agenda-fila ${cita ? "ocupada" : "libre"}`}
                >
                  <div className="agenda-hora">{formatearHora(hora)}</div>

                  {cita ? (
                    <div className={`agenda-cita estado-${cita.estado}`}>
                      <div className="cita-detalle">
                        <p className="cita-nombre-servicio">
                          {servicios[cita.servicioId]?.nombre || "Servicio"}
                        </p>
                        <p className="cita-horario">
                          {formatearHora(cita.horaInicio)} —{" "}
                          {formatearHora(cita.horaFin)}
                        </p>
                        {cita.notas && (
                          <p className="cita-nota-emp">"{cita.notas}"</p>
                        )}
                      </div>
                      <div className="cita-acciones-emp">
                        <span className={`badge-emp estado-${cita.estado}`}>
                          {cita.estado}
                        </span>
                        {cita.estado === "pendiente" && (
                          <button
                            className="btn-completar"
                            onClick={() => completar(cita.id)}
                          >
                            Marcar completada
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="agenda-libre">Disponible</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaEmpleado;