import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, ArrowRight, CheckCircle2, Clock, Kanban } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmDialog from '../common/ConfirmDialog';
import BoardForm from './BoardForm';
import { formatDate } from '../../utils/dateUtils';

const BoardCard = ({ board, onUpdate, onDelete }) => {
  const [showEdit,   setShowEdit]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(board._id);
    setDeleting(false);
    setShowDelete(false);
  };

  const completedCount = board.completedCount ?? 0;
  const taskCount      = board.taskCount ?? 0;
  const pct            = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <>
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 16px 40px rgba(0,0,0,0.10)' }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 18,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
          height: '100%',
          minHeight: 240,
          cursor: 'default',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: 'var(--color-primary)', flexShrink: 0 }} />

        {/* Card body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>

          {/* Icon row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'var(--bg-surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              flexShrink: 0,
            }}>
              <Kanban size={16} strokeWidth={1.75} />
            </div>

            {/* Task count badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--bg-surface-3)',
              padding: '4px 10px', borderRadius: 20,
            }}>
              <CheckCircle2 size={11} />
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* Title + Description */}
          <Link
            to={`/boards/${board._id}`}
            style={{ textDecoration: 'none', display: 'block', marginBottom: 18, flex: 1 }}
          >
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              marginBottom: 8,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              transition: 'color 0.15s ease',
            }}>
              {board.title}
            </h3>
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {board.description || 'No description provided.'}
            </p>
          </Link>

          {/* Progress */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 7,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Progress
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                {pct}%
              </span>
            </div>
            <div style={{
              height: 5, borderRadius: 99,
              background: 'var(--bg-surface-3)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  borderRadius: 99,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
          </div>

          {/* Meta row */}
          {board.updatedAt && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, color: 'var(--text-muted)',
              marginBottom: 18,
            }}>
              <Clock size={11} />
              <span>Updated {formatDate(board.updatedAt)}</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--border-color)',
            flexShrink: 0,
          }}>
            {/* Edit */}
            <button
              onClick={() => setShowEdit(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 13px',
                borderRadius: 9,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-surface-3)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Pencil size={11} /> Edit
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDelete(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 13px',
                borderRadius: 9,
                border: '1px solid rgba(220,38,38,0.25)',
                background: 'transparent',
                color: 'var(--red)',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--red)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'var(--red)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--red)';
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.25)';
              }}
            >
              <Trash2 size={11} /> Delete
            </button>

            {/* Open — push right */}
            <Link
              to={`/boards/${board._id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 14px',
                borderRadius: 9,
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: 12, fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                marginLeft: 'auto',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.85';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'none';
              }}
            >
              Open <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      {showEdit && (
        <BoardForm
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={async (data) => {
            const res = await onUpdate(board._id, data);
            if (res.success) setShowEdit(false);
          }}
          initialData={board}
          title="Edit Board"
        />
      )}

      {/* Delete Confirm */}
      {showDelete && (
        <ConfirmDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete Board?"
          message={`Are you sure you want to delete "${board.title}"? All tasks inside will be permanently deleted.`}
          confirmLabel="Delete Board"
          loading={deleting}
        />
      )}
    </>
  );
};

export default BoardCard;
