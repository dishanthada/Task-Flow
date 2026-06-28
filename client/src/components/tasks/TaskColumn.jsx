import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';

/* ─── Column configuration ─────────────────────────────────────── */
const COLUMN_CONFIG = {
  'todo': {
    label:    'To Do',
    dotColor: '#111111',
    emptyIcon: '📋',
    emptyTitle: 'No tasks to do',
    emptyMsg: 'Add a task to get started on this board.',
  },
  'in-progress': {
    label:    'In Progress',
    dotColor: '#D97706',
    emptyIcon: '⚡',
    emptyTitle: 'Nothing in progress',
    emptyMsg: 'Pick a task from To Do and start working on it.',
  },
  'done': {
    label:    'Done',
    dotColor: '#16A34A',
    emptyIcon: '🏆',
    emptyTitle: 'No completed tasks',
    emptyMsg: 'Complete tasks will appear here. Keep going!',
  },
};

/* ─── TaskColumn ───────────────────────────────────────────────── */
const TaskColumn = ({
  status,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onCreateTaskClick,
}) => {
  const config = COLUMN_CONFIG[status] || COLUMN_CONFIG['todo'];
  const count  = tasks.length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 18,
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      minHeight: 520,
    }}>

      {/* ── Column Header ─────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 20px 14px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        {/* Left: dot + title + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 9, height: 9,
            borderRadius: '50%',
            background: config.dotColor,
            flexShrink: 0,
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}>
            {config.label}
          </span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22, height: 22,
            padding: '0 6px',
            borderRadius: 7,
            background: 'var(--bg-surface-3)',
            fontSize: 11, fontWeight: 700,
            color: 'var(--text-secondary)',
          }}>
            {count}
          </span>
        </div>

        {/* Right: + button */}
        <button
          onClick={onCreateTaskClick}
          title={`Add task to ${config.label}`}
          style={{
            width: 28, height: 28,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-surface-3)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Task List ─────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '14px 14px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxHeight: 'calc(100vh - 340px)',
        minHeight: 280,
      }}>
        {count === 0 ? (
          /* Empty State */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '40px 20px',
            textAlign: 'center',
            minHeight: 260,
            userSelect: 'none',
          }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: 'var(--bg-surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 16,
            }}>
              {config.emptyIcon}
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 6, letterSpacing: '-0.01em',
            }}>
              {config.emptyTitle}
            </div>
            <p style={{
              fontSize: 12, color: 'var(--text-muted)',
              lineHeight: 1.55, maxWidth: 180, marginBottom: 20,
            }}>
              {config.emptyMsg}
            </p>
            <button
              onClick={onCreateTaskClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none', borderRadius: 9,
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
            >
              <Plus size={12} strokeWidth={2.5} /> Add Task
            </button>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task, idx) => (
              <motion.div
                key={task._id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.22,
                  delay: idx * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <TaskCard
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  onMove={onMoveTask}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer Add Button ─────────────────────────────── */}
      {count > 0 && (
        <div style={{ padding: '8px 14px 14px', flexShrink: 0 }}>
          <button
            onClick={onCreateTaskClick}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6,
              padding: '9px',
              background: 'transparent',
              border: '1.5px dashed var(--border-color)',
              borderRadius: 10,
              fontSize: 12, fontWeight: 500,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-surface-2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Plus size={13} strokeWidth={2.5} /> Add Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskColumn;
