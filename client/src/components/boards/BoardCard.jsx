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

  return (
    <>
      <div
        className="relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 group bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-black dark:hover:border-white"
      >
        {/* Minimal Black Top Strip */}
        <div className="h-1 w-full bg-black dark:bg-white" />

        <div className="p-5 flex flex-col flex-1">
          {/* Top Row: Icon + Menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F5F5F5] dark:bg-neutral-800 text-black dark:text-white flex-shrink-0">
              <Kanban size={16} />
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen(v => !v); }}
                className="p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Board options"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 shadow-lg z-20 p-1"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => { setMenuOpen(false); setShowEdit(true); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-neutral-600 hover:bg-neutral-50 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white transition-all text-left"
                  >
                    <Pencil size={12} /> Edit Board
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setShowDelete(true); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left"
                  >
                    <Trash2 size={12} /> Delete Board
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <Link to={`/boards/${board._id}`} className="flex-1 flex flex-col gap-1.5 mb-4">
            <h3 className="text-sm font-bold text-black dark:text-white leading-tight line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
              {board.title}
            </h3>
            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {board.description || 'No description provided.'}
            </p>
          </Link>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-bold text-black dark:text-white">{completionPct}%</span>
            </div>
            <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <CheckCircle2 size={13} />
              <span className="text-[11px] font-medium">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {board.updatedAt && (
              <div className="flex items-center gap-1 ml-auto text-neutral-400 text-[10px]">
                <Clock size={10} />
                <span>{formatDate(board.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#E8E8E8] dark:border-neutral-800">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E8E8E8] dark:border-neutral-800 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900 transition-all"
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <Trash2 size={11} /> Delete
            </button>
            <Link
              to={`/boards/${board._id}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all ml-auto"
            >
              Open <ArrowRight size={11} />
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
