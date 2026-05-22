import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/NavBar";
import "./Inicio.css";
import { gsap } from "gsap";
import Imagen from "../assets/hero.png";
import Footer from "../components/Footer";

const Inicio = () => {
  const [servicios, setServicios] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [carruselIdx, setCarruselIdx] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data: svcs } = await api.get("/api/servicios");
        setServicios(svcs);

        const resenasPorServicio = await Promise.all(
          svcs.map((s) =>
            api
              .get(`/api/resenas/${s.id}`)
              .then((r) => r.data.resenas.slice(0, 2)),
          ),
        );
        const todasResenas = resenasPorServicio.flat();

        setResenas(todasResenas);
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const estrellas = (n) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < n ? "#C9A84C" : "none"}
        color="#C9A84C"
      />
    ));

  if (cargando) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="inicio">
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-sub">Salón de belleza</p>
          <h1>Realza tu belleza natural</h1>
          <p className="hero-desc">
            Uñas, pelo, cejas, pestañas y depilación con las mejores
            profesionales
          </p>
          <a href="#servicios" className="btn-dorado">
            Ver servicios
          </a>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="servicios-section" id="servicios">
        <h2>Nuestros servicios</h2>

        <p className="seccion-sub">
          Selecciona un servicio para conocer más detalles
        </p>

        <div className="servicios-grid">
          {servicios.map((s) => (
            <Link
              to={`/servicios/${s.id}`}
              key={s.id}
              className="servicio-card"
            >
              {s.fotos?.[0] ? (
                <img
                  src={s.fotos[0].url}
                  alt={s.nombre}
                  className="servicio-img"
                  loading="lazy"
                />
              ) : (
                <div className="servicio-sin-foto">
                  <p className="servicio-sin-foto-texto">
                    "{s.descripcion || "Descubre este servicio"}"
                  </p>
                </div>
              )}
              <div className="servicio-info">
                <h3>{s.nombre}</h3>
                <p className="servicio-precio">
                  ${Number(s.precio).toLocaleString("es-CO")}
                </p>
                <p className="servicio-duracion">{s.duracionMin} min</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RESEÑAS */}
      {resenas.length > 0 && (
        <section className="resenas-section">
          <h2>Lo que dicen nuestras clientas</h2>

          <div
            className="carrusel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {/* BOTÓN IZQUIERDO */}
            <button
              className="carrusel-arrow carrusel-arrow-left"
              onClick={() => {
                const prev =
                  (carruselIdx - 1 + resenas.length) % resenas.length;

                const track = document.querySelector(".carrusel-track");

                gsap.to(track, {
                  x: 60,
                  opacity: 0,
                  ease: "power2.in",
                  onComplete: () => {
                    setCarruselIdx(prev);

                    gsap.fromTo(
                      track,
                      { x: -60, opacity: 0 },
                      { x: 0, opacity: 1, ease: "power2.out" },
                    );
                  },
                });
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "2rem",
                color: "inherit",
                flexShrink: 0,
              }}
            >
              {"‹"}
            </button>

            {/* TRACK */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                className="carrusel-track"
                style={{
                  display: "flex",
                  gap: "1rem",
                }}
              >
                {[0, 1, 2].map((offset) => {
                  const idx = (carruselIdx + offset) % resenas.length;

                  const resena = resenas[idx];

                  return (
                    <div
                      key={offset}
                      className="resena-card"
                      style={{
                        flex: "0 0 calc(33.333% - 0.67rem)",
                      }}
                    >
                      <div className="resena-estrellas">
                        {estrellas(resena.calificacion)}
                      </div>

                      <p className="resena-contenido">"{resena.contenido}"</p>

                      <p className="resena-autor">— {resena.clienteNombre}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTÓN DERECHO */}
            <button
              className="carrusel-arrow carrusel-arrow-right"
              onClick={() => {
                const next = (carruselIdx + 1) % resenas.length;

                const track = document.querySelector(".carrusel-track");

                gsap.to(track, {
                  x: -60,
                  opacity: 0,
                  ease: "power2.in",
                  onComplete: () => {
                    setCarruselIdx(next);

                    gsap.fromTo(
                      track,
                      { x: 60, opacity: 0 },
                      { x: 0, opacity: 1, ease: "power2.out" },
                    );
                  },
                });
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "2rem",
                color: "inherit",
                flexShrink: 0,
              }}
            >
              {"›"}
            </button>
          </div>

          {/* DOTS */}
          <div className="carrusel-dots">
            {resenas.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === carruselIdx ? "active" : ""}`}
                onClick={() => setCarruselIdx(i)}
              />
            ))}
          </div>
        </section>
      )}
      <Footer></Footer>
    </div>
  );
};

export default Inicio;
