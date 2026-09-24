import toast from 'react-hot-toast';

export const notify = {
  success: (message) => toast.success(message, {
    style: {
      background: '#1e293b',
      color: '#fff',
      border: '1px solid rgba(16, 185, 129, 0.2)',
    },
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  }),
  error: (message) => toast.error(message, {
    style: {
      background: '#1e293b',
      color: '#fff',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  }),
  loading: (message) => toast.loading(message, {
    style: {
      background: '#1e293b',
      color: '#fff',
      border: '1px solid rgba(59, 130, 246, 0.2)',
    },
  }),
  dismiss: (id) => toast.dismiss(id),
};
