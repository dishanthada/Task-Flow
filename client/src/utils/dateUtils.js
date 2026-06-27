/**
 * Check if a task's due date is in the past
 */
export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
};

/**
 * Format a date string to a human-readable format
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options,
    });
  } catch {
    return '—';
  }
};

/**
 * Format date for <input type="date"> value (YYYY-MM-DD)
 */
export const toInputDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 */
export const getRelativeTime = (date) => {
  if (!date) return null;
  try {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const now  = new Date();
    const then = new Date(date);
    const diff = Math.round((then - now) / (1000 * 60 * 60 * 24));

    if (Math.abs(diff) < 1) return 'today';
    if (Math.abs(diff) < 7) return rtf.format(diff, 'day');
    if (Math.abs(diff) < 30) return rtf.format(Math.round(diff / 7), 'week');
    return rtf.format(Math.round(diff / 30), 'month');
  } catch {
    return null;
  }
};

/**
 * Extract a user-friendly error message from an Axios error
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  if (error?.message) {
    if (error.message === 'Network Error') {
      return 'Cannot connect to server. Please check your connection.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Truncate a string to a max length with ellipsis
 */
export const truncate = (str, maxLength = 80) => {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
};
