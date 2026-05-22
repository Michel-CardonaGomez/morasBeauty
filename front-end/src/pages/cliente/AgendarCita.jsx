import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import "./AgendarCita.css";
import { getServicio } from "../../services/serviciosService";
import { getEmpleados } from "../../services/empleadoService";
import { agendarCita, getDisponibilidad } from "../../services/citaService";
import { formatearHora } from "../../utils/formatoHora";
import Footer from "../../components/Footer";

const AgendarCita = () => {
  const { servicioId } = useParams();
  const navigate = useNavigate();

  const [servicio, setServicio] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoId, setEmpleadoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [bloques, setBloques] = useState([]);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState(null);
  const [notas, setNotas] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [agendando, setAgendando] = useState(false);

  const hoy = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dia}`;
  })();

  useEffect(() => {
    const cargar = async () => {
      try {
        const [{ data: svc }, { data: emps }] = await Promise.all([
          getServicio(servicioId),
          getEmpleados(),
        ]);
        const empsFiltrados = emps.filter(
          (emp) =>
            emp.activo &&
            emp.servicios?.some((s) => s.servicioId === servicioId),
        );
        setEmpleados(empsFiltrados);
        setServicio(svc);
      } catch {
        toast.error("Error al cargar el formulario");
        navigate("/");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [servicioId, navigate]);

  useEffect(() => {
    if (!empleadoId || !fecha) return;
    const cargarBloques = async () => {
      setCargandoBloques(true);
      setBloqueSeleccionado(null);
      try {
        const { data } = await getDisponibilidad({
          empleadoId,
          fecha,
          servicioId,
        });
        setBloques(data.bloques || []);
        if (!data.disponible) toast.error(data.mensaje);
      } catch {
        toast.error("Error al consultar disponibilidad");
      } finally {
        setCargandoBloques(false);
      }
    };
    cargarBloques();
    const intervalo = setInterval(cargarBloques, 2 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [empleadoId, fecha, servicioId]);

  const handleAgendar = async () => {
    if (!empleadoId) return toast.error("Selecciona una empleada");
    if (!fecha) return toast.error("Selecciona una fecha");
    if (!bloqueSeleccionado) return toast.error("Selecciona un horario");

    setAgendando(true);
    try {
      await agendarCita({
        empleadoId,
        servicioId,
        fecha,
        horaInicio: bloqueSeleccionado.inicio,
        notas,
      });
      toast.success("¡Cita agendada exitosamente!");
      navigate("/mis-citas");
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al agendar la cita");
    } finally {
      setAgendando(false);
    }
  };

  if (cargando) return <div className="loading">Cargando...</div>;

  return (
    <div className="agendar-page">
      <Navbar />
      <div className="agendar-container">
        {/* RESUMEN DEL SERVICIO */}
        <div className="agendar-servicio">
          {servicio?.fotos?.[0] && (
            <img src={servicio.fotos[0].url} alt={servicio.nombre} />
          )}
          <div className="agendar-servicio-info">
            <h2>{servicio?.nombre}</h2>
            <p>${Number(servicio?.precio).toLocaleString("es-CO")}</p>
            <p>{servicio?.duracionMin} minutos</p>
          </div>
        </div>

        <div className="agendar-form">
          <h1>Agendar cita</h1>

          {/* PASO 1: Empleada */}
          <div className="paso">
            <div className="paso-num">1</div>
            <div className="paso-content">
              <label>Elige tu empleada</label>
              <select
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
              >
                <option value="">Selecciona una empleada</option>
                {empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PASO 2: Fecha */}
          <div className="paso">
            <div className="paso-num">2</div>
            <div className="paso-content">
              <label>Elige la fecha</label>
              <input
                type="date"
                value={fecha}
                min={hoy}
                onKeyDown={(e) => e.preventDefault()}
                onChange={(e) => {
                  const seleccionada = e.target.value;
                  if (seleccionada >= hoy) setFecha(seleccionada);
                }}
              />
            </div>
          </div>

          {/* PASO 3: Horario */}
          <div className="paso">
            <div className="paso-num">3</div>
            <div className="paso-content">
              <label>Elige el horario</label>
              {cargandoBloques ? (
                <p className="cargando-bloques">
                  Consultando disponibilidad...
                </p>
              ) : !empleadoId || !fecha ? (
                <p className="sin-bloques">
                  Selecciona empleada y fecha para ver horarios
                </p>
              ) : bloques.length === 0 ? (
                <p className="sin-bloques">
                  No hay horarios disponibles para esta fecha
                </p>
              ) : bloques.every((b) => b.ocupado) ? (
                <div className="bloques-agotados">
                  <p>No hay horarios disponibles para este día.</p>
                  <p>La jornada de la empleada está completa o ya finalizó.</p>
                  <p>Por favor selecciona otra fecha.</p>
                </div>
              ) : (
                <div className="bloques-grid">
                  {bloques.map((b, i) => (
                    <button
                      key={i}
                      className={`bloque
              ${b.ocupado ? "ocupado" : "libre"}
              ${bloqueSeleccionado?.inicio === b.inicio ? "seleccionado" : ""}
            `}
                      disabled={b.ocupado}
                      onClick={() => setBloqueSeleccionado(b)}
                      title={
                        b.ocupado
                          ? "No disponible"
                          : `${formatearHora(b.inicio)} — ${formatearHora(b.fin)}`
                      }
                    >
                      {formatearHora(b.inicio)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PASO 4: Notas */}
          <div className="paso">
            <div className="paso-num">4</div>
            <div className="paso-content">
              <label>Notas adicionales (opcional)</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: quiero uñas en color rojo, diseño francés..."
                rows={3}
              />
            </div>
          </div>

          {/* RESUMEN */}
          {bloqueSeleccionado && (
            <div className="resumen-cita">
              <h3>Resumen de tu cita</h3>
              <p>
                <strong>Servicio:</strong> {servicio?.nombre}
              </p>
              <p>
                <strong>Empleada:</strong>{" "}
                {empleados.find((e) => e.id === empleadoId)?.nombre}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(fecha + "T12:00:00").toLocaleDateString("es-CO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <strong>Hora:</strong>{" "}
                {formatearHora(bloqueSeleccionado.inicio)} —{" "}
                {formatearHora(bloqueSeleccionado.fin)}
              </p>
            </div>
          )}

          <button
            className="btn-dorado btn-confirmar"
            onClick={handleAgendar}
            disabled={agendando || !bloqueSeleccionado}
          >
            {agendando ? "Agendando..." : "Confirmar cita"}
          </button>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default AgendarCita;
