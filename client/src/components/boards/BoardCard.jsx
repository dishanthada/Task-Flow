import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil, Trash2, ArrowRight, CheckCircle2, Clock,
  Kanban, MoreVertical
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import BoardForm from './BoardForm';
import { formatDate } from '../../utils/dateUtils';

const BoardCard = ({ board, onUpdate, onDelete }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(board._id);
    setDeleting(false);
    setShowDelete(false);
  };

  const completedCount = board.completedCount ?? 0;
  const taskCount = board.taskCount ?? 0;
  const completionPct = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  // Gradient based on index for visual variety
  const gradients = [
    'from-violet-500/10 to-indigo-500/5',
    'from-blue-500/10 to-cyan-500/5',
    'from-emerald-500/10 to-teal-500/5',
    'from-rose-500/10 to-pink-500/5',
    'from-amber-500/10 to-orange-500/5',
    'from-purple-500/10 to-violet-500/5',
  ];
  const gradientIndex = board._id ? board._id.charCodeAt(board._id.length - 1) % gradients.length : 0;
  const gradient = gradients[gradientIndex];

  const accentColors = ['#6366f1','#3b82f6','#10b981','#f43f5e','#f59e0b','#8b5cf6'];
  const accent = accentColors[gradientIndex];

  return (
    <>
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-250 group"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = 'var(--border-strong)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = '';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        {/* Gradient Header Strip */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} style={{ backgroundColor: accent, opacity: 0.8 }} />

        <div className="p-5 flex flex-col flex-1">
          {/* Top row: icon + menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${accent}18`, color: accent }}>
              <Kanban size={20} />
            </div>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(v => !v); }}
                className="btn btn-ghost btn-icon p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Board options"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden animate-scale-in z-20"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)' }}
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="p-1.5">
                    <button
                      onClick={() => { setMenuOpen(false); setShowEdit(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Pencil size={14} /> Edit Board
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setShowDelete(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-red-500"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                    >
                      <Trash2 size={14} /> Delete Board
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title & Description — clickable */}
          <Link to={`/boards/${board._id}`} className="flex-1 flex flex-col gap-1 mb-4">
            <h3
              className="text-base font-semibold leading-tight line-clamp-1 transition-colors duration-150"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={e => e.currentTarget.style.color = accent}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
            >
              {board.title}
            </h3>
            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {board.description || 'No description provided.'}
            </p>
          </Link>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Progress</span>
              <span className="text-xs font-bold" style={{ color: accent }}>{completionPct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%`, backgroundColor: accent }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={13} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {board.updatedAt && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(board.updatedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Footer: Edit, Delete, Open */}
          <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 text-red-500"
              style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.12)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'}
            >
              <Trash2 size={12} /> Delete
            </button>
            <Link
              to={`/boards/${board._id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ml-auto text-white"
              style={{ background: `linear-gradient(135deg,${accent},${accent}cc)`, boxShadow: `0 2px 8px ${accent}40` }}
            >
              Open <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

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

      {/* Delete Confirmation */}
      {showDelete && (
        <ConfirmDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="Delete Board?"
          message={`Are you sure you want to delete "${board.title}"? All tasks inside this board will be permanently deleted.`}
          confirmLabel="Delete Board"
          loading={deleting}
        />
      )}
    </>
  );
};

export default BoardCard;
