import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import "./Admin.css";
import { formatearHora } from "../../utils/formatoHora";

const AdminCitas = () => {
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState({});
  const [empleados, setEmpleados] = useState({});
  const [filtros, setFiltros] = useState({ estado: "", fecha: "" });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [{ data: cs }, { data: emps }, { data: svcs }] =
          await Promise.all([
            api.get("/api/citas"),
            api.get("/api/empleados"),
            api.get("/api/servicios"),
          ]);
        const citasOrdenadas = cs.sort((a, b) => {
          const fechaA = new Date(`${a.fecha.split("T")[0]}T${a.horaInicio}`);
          const fechaB = new Date(`${b.fecha.split("T")[0]}T${b.horaInicio}`);
          return fechaB- fechaA;
        });
        setCitas(citasOrdenadas);

        const mapaEmps = {};
        emps.forEach((e) => {
          mapaEmps[e.id] = e.nombre;
        });
        setEmpleados(mapaEmps);

        const mapaSvcs = {};
        svcs.forEach((s) => {
          mapaSvcs[s.id] = s.nombre;
        });
        setServicios(mapaSvcs);
      } catch {
        toast.error("Error al cargar citas");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const citasFiltradas = citas.filter((c) => {
    if (filtros.estado && c.estado !== filtros.estado) return false;

    if (filtros.fecha) {
      const fechaCita = new Date(c.fecha).toISOString().split("T")[0];

      if (fechaCita !== filtros.fecha) return false;
    }

    return true;
  });

  const hoy = new Date().toISOString().split("T")[0];

  const citasHoy = citas.filter(
    (c) => new Date(c.fecha).toISOString().split("T")[0] === hoy,
  );

  if (cargando) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-container">
        <div className="admin-header">
          <h1>Gestión de citas</h1>
        </div>

        {/* MÉTRICAS */}
        <div className="metricas">
          <div className="metrica">
            <span className="metrica-num">{citasHoy.length}</span>
            <span className="metrica-label">Citas hoy</span>
          </div>

          <div className="metrica">
            <span className="metrica-num">
              {citas.filter((c) => c.estado === "pendiente").length}
            </span>
            <span className="metrica-label">Pendientes</span>
          </div>

          <div className="metrica">
            <span className="metrica-num">
              {citas.filter((c) => c.estado === "completada").length}
            </span>
            <span className="metrica-label">Completadas</span>
          </div>

          <div className="metrica">
            <span className="metrica-num">
              {citas.filter((c) => c.estado === "cancelada").length}
            </span>
            <span className="metrica-label">Canceladas</span>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filtros">
          <select
            value={filtros.estado}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                estado: e.target.value,
              })
            }
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <input
            type="date"
            value={filtros.fecha}
            onChange={(e) =>
              setFiltros({
                ...filtros,
                fecha: e.target.value,
              })
            }
          />

          <button
            className="btn-outline"
            onClick={() =>
              setFiltros({
                estado: "",
                fecha: "",
              })
            }
          >
            Limpiar filtros
          </button>
        </div>

        {/* TABLA */}
        <div className="admin-tabla">
          <div className="tabla-head tabla-citas">
            <span>Fecha</span>
            <span>Horario</span>
            <span>Servicio</span>
            <span>Empleada</span>
            <span>Notas</span>
            <span>Estado</span>
          </div>

          {citasFiltradas.length === 0 ? (
            <div className="tabla-vacio">No hay citas con estos filtros</div>
          ) : (
            citasFiltradas.map((c) => {
              const fecha = new Date(c.fecha);
              fecha.setHours(fecha.getHours() + 12);

              const fechaValida = !isNaN(fecha);

              return (
                <div key={c.id} className="tabla-fila-citas tabla-citas">
                  <span>
                    {fechaValida
                      ? fecha.toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Fecha inválida"}
                  </span>
                  <span>
                    {formatearHora(c.horaInicio)} — {formatearHora(c.horaFin)}
                  </span>
                  <span>
                    {servicios[c.servicioId] || c.servicioId?.slice(0, 8)}
                  </span>

                  <span>
                    {empleados[c.empleadoId] || c.empleadoId?.slice(0, 8)}
                  </span>

                  <span className="tabla-notas">{c.notas || "—"}</span>

                  <span>
                    <span className={`badge badge-${c.estado}`}>
                      {c.estado}
                    </span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCitas;
