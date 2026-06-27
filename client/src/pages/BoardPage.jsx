import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, ChevronRight, Search, SlidersHorizontal,
  ArrowUpDown, Home, X
} from 'lucide-react';
import { getBoardById } from '../api/boardsApi';
import useTasks from '../hooks/useTasks';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskForm from '../components/tasks/TaskForm';
import Spinner from '../components/common/Spinner';
import { TaskCardSkeleton } from '../components/common/SkeletonCard';
import Button from '../components/common/Button';
import { getErrorMessage } from '../utils/dateUtils';

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard]             = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createStatus, setCreateStatus] = useState('todo');

  const {
    tasks,
    loading: tasksLoading,
    filters,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    updateFilters,
  } = useTasks(boardId);

  useEffect(() => {
    const fetchBoard = async () => {
      setBoardLoading(true);
      try {
        const res = await getBoardById(boardId);
        const bData = res.data.board;
        setBoard(bData);
        localStorage.setItem('taskflow_current_board_title', bData.title);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/dashboard');
      } finally {
        setBoardLoading(false);
      }
    };
    fetchBoard();

    return () => {
      localStorage.removeItem('taskflow_current_board_title');
    };
  }, [boardId, navigate]);

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description || '').toLowerCase().includes(q)
    );
  });

  const todoTasks       = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
  const doneTasks       = filteredTasks.filter(t => t.status === 'done');

  const handleCreateForColumn = (status) => {
    setCreateStatus(status);
    setShowCreateTask(true);
  };

  const hasActiveFilters = filters.priority || searchQuery;

  if (boardLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
        <Spinner size="lg" />
        <p className="text-xs mt-3 text-neutral-400">Loading board details...</p>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Board Header Banner */}
      <div
        className="px-6 sm:px-8 py-5 border-b border-[#E8E8E8] bg-white dark:bg-[#121212] dark:border-neutral-800"
      >
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3.5">
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
            <Home size={11} /> Dashboard
          </Link>
          <ChevronRight size={10} />
          <span className="font-semibold text-black dark:text-white truncate max-w-[200px]">
            {board.title}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-black dark:text-white">
              {board.title}
            </h1>
            {board.description && (
              <p className="text-xs text-neutral-500 mt-1">
                {board.description}
              </p>
            )}
          </div>

          <Button
            onClick={() => handleCreateForColumn('todo')}
            icon={<Plus size={14} strokeWidth={2.5} />}
            className="btn-primary py-2 text-xs rounded-lg self-start sm:self-auto flex-shrink-0"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="px-6 sm:px-8 py-3 border-b border-[#E8E8E8] bg-[#FAFAFA] dark:bg-neutral-900/40 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
      >
        {/* Search Input field */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-8.5 pr-8 py-1.75 text-xs bg-white dark:bg-[#121212]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Toolbar selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800">
            <SlidersHorizontal size={11} className="text-neutral-400" />
            <select
              value={filters.priority}
              onChange={e => updateFilters({ priority: e.target.value })}
              className="text-[11px] font-semibold bg-transparent border-none outline-none cursor-pointer text-neutral-600 dark:text-neutral-300"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800">
            <ArrowUpDown size={11} className="text-neutral-400" />
            <select
              value={filters.sortBy}
              onChange={e => updateFilters({ sortBy: e.target.value })}
              className="text-[11px] font-semibold bg-transparent border-none outline-none cursor-pointer text-neutral-600 dark:text-neutral-300"
            >
              <option value="order">Default Order</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={() => { updateFilters({ priority: '' }); setSearchQuery(''); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-all border border-transparent"
            >
              <X size={11} /> Clear Filters
            </button>
          )}
        </div>

        {/* Count summary */}
        <div className="flex items-center gap-2 ml-auto text-[11px] text-neutral-400 font-medium">
          <span>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
      </div>

      {/* Kanban Board columns wrapper */}
      <div className="flex-1 overflow-auto p-6 sm:p-8 bg-[#F5F5F5] dark:bg-[#0A0A0A]">
        {tasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col gap-3">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start min-h-full">
            <TaskColumn
              status="todo"
              tasks={todoTasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onMoveTask={moveTask}
              onCreateTaskClick={() => handleCreateForColumn('todo')}
            />
            <TaskColumn
              status="in-progress"
              tasks={inProgressTasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onMoveTask={moveTask}
              onCreateTaskClick={() => handleCreateForColumn('in-progress')}
            />
            <TaskColumn
              status="done"
              tasks={doneTasks}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onMoveTask={moveTask}
              onCreateTaskClick={() => handleCreateForColumn('done')}
            />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <TaskForm
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onSubmit={async (data) => {
            const res = await createTask({ ...data, status: createStatus });
            if (res.success) setShowCreateTask(false);
          }}
          title="Create New Task"
          defaultStatus={createStatus}
        />
      )}
    </div>
  );
};

export default BoardPage;
