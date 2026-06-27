import { Plus, ClipboardList } from 'lucide-react';
import TaskCard from './TaskCard';

const COLUMN_CONFIG = {
  'todo': {
    label: 'To Do',
    dotColor: '#64748b',
    headerBg: 'rgba(100,116,139,0.08)',
    borderColor: '#64748b',
    emptyIcon: '📋',
    emptyMsg: 'No tasks yet. Add one to get started!',
  },
  'in-progress': {
    label: 'In Progress',
    dotColor: '#f59e0b',
    headerBg: 'rgba(245,158,11,0.08)',
    borderColor: '#f59e0b',
    emptyIcon: '⚡',
    emptyMsg: 'Nothing in progress. Pick a task to start!',
  },
  'done': {
    label: 'Done',
    dotColor: '#10b981',
    headerBg: 'rgba(16,185,129,0.08)',
    borderColor: '#10b981',
    emptyIcon: '🏆',
    emptyMsg: 'No completed tasks yet. Keep going!',
  },
};

const TaskColumn = ({
  status,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onCreateTaskClick,
}) => {
  const config = COLUMN_CONFIG[status] || COLUMN_CONFIG['todo'];
  const count = tasks.length;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderTop: `3px solid ${config.borderColor}`,
        boxShadow: 'var(--shadow-sm)',
        minHeight: '480px',
      }}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: config.headerBg, borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: config.dotColor, boxShadow: `0 0 6px ${config.dotColor}60` }}
          />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {config.label}
          </span>
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: count > 0 ? config.dotColor : 'var(--bg-surface-3)',
              color: count > 0 ? 'white' : 'var(--text-muted)',
            }}
          >
            {count}
          </span>
        </div>

        {/* Add task button — all columns */}
        <button
          onClick={onCreateTaskClick}
          className="p-1.5 rounded-lg transition-all duration-150"
          style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = config.headerBg; e.currentTarget.style.color = config.dotColor; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title={`Add task to ${config.label}`}
          aria-label={`Add task to ${config.label}`}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none flex-1">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
              style={{ backgroundColor: config.headerBg }}
            >
              {config.emptyIcon}
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {config.emptyMsg}
            </p>
            <button
              onClick={onCreateTaskClick}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{ color: config.dotColor, backgroundColor: config.headerBg }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={13} strokeWidth={2.5} /> Add Task
            </button>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task._id}
              className="animate-card-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <TaskCard
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onMove={onMoveTask}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer: Add task shortcut */}
      {count > 0 && (
        <div className="flex-shrink-0 px-3 pb-3">
          <button
            onClick={onCreateTaskClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-150"
            style={{
              color: 'var(--text-muted)',
              border: '1.5px dashed var(--border-color)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = config.dotColor; e.currentTarget.style.borderColor = config.dotColor; e.currentTarget.style.backgroundColor = config.headerBg; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = ''; }}
          >
            <Plus size={13} strokeWidth={2.5} /> Add Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskColumn;
