import { useState } from 'react';
import {
  Pencil, Trash2, Calendar, Clock, ChevronRight,
  ChevronLeft, CheckCheck, AlertCircle
} from 'lucide-react';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import TaskForm from './TaskForm';
import ConfirmDialog from '../common/ConfirmDialog';

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    className: 'badge-low',    dot: '#22c55e' },
  medium: { label: 'Medium', className: 'badge-medium', dot: '#f59e0b' },
  high:   { label: 'High',   className: 'badge-high',   dot: '#ef4444' },
};

const STATUS_MOVES = {
  'todo':        [{ status: 'in-progress', label: 'Move to In Progress', Icon: ChevronRight }],
  'in-progress': [
    { status: 'todo',  label: 'Move to To Do',  Icon: ChevronLeft  },
    { status: 'done',  label: 'Mark as Done',   Icon: CheckCheck   },
  ],
  'done':        [{ status: 'in-progress', label: 'Reopen Task', Icon: ChevronLeft }],
};

const TaskCard = ({ task, onUpdate, onDelete, onMove }) => {
  const [showEdit, setShowEdit]       = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [updating, setUpdating]       = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const overdue  = isOverdue(task.dueDate, task.status);
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const moves    = STATUS_MOVES[task.status] || [];

  const handleMove = async (newStatus) => {
    setUpdating(true);
    await onMove(task._id, newStatus);
    setUpdating(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await onDelete(task._id);
    if (res?.success) setShowDelete(false);
    setDeleting(false);
  };

  return (
    <>
      <div
        className={`task-card group ${overdue ? 'overdue' : ''} ${updating ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Card body */}
        <div className="p-4">
          {/* Row 1: Priority badge + Move buttons */}
          <div className="flex items-center justify-between mb-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${priority.className}`}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priority.dot }} />
              {priority.label}
            </span>

            {/* Always-visible move buttons */}
            <div className="flex items-center gap-0.5">
              {moves.map(({ status, label, Icon }) => (
                <button
                  key={status}
                  onClick={() => handleMove(status)}
                  className="p-1.5 rounded-lg text-xs transition-all duration-150"
                  style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'; e.currentTarget.style.color = '#6366f1'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  title={label} aria-label={label}
                >
                  <Icon size={14} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <button
            onClick={() => setShowEdit(true)}
            className="w-full text-left mb-2"
          >
            <h4
              className="text-sm font-semibold leading-snug break-words text-left transition-colors duration-150"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
            >
              {task.title}
            </h4>
          </button>

          {/* Description */}
          {task.description && (
            <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          )}

          {/* Meta row: Due date + Effort */}
          <div className="flex items-center gap-3 flex-wrap">
            {task.dueDate ? (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${overdue ? 'text-red-500' : ''}`}
                style={!overdue ? { color: 'var(--text-muted)' } : {}}>
                {overdue
                  ? <AlertCircle size={12} className="flex-shrink-0" />
                  : <Calendar size={12} className="flex-shrink-0" />
                }
                {formatDate(task.dueDate)}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>No due date</span>
              </div>
            )}

            {task.estimatedEffort && (
              <div className="flex items-center gap-1.5 text-xs ml-auto"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-2)', padding: '2px 8px', borderRadius: '99px' }}>
                <Clock size={11} />
                {task.estimatedEffort}
              </div>
            )}
          </div>
        </div>

        {/* Card footer: Action buttons — always visible, not hidden */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5"
          style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-2)' }}
        >
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; }}
            aria-label="Edit task"
          >
            <Pencil size={12} /> Edit
          </button>

          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'}
            aria-label="Delete task"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <TaskForm
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={async (data) => {
            const res = await onUpdate(task._id, data);
            if (res.success) setShowEdit(false);
          }}
          onDelete={async () => {
            const res = await onDelete(task._id);
            if (res.success) setShowEdit(false);
          }}
          initialData={task}
          title="Edit Task"
        />
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <ConfirmDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete Task?"
          message={`Are you sure you want to delete "${task.title}"? This cannot be undone.`}
          confirmLabel="Delete Task"
          loading={deleting}
        />
      )}
    </>
  );
};

export default TaskCard;
