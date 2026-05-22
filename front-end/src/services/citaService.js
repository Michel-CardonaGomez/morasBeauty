import API from "./Api"

export const getDisponibilidad = async(data) => {
    return await API.get('/citas/disponibilidad', {params: data})
}

export const listarCitas = async () => {
    return await API.get('/citas')
}

export const misCitas = async () => {
    return await API.get('/citas/mis-citas')
}

export const citasHoy = async () => {
    return await API.get('/citas/hoy')
}

export const agendarCita = async (data) => {
    return await API.post('/citas', data)
}

export const cancelarCita = async (id) => {
    return await API.patch(`/citas/${id}/cancelar`)
}

export const completarCita = async (id) => {
    return await API.patch(`/citas/${id}/completar`)
}

