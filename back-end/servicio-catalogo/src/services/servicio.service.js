const repo = require("../repositories/servicio.repository");
const { cloudinary } = require("../cloudinary");

const listar = () => repo.listar();

const listarTodos = () => repo.listarTodos();

const obtenerPorId = async (id) => {
  const servicio = await repo.buscarPorId(id);
  if (!servicio) throw new Error("Servicio no encontrado");
  return servicio;
};

const crear = async ({ nombre, descripcion, precio, duracionMin }) => {
  if (!nombre || !precio || !duracionMin)
    throw new Error("Nombre, precio y duración son obligatorios");
  return repo.crear({
    nombre,
    descripcion,
    precio: parseFloat(precio),
    duracionMin: parseInt(duracionMin),
  });
};

const actualizar = async (id, datos) => {
  const existe = await repo.buscarPorId(id);
  if (!existe) throw new Error("Servicio no encontrado");

  const data = {};
  if (datos.nombre) data.nombre = datos.nombre;
  if (datos.descripcion) data.descripcion = datos.descripcion;
  if (datos.precio) data.precio = parseFloat(datos.precio);
  if (datos.duracionMin) data.duracionMin = parseInt(datos.duracionMin);
  if (datos.activo !== undefined) data.activo = datos.activo;

  return repo.actualizar(id, data);
};

const eliminar = async (id) => {
  const existe = await repo.buscarPorId(id);
  if (!existe) throw new Error("Servicio no encontrado");
  return repo.eliminar(id);
};

const agregarFoto = async (servicioId, file, orden) => {
  const existe = await repo.buscarPorId(servicioId);
  if (!existe) throw new Error("Servicio no encontrado");

  if (!file || !file.buffer) {
    throw new Error("No se envió una imagen válida");
  }

  const resultado = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "salon-belleza",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(file.buffer);
  });

  return repo.agregarFoto({
    servicioId,
    url: resultado.secure_url,
    publicId: resultado.public_id,
    orden: orden ? parseInt(orden) : 0,
  });
};

const eliminarFoto = async (id) => {
  const foto = await repo.buscarFoto(id);
  if (!foto) throw new Error("Foto no encontrada");

  // Elimina también de Cloudinary
  await cloudinary.uploader.destroy(foto.publicId);
  return repo.eliminarFoto(id);
};

module.exports = {
  listar,
  listarTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  agregarFoto,
  eliminarFoto,
};
