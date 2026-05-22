/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, X, Upload } from "lucide-react";
import { confirmar } from "../../utils/alerta";

import {
  getServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  subirFotoServicio,
  eliminarFotoServicio,
} from "../../services/serviciosService";

import {
  getEmpleados,
  actualizarEmpleado,
} from "../../services/empleadoService";

import "./Admin.css";

const AdminServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [empleados, setEmpleados] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    duracionMin: "",
    empleadosAsignados: [],
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      const [{ data: svcs }, { data: emps }] = await Promise.all([
        getServicios(),
        getEmpleados(),
      ]);
      setServicios(svcs);
      setEmpleados(emps);
    } catch {
      toast.error("Error al cargar servicios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditando(null);

    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      duracionMin: "",
      empleadosAsignados: [],
    });

    setFotoFile(null);
    setModal(true);
  };

  const abrirEditar = (s) => {
    setEditando(s);
    const empleadosDelServicio = empleados
      .filter((emp) => emp.servicios?.some((sv) => sv.servicioId === s.id))
      .map((emp) => emp.id);

    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion || "",
      precio: s.precio,
      duracionMin: s.duracionMin,
      empleadosAsignados: empleadosDelServicio,
    });

    setFotoFile(null);
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio || !form.duracionMin) {
      toast.error("Nombre, precio y duración son obligatorios");
      return;
    }

    if (form.empleadosAsignados.length === 0) {
      toast.error("Debes asignar al menos una empleada al servicio");
      return;
    }

    setGuardando(true);

    try {
      let servicio;

      if (editando) {
        const { data } = await actualizarServicio(editando.id, form);

        servicio = data;

        toast.success("Servicio actualizado");
      } else {
        const { data } = await crearServicio(form);

        servicio = data;

        toast.success("Servicio creado");
      }

      if (fotoFile) {
        await subirFotoServicio(servicio.id, fotoFile);
      }

      const todasEmpleadas = empleados.filter((e) => e.activo);
      for (const emp of todasEmpleadas) {
        const serviciosActuales = emp.servicios?.map((s) => s.servicioId) || [];
        const estaSeleccionada = form.empleadosAsignados.includes(emp.id);
        const yaTieneServicio = serviciosActuales.includes(servicio.id);

        if (estaSeleccionada && !yaTieneServicio) {
          await actualizarEmpleado(emp.id, {
            servicios: [...serviciosActuales, servicio.id],
          });
        } else if (!estaSeleccionada && yaTieneServicio) {
          await actualizarEmpleado(emp.id, {
            servicios: serviciosActuales.filter((id) => id !== servicio.id),
          });
        }
      }

      setModal(false);
      await cargar();
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (id) => {
    const result = await confirmar({
      titulo: "¿Desactivar servicio?",
      texto: "El servicio dejará de aparecer en la página pública.",
      botonConfirmar: "Sí, desactivar",
    });
    if (!result.isConfirmed) return;

    try {
      await eliminarServicio(id);

      toast.success("Servicio desactivado");

      cargar();
    } catch {
      toast.error("Error al desactivar");
    }
  };

  const eliminarFoto = async (fotoId) => {
    const result = await confirmar({
      titulo: "¿Eliminar foto?",
      texto: "La foto se eliminará permanentemente.",
      botonConfirmar: "Sí, eliminar",
    });
    if (!result.isConfirmed) return;

    try {
      await eliminarFotoServicio(fotoId);

      toast.success("Foto eliminada");

      cargar();
    } catch {
      toast.error("Error al eliminar foto");
    }
  };

  if (cargando) {
    return <div className="loading">Cargando...</div>;
  }

  const toggleEmpleado = (id) => {
    setForm((f) => ({
      ...f,
      empleadosAsignados: f.empleadosAsignados.includes(id)
        ? f.empleadosAsignados.filter((e) => e !== id)
        : [...f.empleadosAsignados, id],
    }));
  };

  return (
    <div className="admin-page">
      <Navbar />

      <div className="admin-container">
        <div className="admin-header">
          <h1>Gestión de servicios</h1>

          <button className="btn-dorado" onClick={abrirCrear}>
            <Plus size={16} />
            Nuevo servicio
          </button>
        </div>

        <div className="admin-tabla">
          <div className="tabla-head">
            <span>Servicio</span>
            <span>Precio</span>
            <span>Duración</span>
            <span>Estado</span>
            <span>Fotos</span>
            <span>Acciones</span>
          </div>

          {servicios.map((s) => (
            <div key={s.id} className="tabla-fila">
              <div className="tabla-nombre">
                {s.fotos?.[0] && (
                  <img
                    src={s.fotos[0].url}
                    alt={s.nombre}
                    className="tabla-thumb"
                  />
                )}

                <div>
                  <p className="tabla-nombre-text">{s.nombre}</p>

                  <p className="tabla-desc">{s.descripcion?.slice(0, 50)}...</p>
                </div>
              </div>

              <span>${Number(s.precio).toLocaleString("es-CO")}</span>

              <span>{s.duracionMin} min</span>

              <span>
                <span
                  className={`badge ${
                    s.activo ? "badge-completada" : "badge-cancelada"
                  }`}
                >
                  {s.activo ? "Activo" : "Inactivo"}
                </span>
              </span>

              <div className="fotos-lista">
                {s.fotos?.map((f) => (
                  <div key={f.id} className="foto-chip">
                    <img src={f.url} alt="" />

                    <button onClick={() => eliminarFoto(f.id)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="tabla-acciones">
                <button className="btn-icon" onClick={() => abrirEditar(s)}>
                  <Pencil size={15} />
                </button>

                <button
                  className="btn-icon btn-danger"
                  onClick={() => desactivar(s.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? "Editar servicio" : "Nuevo servicio"}</h2>

              <button onClick={() => setModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>

                <input
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombre: e.target.value,
                    })
                  }
                  placeholder="Ej: Manicure clásica"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>

                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Describe el servicio..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio (COP)</label>

                  <input
                    type="number"
                    value={form.precio}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        precio: e.target.value,
                      })
                    }
                    placeholder="35000"
                  />
                </div>

                <div className="form-group">
                  <label>Duración (min)</label>

                  <input
                    type="number"
                    value={form.duracionMin}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duracionMin: e.target.value,
                      })
                    }
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Foto</label>

                <label className="upload-btn">
                  <Upload size={16} />
                  Seleccionar imagen
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setFotoFile(e.target.files[0])}
                  />
                </label>

                {fotoFile && <p className="foto-nombre">{fotoFile.name}</p>}
              </div>

              <div className="form-group">
                <label>Empleadas que realizan este servicio</label>
                <div className="servicios-check">
                  {empleados
                    .filter((e) => e.activo)
                    .map((e) => (
                      <label key={e.id} className="servicio-check">
                        <input
                          type="checkbox"
                          checked={form.empleadosAsignados.includes(e.id)}
                          onChange={() => toggleEmpleado(e.id)}
                        />
                        {e.nombre}
                      </label>
                    ))}
                </div>
                {empleados.filter((e) => e.activo).length === 0 && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--gris)",
                      fontStyle: "italic",
                    }}
                  >
                    No hay empleadas activas disponibles
                  </p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setModal(false)}>
                Cancelar
              </button>

              <button
                className="btn-dorado"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicios;
