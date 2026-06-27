import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasksApi';
import { getErrorMessage } from '../utils/dateUtils';

/**
 * Custom hook to manage tasks state, filtering, and sorting for a specific board.
 */
export const useTasks = (boardId, initialFilters = {}) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    status: '',
    sortBy: 'order',
    sortOrder: 'asc',
    ...initialFilters,
  });

  const fetchTasks = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const activeFilters = {};
      if (filters.priority) activeFilters.priority = filters.priority;
      if (filters.status)   activeFilters.status   = filters.status;
      if (filters.sortBy) {
        activeFilters.sortBy = filters.sortBy;
        activeFilters.sortOrder = filters.sortOrder;
      }

      const res = await getTasks(boardId, activeFilters);
      setTasks(res.data.tasks);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [boardId, filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (data) => {
    try {
      const res = await createTask(boardId, data);
      setTasks((prev) => [...prev, res.data.task]);
      toast.success('Task created successfully! ✅');
      return { success: true, task: res.data.task };
    } catch (err) {
      toast.error(getErrorMessage(err));
      return { success: false, error: err };
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    try {
      const res = await updateTask(boardId, taskId, data);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...res.data.task } : t))
      );
      return { success: true, task: res.data.task };
    } catch (err) {
      toast.error(getErrorMessage(err));
      return { success: false, error: err };
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(boardId, taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted successfully.');
      return { success: true };
    } catch (err) {
      toast.error(getErrorMessage(err));
      return { success: false, error: err };
    }
  };

  /**
   * Fast drag-and-drop / column movement.
   * Optimistically updates UI state and syncs with backend.
   */
  const handleMoveTask = async (taskId, newStatus, newOrder = 0) => {
    const originalTasks = [...tasks];

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, status: newStatus, order: newOrder } : t
      )
    );

    try {
      const res = await updateTask(boardId, taskId, {
        status: newStatus,
        order: newOrder,
      });

      // Update with exact backend state
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, ...res.data.task } : t))
      );
    } catch {
      // Revert optimistic update on failure
      setTasks(originalTasks);
      toast.error('Failed to move task. Reverting change.');
    }
  };

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    tasks,
    loading,
    filters,
    refreshTasks: fetchTasks,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    moveTask: handleMoveTask,
    updateFilters,
  };
};

export default useTasks;
