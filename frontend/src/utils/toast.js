import Swal from 'sweetalert2';

// Toast configuration - matches your old project
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

// Success Toast
export const showSuccess = (message) => {
    Toast.fire({
        icon: 'success',
        title: message || 'Success!',
    });
};

// Error Toast
export const showError = (message) => {
    Toast.fire({
        icon: 'error',
        title: message || 'Error!',
    });
};

// Info Toast
export const showInfo = (message) => {
    Toast.fire({
        icon: 'info',
        title: message || 'Info',
    });
};

// Warning Toast
export const showWarning = (message) => {
    Toast.fire({
        icon: 'warning',
        title: message || 'Warning!',
    });
};

// Delete Confirmation Dialog
export const showDeleteConfirm = (title = 'Are you sure?', text = "You won't be able to revert this!") => {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
    });
};

// Success Dialog (for delete confirmation)
export const showDeletedSuccess = (message = 'Deleted!', text = 'Your item has been deleted.') => {
    return Swal.fire({
        title: message,
        text: text,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
    });
};

// Simple Alert
export const showAlert = (title, message, icon = 'info') => {
    return Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
    });
};

export default {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showDeleteConfirm,
    showDeletedSuccess,
    showAlert,
};