import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, ChevronRight, Search, SlidersHorizontal,
  ArrowUpDown, Home, X, Kanban, Clock, CheckSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getBoardById } from '../api/boardsApi';
import useTasks from '../hooks/useTasks';
import TaskColumn from '../components/tasks/TaskColumn';
import TaskForm from '../components/tasks/TaskForm';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { getErrorMessage } from '../utils/dateUtils';

/* ─── Shared select style helper ──────────────────────────────── */
const filterSelectStyle = {
  fontSize: 12,
  fontWeight: 500,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  fontFamily: 'inherit',
};

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard]               = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
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

  /* ── Fetch board metadata ─────────────────────────────────── */
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
    return () => localStorage.removeItem('taskflow_current_board_title');
  }, [boardId, navigate]);

  /* ── Filter + split tasks ────────────────────────────────── */
  const filteredTasks = tasks.filter(task => {
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

  /* ── Loading state ───────────────────────────────────────── */
  if (boardLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 14,
      }}>
        <Spinner size="lg" />
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Loading board…
        </p>
      </div>
    );
  }

  if (!board) return null;

  /* ── Last updated display ─────────────────────────────────── */
  const lastUpdated = board.updatedAt
    ? new Date(board.updatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  /* ── RENDER ──────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--bg-page)',
      }}
    >
      {/* ══════════════════════════════════════════════════════
          BOARD HEADER
         ══════════════════════════════════════════════════════ */}
      <div style={{
        padding: '20px 32px 22px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--text-muted)',
          marginBottom: 16,
        }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'var(--text-muted)', textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Home size={12} strokeWidth={2} /> Dashboard
          </Link>
          <ChevronRight size={11} style={{ color: 'var(--text-faint)' }} />
          <span style={{
            color: 'var(--text-primary)', fontWeight: 600,
            maxWidth: 260, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {board.title}
          </span>
        </nav>

        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 20,
          flexWrap: 'wrap',
        }}>
          {/* Left: title + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--bg-surface-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', flexShrink: 0,
              }}>
                <Kanban size={18} strokeWidth={1.75} />
              </div>
              <div>
                <h1 style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.035em',
                  lineHeight: 1.15,
                  margin: 0,
                }}>
                  {board.title}
                </h1>
                {board.description && (
                  <p style={{
                    fontSize: 13, color: 'var(--text-muted)',
                    marginTop: 3, lineHeight: 1.5,
                  }}>
                    {board.description}
                  </p>
                )}
              </div>
            </div>

            {/* Meta chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                <CheckSquare size={12} strokeWidth={2} />
                <span>
                  <b style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {tasks.length}
                  </b> {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {lastUpdated && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--text-muted)',
                }}>
                  <Clock size={12} strokeWidth={2} />
                  <span>Updated {lastUpdated}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Add Task button */}
          <Button
            onClick={() => handleCreateForColumn('todo')}
            icon={<Plus size={14} strokeWidth={2.5} />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TOOLBAR
         ══════════════════════════════════════════════════════ */}
      <div style={{
        padding: '12px 32px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: 220, maxWidth: 300, flex: '1 1 220px' }}>
          <Search size={13} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 34, paddingRight: searchQuery ? 34 : 12,
              paddingTop: 8, paddingBottom: 8,
              background: 'var(--bg-surface-2)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 9,
              fontSize: 13, fontFamily: 'inherit',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                padding: 2, borderRadius: 4,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: 'var(--border-color)', flexShrink: 0 }} />

        {/* Priority filter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 12px',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 9, cursor: 'pointer',
          transition: 'border-color 0.15s ease',
        }}>
          <SlidersHorizontal size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={filters.priority}
            onChange={e => updateFilters({ priority: e.target.value })}
            style={filterSelectStyle}
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Sort */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 12px',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-color)',
          borderRadius: 9,
        }}>
          <ArrowUpDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={filters.sortBy}
            onChange={e => updateFilters({ sortBy: e.target.value })}
            style={filterSelectStyle}
          >
            <option value="order">Default Order</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { updateFilters({ priority: '' }); setSearchQuery(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px',
              background: 'var(--bg-surface-3)',
              border: '1.5px solid var(--border-color)',
              borderRadius: 9,
              fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={11} /> Clear
          </button>
        )}

        {/* Task count — right aligned */}
        <div style={{
          marginLeft: 'auto',
          fontSize: 12, color: 'var(--text-muted)',
          fontWeight: 500, flexShrink: 0,
        }}>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          KANBAN BOARD
         ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'auto',
        padding: '28px 32px',
        background: 'var(--bg-page)',
      }}>
        {tasksLoading ? (
          /* Skeleton */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 18,
                padding: 20,
                display: 'flex', flexDirection: 'column', gap: 14,
                minHeight: 400,
              }}>
                {/* column header skeleton */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="skeleton" style={{ width: 10, height: 10, borderRadius: '50%' }} />
                  <div className="skeleton" style={{ height: 16, width: 100, borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 20, width: 28, borderRadius: 6, marginLeft: 8 }} />
                </div>
                {/* card skeletons */}
                {[0, 1].map(j => (
                  <div key={j} style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 14, padding: 18,
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <div className="skeleton" style={{ height: 12, width: 60, borderRadius: 5 }} />
                    <div className="skeleton" style={{ height: 16, width: '80%', borderRadius: 6 }} />
                    <div className="skeleton" style={{ height: 12, width: '95%', borderRadius: 5 }} />
                    <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 5 }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(300px, 1fr))',
            gap: 20,
            alignItems: 'start',
            minHeight: '100%',
          }}>
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

      {/* ══════════════════════════════════════════════════════
          CREATE TASK MODAL
         ══════════════════════════════════════════════════════ */}
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
    </motion.div>
  );
};

export default BoardPage;
