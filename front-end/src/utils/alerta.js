import Swal from 'sweetalert2'

export const confirmar = ({ titulo, texto, botonConfirmar = 'Sí, eliminar' }) => {
  return Swal.fire({
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: botonConfirmar,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup:          'swal-popup',
      title:          'swal-titulo',
      htmlContainer:  'swal-texto',
      confirmButton:  'swal-btn-confirmar',
      cancelButton:   'swal-btn-cancelar',
    },
    buttonsStyling: false
  })
}

export const exito = (mensaje) => {
  return Swal.fire({
    title: mensaje,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    customClass: {
      popup: 'swal-popup',
      title: 'swal-titulo',
    }
  })
}