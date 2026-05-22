import axios from "axios";

let cierreIntencional = false;

export const marcarCierreIntencional = () => {
  cierreIntencional = true;
};

const api = axios.create({
  baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLoginFallido = error.config?.url?.includes("/api/auth/login");
    const esRegistro = error.config?.url?.includes("/api/auth/registro");

    if (!esLoginFallido && !esRegistro) {
      if (error.response?.status === 401) {
        const token = localStorage.getItem("token");
        if (token && !cierreIntencional) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          window.location.href = "/sesion-expirada";
        }
      }
      if (error.response?.status === 403) {
        window.location.href = "/no-autorizado";
      }
      if (error.response?.status === 500) {
        window.location.href = "/error-servidor";
      }
    }

    return Promise.reject(error);
  },
);

export default api;