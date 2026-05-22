import API from "./Api"

export const getEmpleados = async () => {
    return await API.get('/empleados')
}

export const getEmpleado = async (id) => {
    return await API.get(`/empleados/${id}`)
}

export const crearEmpleado = async (data) => {
    return await API.post('/empleados', data)
}

export const actualizarEmpleado = async (id, data) => {
    return await API.put(`/empleados/${id}`, data)
}

export const obtenerHorario = async (empleadoId) => {
    return await API.get(`/empleados/${empleadoId}/horario`)
}

export const obtenerEmpleadosPorServicio = async (servicioId) => {
    return await API.get(`/empleados/servicio/${servicioId}`)
}