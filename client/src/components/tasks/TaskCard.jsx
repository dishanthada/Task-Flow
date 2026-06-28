import { useState } from 'react';
import {
  Pencil, Trash2, Calendar, Clock,
  ChevronRight, ChevronLeft, CheckCheck,
  AlertCircle, Sparkles, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import TaskForm from './TaskForm';
import ConfirmDialog from '../common/ConfirmDialog';

/* ─── Configs ──────────────────────────────────────────────────── */
const PRIORITY_CONFIG = {
  low:    { label: 'Low',    dotColor: '#16A34A', bg: 'rgba(22,163,74,0.08)',  text: '#16A34A', border: 'rgba(22,163,74,0.2)'  },
  medium: { label: 'Medium', dotColor: '#D97706', bg: 'rgba(217,119,6,0.08)', text: '#D97706', border: 'rgba(217,119,6,0.2)' },
  high:   { label: 'High',   dotColor: '#DC2626', bg: 'rgba(220,38,38,0.08)', text: '#DC2626', border: 'rgba(220,38,38,0.2)' },
};

const STATUS_MOVES = {
  'todo':        [{ status: 'in-progress', label: 'Move to In Progress', Icon: ChevronRight }],
  'in-progress': [
    { status: 'todo',  label: 'Move to To Do',  Icon: ChevronLeft  },
    { status: 'done',  label: 'Mark as Done',   Icon: CheckCheck   },
  ],
  'done':        [{ status: 'in-progress', label: 'Reopen Task', Icon: ChevronLeft }],
};

/* ─── Shared style helper ──────────────────────────────────────── */
const metaStyle = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: 12, color: 'var(--text-muted)',
  fontWeight: 500,
};

/* ─── TaskCard ─────────────────────────────────────────────────── */
const TaskCard = ({ task, onUpdate, onDelete, onMove }) => {
  const [showEdit,   setShowEdit]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [updating,   setUpdating]   = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [hovered,    setHovered]    = useState(false);

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
      <motion.div
        layout
        whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          background: 'var(--bg-surface)',
          border: `1.5px solid ${hovered ? 'var(--border-strong)' : 'var(--border-color)'}`,
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xs)',
          opacity: updating ? 0.5 : 1,
          pointerEvents: updating ? 'none' : 'auto',
          transition: 'border-color 0.15s ease, opacity 0.2s ease',
          cursor: 'default',
        }}
      >
        {/* ── Card Body ─────────────────────────────────────── */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Row 1: Priority badge + AI badge + Move buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            {/* Left badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {/* Priority */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 600,
                padding: '3px 8px', borderRadius: 6,
                background: priority.bg,
                color: priority.text,
                border: `1px solid ${priority.border}`,
                letterSpacing: '0.01em',
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: priority.dotColor, flexShrink: 0,
                  display: 'inline-block',
                }} />
                {priority.label}
              </span>

              {/* AI badge */}
              {task.isAiEstimated && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, fontWeight: 700,
                  padding: '3px 7px', borderRadius: 5,
                  background: 'var(--bg-surface-3)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}>
                  <Sparkles size={9} /> AI
                </span>
              )}
            </div>

            {/* Move buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              {moves.map(({ status, label, Icon }) => (
                <button
                  key={status}
                  onClick={() => handleMove(status)}
                  title={label}
                  aria-label={label}
                  style={{
                    width: 26, height: 26,
                    borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Icon size={13} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Title */}
          <button
            onClick={() => setShowEdit(true)}
            style={{
              width: '100%', textAlign: 'left',
              background: 'none', border: 'none', padding: 0,
              cursor: 'pointer',
            }}
          >
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              letterSpacing: '-0.015em',
              margin: 0,
              wordBreak: 'break-word',
              transition: 'color 0.12s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
            >
              {task.title}
            </h4>
          </button>

          {/* Row 3: Description */}
          {task.description && (
            <p style={{
              fontSize: 12, color: 'var(--text-muted)',
              lineHeight: 1.6, margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </p>
          )}

          {/* Row 4: AI Estimate chip */}
          {task.isAiEstimated && task.estimatedEffort && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={11} strokeWidth={2} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Estimate
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {task.estimatedEffort && (
                  <span style={metaStyle}>
                    <Clock size={11} /> {task.estimatedEffort}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Row 5: Meta (due date + effort if not AI) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Due date */}
            {task.dueDate ? (
              <span style={{
                ...metaStyle,
                color: overdue ? '#DC2626' : 'var(--text-muted)',
                fontWeight: overdue ? 600 : 500,
              }}>
                {overdue
                  ? <AlertCircle size={12} style={{ color: '#DC2626' }} />
                  : <Calendar size={12} />
                }
                {formatDate(task.dueDate)}
                {overdue && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 5,
                    background: 'rgba(220,38,38,0.08)',
                    color: '#DC2626',
                    border: '1px solid rgba(220,38,38,0.2)',
                    marginLeft: 4,
                  }}>
                    Overdue
                  </span>
                )}
              </span>
            ) : (
              <span style={metaStyle}>
                <Calendar size={12} /> No due date
              </span>
            )}

            {/* Effort (if not AI estimated) */}
            {task.estimatedEffort && !task.isAiEstimated && (
              <span style={{
                ...metaStyle,
                padding: '3px 8px', borderRadius: 6,
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-color)',
              }}>
                <Clock size={11} /> {task.estimatedEffort}
              </span>
            )}
          </div>
        </div>

        {/* ── Card Footer: Action Buttons ────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '10px 18px 12px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-surface-2)',
          flexShrink: 0,
        }}>
          {/* Edit */}
          <button
            onClick={() => setShowEdit(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 7,
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-3)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Pencil size={10} /> Edit
          </button>

          {/* Move buttons (in footer too for quick action) */}
          {moves.map(({ status, label, Icon }) => (
            <button
              key={`footer-${status}`}
              onClick={() => handleMove(status)}
              title={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 11px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 7,
                fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-3)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Icon size={10} />
              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </button>
          ))}

          {/* Delete — right-aligned */}
          <button
            onClick={() => setShowDelete(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 11px',
              background: 'transparent',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 7,
              fontSize: 11, fontWeight: 600,
              color: 'var(--red)',
              cursor: 'pointer',
              transition: 'all 0.12s ease',
              marginLeft: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.25)'; }}
          >
            <Trash2 size={10} /> Delete
          </button>
        </div>
      </motion.div>

      {/* ── Edit Modal ─────────────────────────────────────── */}
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

      {/* ── Delete Confirm ─────────────────────────────────── */}
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
