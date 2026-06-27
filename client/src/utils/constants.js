// ─── Task Status Options ─────────────────────────────────────────────────────
export const TASK_STATUSES = [
  { value: 'todo',        label: 'To Do',       color: '#64748b' },
  { value: 'in-progress', label: 'In Progress', color: '#f59e0b' },
  { value: 'done',        label: 'Done',        color: '#10b981' },
];

// ─── Task Priority Options ────────────────────────────────────────────────────
export const TASK_PRIORITIES = [
  { value: 'low',    label: 'Low',    color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high',   label: 'High',   color: '#ef4444' },
];

// ─── Sort Options ─────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'order',     label: 'Default Order' },
  { value: 'dueDate',   label: 'Due Date' },
  { value: 'priority',  label: 'Priority' },
  { value: 'createdAt', label: 'Date Created' },
];

// ─── localStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'taskflow_token',
  USER:  'taskflow_user',
  THEME: 'taskflow_theme',
};

// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
