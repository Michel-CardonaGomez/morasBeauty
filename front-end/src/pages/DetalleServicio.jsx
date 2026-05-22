import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./DetalleServicio.css";

// Componente Estrellas — solo maneja el hover y el click
const Estrellas = ({ calificacion, interactivo = false, onChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="estrellas">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={interactivo ? 28 : 16}
          fill={(hover || calificacion) > i ? "#C9A84C" : "none"}
          color="#C9A84C"
          style={{ cursor: interactivo ? "pointer" : "default" }}
          onMouseEnter={() => interactivo && setHover(i + 1)}
          onMouseLeave={() => interactivo && setHover(0)}
          onClick={() => interactivo && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
};

const DetalleServicio = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [servicio, setServicio] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [promedio, setPromedio] = useState(0);
  const [total, setTotal] = useState(0);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [nuevaResena, setNuevaResena] = useState({
    calificacion: 0,
    contenido: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [citaCompletada, setCitaCompletada] = useState(null);
  const [yaReseno, setYaReseno] = useState(false);

  // Carga el servicio y sus reseñas
  useEffect(() => {
    const cargar = async () => {
      try {
        const [{ data: svc }, { data: res }] = await Promise.all([
          api.get(`/api/servicios/${id}`),
          api.get(`/api/resenas/${id}`),
        ]);
        setServicio(svc);
        setResenas(res.resenas);
        setPromedio(res.promedio);
        setTotal(res.total);
      } catch {
        toast.error("No se pudo cargar el servicio");
        navigate("/");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, navigate]);

  // Verifica si el cliente tiene cita completada para este servicio
  useEffect(() => {
    const verificarCita = async () => {
      if (!usuario || usuario.rol !== "cliente") return;
      try {
        const { data: misCitas } = await api.get("/api/citas/mis-citas");

        const cita = misCitas.find(
          (c) => c.servicioId === id && c.estado === "completada",
        );
        setCitaCompletada(cita || null);

        if (cita) {
          const { data: res } = await api.get(`/api/resenas/${id}`);
          const yaDejoResena = res.resenas.some((r) => r.citaId === cita.id);
          setYaReseno(yaDejoResena);
        }
      } catch {
        // silencioso
      }
    };
    verificarCita();
  }, [id, usuario]);

  const handleAgendar = () => {
    if (!usuario) {
      toast.error("Debes iniciar sesión para agendar");
      navigate("/login");
      return;
    }
    navigate(`/agendar/${id}`);
  };

  const handleEnviarResena = async () => {
    if (!nuevaResena.calificacion)
      return toast.error("Selecciona una calificación");
    if (!nuevaResena.contenido.trim())
      return toast.error("Escribe un comentario");
    if (!citaCompletada)
      return toast.error("No tienes citas completadas para este servicio");

    setEnviando(true);
    try {
      await api.post("/api/resenas", {
        servicioId: id,
        citaId: citaCompletada.id,
        calificacion: nuevaResena.calificacion,
        contenido: nuevaResena.contenido,
      });
      toast.success("¡Reseña enviada!");
      setYaReseno(true);
      const { data: res } = await api.get(`/api/resenas/${id}`);
      setResenas(res.resenas);
      setPromedio(res.promedio);
      setTotal(res.total);
      setNuevaResena({ calificacion: 0, contenido: "" });
    } catch (e) {
      toast.error(e.response?.data?.error || "Error al enviar reseña");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="loading">Cargando...</div>;
  if (!servicio) return null;

  return (
    <div className="detalle-page">
      <Navbar />

      <div className="detalle-container">
        {/* GALERÍA */}
        <div className="galeria">
          {servicio.fotos?.length > 0 ? (
            <>
              <img
                src={servicio.fotos[fotoIdx]?.url}
                alt={servicio.nombre}
                className="galeria-principal"
              />
              {servicio.fotos.length > 1 && (
                <div className="galeria-thumbs">
                  {servicio.fotos.map((f, i) => (
                    <img
                      key={f.id}
                      src={f.url}
                      alt=""
                      className={`thumb ${i === fotoIdx ? "active" : ""}`}
                      onClick={() => setFotoIdx(i)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="galeria-sin-foto">
              <p className="galeria-sin-foto-texto">
                "{servicio.descripcion || "Descubre este servicio"}"
              </p>
            </div>
          )}
        </div>

        {/* INFO DEL SERVICIO */}
        <div className="detalle-info">
          <p className="detalle-categoria">Servicio</p>
          <h1>{servicio.nombre}</h1>

          <div className="detalle-meta">
            <span className="detalle-precio">
              ${Number(servicio.precio).toLocaleString("es-CO")}
            </span>
            <span className="detalle-duracion">{servicio.duracionMin} min</span>
          </div>

          {promedio > 0 && (
            <div className="detalle-rating">
              <Estrellas calificacion={Math.round(promedio)} />
              <span>
                {promedio} ({total} reseñas)
              </span>
            </div>
          )}

          <p className="detalle-descripcion">{servicio.descripcion}</p>

          <button className="btn-dorado btn-agendar" onClick={handleAgendar}>
            Agendar cita
          </button>
        </div>
      </div>

      {/* SECCIÓN DE RESEÑAS */}
      <div className="resenas-container">
        <h2>Reseñas de clientas</h2>

        {usuario?.rol === "cliente" && (
          <div className="nueva-resena">
            {!citaCompletada ? (
              <div className="resena-bloqueada">
                <p>
                  Solo puedes dejar una reseña después de haber asistido a una
                  cita de este servicio.
                </p>
              </div>
            ) : yaReseno ? (
              <div className="resena-bloqueada resena-enviada">
                <p>✓ Ya dejaste tu reseña para este servicio. ¡Gracias!</p>
              </div>
            ) : (
              <>
                <h3>Deja tu reseña</h3>
                <Estrellas
                  calificacion={nuevaResena.calificacion}
                  interactivo
                  onChange={(v) =>
                    setNuevaResena((r) => ({ ...r, calificacion: v }))
                  }
                />
                <textarea
                  placeholder="Cuéntanos tu experiencia..."
                  value={nuevaResena.contenido}
                  onChange={(e) =>
                    setNuevaResena((r) => ({ ...r, contenido: e.target.value }))
                  }
                  rows={3}
                />
                <button
                  className="btn-dorado"
                  onClick={handleEnviarResena}
                  disabled={enviando}
                >
                  {enviando ? "Enviando..." : "Publicar reseña"}
                </button>
              </>
            )}
          </div>
        )}

        {resenas.length === 0 ? (
          <p className="sin-resenas">Sé la primera en dejar una reseña</p>
        ) : (
          <div className="resenas-lista">
            {resenas.map((r) => (
              <div key={r._id} className="resena-item">
                <div className="resena-header">
                  <div className="resena-avatar">
                    {r.clienteNombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="resena-nombre">{r.clienteNombre}</p>
                    <Estrellas calificacion={r.calificacion} />
                  </div>
                  <p className="resena-fecha">
                    {new Date(r.creadoEn).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <p className="resena-texto">{r.contenido}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleServicio;
