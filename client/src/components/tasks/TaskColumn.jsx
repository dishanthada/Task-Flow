import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const COLUMN_CONFIG = {
  'todo': {
    label: 'To Do',
    dotClass: 'dot-todo bg-black dark:bg-white',
    emptyIcon: '📋',
    emptyMsg: 'No tasks to do. Add one to get started!',
  },
  'in-progress': {
    label: 'In Progress',
    dotClass: 'dot-progress bg-neutral-500',
    emptyIcon: '⚡',
    emptyMsg: 'No tasks in progress. Pick a task to start working!',
  },
  'done': {
    label: 'Done',
    dotClass: 'dot-done bg-black dark:bg-white',
    emptyIcon: '🏆',
    emptyMsg: 'No completed tasks yet. Great things take time!',
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
      className="flex flex-col bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs min-h-[480px]"
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          {/* Header indicator dot */}
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
          <span className="text-xs font-bold text-black dark:text-white">
            {config.label}
          </span>
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500">
            {count}
          </span>
        </div>

        {/* Add task button on header */}
        <button
          onClick={onCreateTaskClick}
          className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          title={`Add task to ${config.label}`}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 max-h-[calc(100vh-280px)]">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none flex-1">
            <div className="w-12 h-12 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-[#E8E8E8] dark:border-neutral-800 flex items-center justify-center text-xl mb-4">
              {config.emptyIcon}
            </div>
            <p className="text-xs font-semibold text-black dark:text-white">
              No tasks in {config.label.toLowerCase()}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[150px] leading-normal">
              {config.emptyMsg}
            </p>
            <button
              onClick={onCreateTaskClick}
              className="mt-4 flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-xs"
            >
              <Plus size={11} strokeWidth={2.5} /> Add Task
            </button>
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task._id}
              className="animate-card-in"
              style={{ animationDelay: `${idx * 30}ms` }}
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

      {/* Footer shortcut add task button */}
      {count > 0 && (
        <div className="px-3 pb-3 flex-shrink-0">
          <button
            onClick={onCreateTaskClick}
            className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border border-dashed border-[#E8E8E8] dark:border-neutral-800 text-neutral-400 hover:text-black hover:border-black dark:hover:text-white dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all"
          >
            <Plus size={13} strokeWidth={2.5} /> Add Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskColumn;
