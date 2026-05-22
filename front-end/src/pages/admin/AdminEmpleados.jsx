import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { Pencil, Plus, X } from "lucide-react";
import "./Admin.css";
import { confirmar } from "../../utils/alerta";
import { UserX, UserCheck } from "lucide-react";

const DIAS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const formInicial = {
  nombre: "",
  email: "",
  telefono: "",
  password: "",
  horarios: [],
  servicios: [],
};

const AdminEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formInicial);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const toggleActivo = async (emp) => {
    const accion = emp.activo ? "desactivar" : "activar";
    const result = await confirmar({
      titulo: `¿${emp.activo ? "Desactivar" : "Activar"} empleada?`,
      texto: emp.activo
        ? "La empleada no aparecerá disponible para nuevas citas."
        : "La empleada volverá a estar disponible para citas.",
      botonConfirmar: `Sí, ${accion}`,
    });
    if (!result.isConfirmed) return;

    try {
      await api.patch(`/api/empleados/${emp.id}/${accion}`);
      toast.success(
        `Empleada ${accion === "activar" ? "activada" : "desactivada"} correctamente`,
      );
      cargar();
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al actualizar");
    }
  };

  const cargar = async () => {
    try {
      const [{ data: emps }, { data: svcs }] = await Promise.all([
        api.get("/api/empleados"),
        api.get("/api/servicios"),
      ]);

      const empsOrdenados = emps.sort((a, b) => {
        if (a.activo === b.activo) return 0;
        return a.activo ? -1 : 1; 
      });

      const svcsOrdenados = svcs.sort((a, b) => {
        if (a.activo === b.activo) return 0;
        return a.activo ? -1 : 1;
      });

      setEmpleados(empsOrdenados);
      setServicios(svcsOrdenados);
    } catch {
      toast.error("Error al cargar");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(formInicial);
    setModal(true);
  };

  const abrirEditar = (e) => {
    setEditando(e);
    setForm({
      nombre: e.nombre,
      email: e.email,
      telefono: e.telefono || "",
      password: "",
      horarios: e.horarios || [],
      servicios: e.servicios?.map((s) => s.servicioId) || [],
    });
    setModal(true);
  };

  const toggleDia = (dia) => {
    const existe = form.horarios.find((h) => h.diaSemana === dia);
    if (existe) {
      setForm((f) => ({
        ...f,
        horarios: f.horarios.filter((h) => h.diaSemana !== dia),
      }));
    } else {
      setForm((f) => ({
        ...f,
        horarios: [
          ...f.horarios,
          { diaSemana: dia, horaInicio: "08:00", horaFin: "17:00" },
        ],
      }));
    }
  };

  const actualizarHorario = (dia, campo, valor) => {
    setForm((f) => ({
      ...f,
      horarios: f.horarios.map((h) =>
        h.diaSemana === dia ? { ...h, [campo]: valor } : h,
      ),
    }));
  };

  const toggleServicio = (id) => {
    setForm((f) => ({
      ...f,
      servicios: f.servicios.includes(id)
        ? f.servicios.filter((s) => s !== id)
        : [...f.servicios, id],
    }));
  };

  const validarPassword = (password) => {
    if (password.length < 8)
      return "La contraseña debe tener al menos 8 caracteres";
    if (!/[a-zA-Z]/.test(password)) return "Debe contener al menos una letra";
    if (!/[0-9]/.test(password)) return "Debe contener al menos un número";
    return null;
  };

  const guardar = async () => {
    if (!form.nombre || !form.email) {
      toast.error("Nombre y email son obligatorios");
      return;
    }

    if (!/^\d{10}$/.test(form.telefono)) {
      toast.error("El teléfono debe tener 10 dígitos");
      return;
    }

    if (!editando) {
      if (!form.password) {
        toast.error("La contraseña es obligatoria");
        return;
      }
      const errorPassword = validarPassword(form.password);
      if (errorPassword) {
        toast.error(errorPassword);
        return;
      }
    }

    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/api/empleados/${editando.id}`, {
          nombre: form.nombre,
          telefono: form.telefono,
          horarios: form.horarios,
          servicios: form.servicios,
        });
        toast.success("Empleada actualizada");
      } else {
        await api.post("/api/empleados", form);
        toast.success("Empleada creada");
      }
      setModal(false);
      cargar();
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="loading">Cargando...</div>;

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Gestión de empleadas</h1>
          <button className="btn-dorado" onClick={abrirCrear}>
            <Plus size={16} /> Nueva empleada
          </button>
        </div>

        <div className="admin-tabla">
          <div className="tabla-head">
            <span>Nombre</span>
            <span>Email</span>
            <span>Horarios</span>
            <span>Servicios</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {empleados.map((e) => (
            <div key={e.id} className="tabla-fila">
              <div>
                <p className="tabla-nombre-text">{e.nombre}</p>
                <p className="tabla-desc">{e.telefono}</p>
              </div>
              <span className="tabla-email">{e.email}</span>
              <div className="dias-chips">
                {e.horarios?.map((h) => (
                  <span key={h.id} className="dia-chip">
                    {h.diaSemana.slice(0, 3)}
                  </span>
                ))}
              </div>
              <span>{e.servicios?.length || 0} servicios</span>
              <span>
                <span
                  className={`badge ${e.activo ? "badge-completada" : "badge-cancelada"}`}
                >
                  {e.activo ? "Activa" : "Inactiva"}
                </span>
              </span>
              <div className="tabla-acciones">
                <button className="btn-icon" onClick={() => abrirEditar(e)}>
                  <Pencil size={15} />
                </button>
                <button
                  className={`btn-icon ${e.activo ? "btn-danger" : "btn-success"}`}
                  onClick={() => toggleActivo(e)}
                  title={e.activo ? "Desactivar" : "Activar"}
                >
                  {e.activo ? <UserX size={15} /> : <UserCheck size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div
            className="modal modal-grande"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editando ? "Editar empleada" : "Nueva empleada"}</h2>
              <button onClick={() => setModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="email@salon.com"
                    disabled={!!editando}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                    placeholder="3001234567"
                  />
                </div>
                {!editando && (
                  <div className="form-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="••••••••"
                    />
                    {form.password && (
                      <div className="password-hints">
                        <span
                          className={
                            form.password.length >= 8 ? "hint ok" : "hint"
                          }
                        >
                          ✓ Mínimo 8 caracteres
                        </span>
                        <span
                          className={
                            /[a-zA-Z]/.test(form.password) ? "hint ok" : "hint"
                          }
                        >
                          ✓ Al menos una letra
                        </span>
                        <span
                          className={
                            /[0-9]/.test(form.password) ? "hint ok" : "hint"
                          }
                        >
                          ✓ Al menos un número
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* HORARIOS */}
              <div className="form-group">
                <label>Horarios de trabajo</label>
                <div className="dias-selector">
                  {DIAS.map((dia) => (
                    <div key={dia} className="dia-row">
                      <label className="dia-check">
                        <input
                          type="checkbox"
                          checked={
                            !!form.horarios.find((h) => h.diaSemana === dia)
                          }
                          onChange={() => toggleDia(dia)}
                        />
                        <span>{dia.slice(0, 3).toUpperCase()}</span>
                      </label>
                      {form.horarios.find((h) => h.diaSemana === dia) && (
                        <div className="hora-inputs">
                          <input
                            type="time"
                            value={
                              form.horarios.find((h) => h.diaSemana === dia)
                                ?.horaInicio
                            }
                            onChange={(e) =>
                              actualizarHorario(
                                dia,
                                "horaInicio",
                                e.target.value,
                              )
                            }
                          />
                          <span>a</span>
                          <input
                            type="time"
                            value={
                              form.horarios.find((h) => h.diaSemana === dia)
                                ?.horaFin
                            }
                            onChange={(e) =>
                              actualizarHorario(dia, "horaFin", e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SERVICIOS */}
              <div className="form-group">
                <label>Servicios que realiza</label>
                <div className="servicios-check">
                  {servicios.map((s) => (
                    <label key={s.id} className="servicio-check">
                      <input
                        type="checkbox"
                        checked={form.servicios.includes(s.id)}
                        onChange={() => toggleServicio(s.id)}
                      />
                      {s.nombre}
                    </label>
                  ))}
                </div>
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

export default AdminEmpleados;
