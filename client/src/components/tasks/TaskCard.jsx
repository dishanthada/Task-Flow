import { useState } from 'react';
import {
  Pencil, Trash2, Calendar, Clock, ChevronRight,
  ChevronLeft, CheckCheck, AlertCircle, Sparkles
} from 'lucide-react';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import TaskForm from './TaskForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { motion } from 'framer-motion';

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    className: 'badge-priority-low',    dot: '#16A34A' },
  medium: { label: 'Medium', className: 'badge-priority-medium', dot: '#F59E0B' },
  high:   { label: 'High',   className: 'badge-priority-high',   dot: '#DC2626' },
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
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`task-card group flex flex-col bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-black dark:hover:border-white ${
          updating ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col gap-2.5">
          {/* Header Row: Priority + Status Move Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${priority.className}`}>
                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: priority.dot }} />
                {priority.label}
              </span>
              
              {/* AI Indicator badge */}
              {task.isAiEstimated && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                  <Sparkles size={8} /> AI
                </span>
              )}
            </div>

            {/* Move task trigger buttons */}
            <div className="flex items-center gap-0.5">
              {moves.map(({ status, label, Icon }) => (
                <button
                  key={status}
                  onClick={() => handleMove(status)}
                  className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                  title={label}
                  aria-label={label}
                >
                  <Icon size={12} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Title - Triggers Edit */}
          <button
            onClick={() => setShowEdit(true)}
            className="w-full text-left focus:outline-none"
          >
            <h4 className="text-xs font-bold text-black dark:text-white leading-snug break-words hover:text-neutral-500 transition-colors">
              {task.title}
            </h4>
          </button>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-neutral-500 leading-normal line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row: Due date + Effort Estimate */}
          <div className="flex items-center gap-3 mt-auto pt-1 flex-wrap text-[10px] text-neutral-400">
            {task.dueDate ? (
              <div className={`flex items-center gap-1 font-medium ${overdue ? 'text-red-500' : ''}`}>
                {overdue ? <AlertCircle size={11} /> : <Calendar size={11} />}
                <span>{formatDate(task.dueDate)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>No due date</span>
              </div>
            )}

            {task.estimatedEffort && (
              <div className="flex items-center gap-1 ml-auto px-2 py-0.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850">
                <Clock size={10} />
                <span>{task.estimatedEffort}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Always Visible Edit/Delete buttons */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border-t border-[#E8E8E8] dark:bg-neutral-900/50 dark:border-neutral-800">
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1 px-2.5 py-1.25 rounded-md text-[10px] font-semibold bg-white border border-[#E8E8E8] dark:bg-neutral-800 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <Pencil size={10} /> Edit
          </button>

          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1 px-2.5 py-1.25 rounded-md text-[10px] font-semibold border border-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ml-auto"
          >
            <Trash2 size={10} /> Delete
          </button>
        </div>
      </motion.div>

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
