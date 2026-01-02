// Adaptador para usar el nuevo sistema de alertas globales (Snackbar)
import { useAlert } from '../context/AlertContext';

export function useAlertAdapter() {
  const { showAlert } = useAlert();

  const alertSuccess = (text, title) => {
    showAlert(text, 'success');
  };

  const alertError = (text, title) => {
    showAlert(text, 'error');
  };

  return { alertSuccess, alertError };
}
