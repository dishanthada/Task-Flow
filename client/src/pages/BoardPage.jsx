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
        setBoard(res.data.board);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/dashboard');
      } finally {
        setBoardLoading(false);
      }
    };
    fetchBoard();
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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>Loading board...</p>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div
        className="px-5 sm:px-8 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <Link to="/dashboard" className="flex items-center gap-1 transition-colors duration-150 hover:text-indigo-500">
            <Home size={12} /> Dashboard
          </Link>
          <ChevronRight size={12} />
          <span className="font-medium truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
            {board.title}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {board.title}
            </h1>
            {board.description && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {board.description}
              </p>
            )}
          </div>

          <Button
            onClick={() => handleCreateForColumn('todo')}
            icon={<Plus size={16} strokeWidth={2.5} />}
            className="self-start sm:self-auto flex-shrink-0"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="px-5 sm:px-8 py-3 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-2)' }}
      >
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-9 pr-8 py-2 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <SlidersHorizontal size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              value={filters.priority}
              onChange={e => updateFilters({ priority: e.target.value })}
              className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <option value="">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <ArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
            <select
              value={filters.sortBy}
              onChange={e => updateFilters({ sortBy: e.target.value })}
              className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <option value="order">Default</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created</option>
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => { updateFilters({ priority: '' }); setSearchQuery(''); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ color: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Task count summary */}
        <div className="flex items-center gap-2 ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-5 sm:p-8">
        {tasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col gap-3">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                {i === 0 && <TaskCardSkeleton />}
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
