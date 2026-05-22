import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";

// Páginas públicas
import Inicio from "./pages/Inicio";
import DetalleServicio from "./pages/DetalleServicio";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import NoAutorizado from "./pages/error/NoAutorizado";
import NoEncontrado from "./pages/error/NoEncontrado";
import ErrorServidor from "./pages/error/ErrorServidor";
import SesionExpirada from "./pages/error/SesionExpirada";

// Páginas cliente
import AgendarCita from "./pages/cliente/AgendarCita";
import MisCitas from "./pages/cliente/MisCitas";

// Páginas empleado
import AgendaEmpleado from "./pages/empleado/AgendaEmpleado";

// Páginas admin
import AdminServicios from "./pages/admin/AdminServicios";
import AdminEmpleados from "./pages/admin/AdminEmpleados";
import AdminCitas from "./pages/admin/AdminCitas";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios/:id" element={<DetalleServicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Cliente */}
          <Route
            path="/agendar/:servicioId"
            element={
              <RutaProtegida roles={["cliente"]}>
                <AgendarCita />
              </RutaProtegida>
            }
          />
          <Route
            path="/mis-citas"
            element={
              <RutaProtegida roles={["cliente"]}>
                <MisCitas />
              </RutaProtegida>
            }
          />

          {/* Empleado */}
          <Route
            path="/agenda"
            element={
              <RutaProtegida roles={["empleado"]}>
                <AgendaEmpleado />
              </RutaProtegida>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/servicios"
            element={
              <RutaProtegida roles={["admin"]}>
                <AdminServicios />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/empleados"
            element={
              <RutaProtegida roles={["admin"]}>
                <AdminEmpleados />
              </RutaProtegida>
            }
          />
          <Route
            path="/admin/citas"
            element={
              <RutaProtegida roles={["admin"]}>
                <AdminCitas />
              </RutaProtegida>
            }
          />
          <Route path="/no-autorizado" element={<NoAutorizado />} />
          <Route path="/error-servidor" element={<ErrorServidor />} />
          <Route path="/sesion-expirada" element={<SesionExpirada />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
