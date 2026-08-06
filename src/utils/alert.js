import Swal from 'sweetalert2';

const COLORS = {
  success: '#2ec4b6',
  danger: '#e63946',
  gray: '#6b7280',
};

const baseConfirm = (options) =>
  Swal.fire({
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: COLORS.success,
    cancelButtonColor: COLORS.gray,
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    ...options,
  });

export const confirmApprove = () =>
  baseConfirm({
    title: 'Approve Donation?',
    text: 'Are you sure you want to approve this donation?',
  });

export const confirmReject = () =>
  baseConfirm({
    title: 'Reject Donation?',
    text: 'This donation will be marked as rejected.',
    icon: 'warning',
    confirmButtonColor: COLORS.danger,
    confirmButtonText: 'Reject',
  });

export const confirmDelete = () =>
  baseConfirm({
    title: 'Delete Record?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    confirmButtonColor: COLORS.danger,
    confirmButtonText: 'Delete',
  });

export const toast = (message, type = 'success') => {
  const icons = { success: 'success', error: 'error', info: 'info', warning: 'warning' };
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icons[type] || 'info',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (el) => {
      el.addEventListener('mouseenter', Swal.stopTimer);
      el.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
};

export const errorPopup = (message) =>
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: COLORS.danger,
  });
