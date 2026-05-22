import API from "./Api"

export const getServicios = async () => {
    return await API.get('/servicios')
}

export const getServicio = async (id) => {
    return await API.get(`/servicios/${id}`)
}

export const crearServicio = async (data) => {
    return await API.post('/servicios', data)
}

export const actualizarServicio = async (id, data) => {
    return await API.put(`/servicios/${id}`, data)
}

export const eliminarServicio = async (id) => {
    return await API.delete(`/servicios/${id}`)
}

export const subirFotoServicio = async (id, fotoFile) => {
        const formData = new FormData()
        formData.append('foto', fotoFile)
        return await API.post(`/servicios/${id}/fotos`, formData)
      
}

export const eliminarFotoServicio = async (fotoId) => {
    return await API.delete(`/servicios/fotos/${fotoId}`)
}
