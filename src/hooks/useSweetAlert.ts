import Swal from 'sweetalert2';

export const useSweetAlert = () => {
  const showSuccess = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: '¡Perfecto!',
      confirmButtonColor: '#00ff9c',
      background: '#1e293b',
      color: '#ffffff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-button'
      }
    });
  };

  const showError = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ef4444',
      background: '#1e293b',
      color: '#ffffff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-button'
      }
    });
  };

  const showWarning = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#f59e0b',
      background: '#1e293b',
      color: '#ffffff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-button'
      }
    });
  };

  const showInfo = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3b82f6',
      background: '#1e293b',
      color: '#ffffff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-button'
      }
    });
  };

  const showConfirm = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00ff9c',
      cancelButtonColor: '#ef4444',
      background: '#1e293b',
      color: '#ffffff',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        confirmButton: 'swal-confirm-button',
        cancelButton: 'swal-cancel-button'
      }
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
};
