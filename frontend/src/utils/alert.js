// src/utils/alert.js
import Swal from 'sweetalert2';

export const showAlert = ({ 
  title = '', 
  text = '', 
  icon = 'info', 
  timer = 2300, 
  showConfirmButton = false, 
  ...rest
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    timer,
    showConfirmButton,
    ...rest
  });
};

// Atajos rápidos para éxito y error
export const alertSuccess = (text, title = '¡Éxito!') =>
  showAlert({ icon: 'success', title, text });

export const alertError = (text, title = 'Ups...') =>
  showAlert({ icon: 'error', title, text, showConfirmButton: true });

// Alerta simple sin modal (para usar dentro de modales existentes)
export const showSimpleAlert = async (text, icon = 'success', duration = 2300) => {
  return new Promise((resolve) => {
    Swal.fire({
      title: text,
      icon,
      timer: duration,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        setTimeout(() => {
          Swal.hideLoading();
        }, duration);
      },
    }).then(() => {
      resolve();
    });
  });
};