import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { suggestEstimate } from '../../api/aiApi';
import { toInputDate } from '../../utils/dateUtils';

const TaskForm = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete = null,
  initialData = null,
  title = 'Create Task',
  defaultStatus = 'todo',
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    dueDate: '',
    estimatedEffort: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // AI Suggestion State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        dueDate: toInputDate(initialData.dueDate),
        estimatedEffort: initialData.estimatedEffort || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        dueDate: '',
        estimatedEffort: '',
      });
    }
    setErrors({});
    setAiSuggestion(null);
  }, [initialData, isOpen, defaultStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleAISuggest = async () => {
    if (!form.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Task title is required for AI estimate' }));
      toast.error('Please enter a task title first!');
      return;
    }

    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await suggestEstimate({
        title: form.title.trim(),
        description: form.description.trim(),
      });

      if (res.success && res.aiAvailable && res.data) {
        setAiSuggestion(res.data);
        toast.success('AI suggestions generated! ✨');
      } else {
        toast.error(res.message || 'AI assistant is not configured.');
      }
    } catch {
      toast.error('AI request failed. Please fill estimates manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    setForm((p) => ({
      ...p,
      estimatedEffort: `${aiSuggestion.effortEstimate} (${aiSuggestion.effortHours || ''})`.trim(),
      dueDate: toInputDate(aiSuggestion.suggestedDueDate),
    }));
    setAiSuggestion(null);
    toast.success('AI suggestion applied!');
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = 'Task title is required';
    } else if (form.title.trim().length > 200) {
      errs.title = 'Title cannot exceed 200 characters';
    }
    if (form.description.trim().length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }
    if (form.estimatedEffort.trim().length > 100) {
      errs.estimatedEffort = 'Estimated effort cannot exceed 100 characters';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      estimatedEffort: form.estimatedEffort.trim(),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    };
    await onSubmit(payload);
    setSubmitting(false);
  };

  const footer = (
    <div className="flex justify-between items-center w-full">
      {initialData && onDelete ? (
        <Button variant="danger" onClick={onDelete} disabled={submitting}>
          Delete Task
        </Button>
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting}>
          {initialData ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="lg">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Title */}
        <Input
          id="task-title"
          name="title"
          label="Task Title"
          placeholder="e.g. Design Dashboard Prototypes"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          required
          autoFocus
        />

        {/* Description */}
        <Input
          id="task-desc"
          name="description"
          label="Description"
          as="textarea"
          placeholder="Write task details or implementation notes..."
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          rows={3}
        />

        {/* AI Helper Trigger Banner */}
        <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Smart Estimate Assist</h5>
              <p className="text-3xs text-indigo-700 dark:text-indigo-400">Suggests optimal due dates & effort estimates based on task metadata.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAISuggest}
            disabled={aiLoading}
            className="border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-semibold shadow-sm"
          >
            {aiLoading ? <Spinner size="sm" className="mr-1" /> : 'Suggest Estimate'}
          </Button>
        </div>

        {/* AI Suggestion Display */}
        {aiSuggestion && (
          <div className="p-4 rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-950/10 animate-fade-in flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-xs font-semibold text-green-950 dark:text-green-300 flex items-center gap-1.5">
                  🤖 Suggested Recommendation
                </h5>
                <p className="text-3xs text-green-700 dark:text-green-400 mt-0.5">Recommended parameters for this task.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiSuggestion(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Ignore
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptSuggestion}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-2.5 py-1 rounded"
                >
                  Apply Suggestion
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-green-100 dark:border-green-950/20">
              <div>
                <span className="text-3xs text-gray-400 uppercase tracking-wider font-semibold block">Effort Estimate</span>
                <span className="text-xs font-semibold text-green-800 dark:text-green-400 flex items-center gap-1.5 mt-0.5">
                  ⏱️ {aiSuggestion.effortEstimate} ({aiSuggestion.effortHours || ''})
                </span>
              </div>
              <div>
                <span className="text-3xs text-gray-400 uppercase tracking-wider font-semibold block">Suggested Due Date</span>
                <span className="text-xs font-semibold text-green-800 dark:text-green-400 flex items-center gap-1.5 mt-0.5">
                  📅 {new Date(aiSuggestion.suggestedDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="text-xs text-green-900/80 dark:text-green-300/80 bg-green-50/10 dark:bg-green-900/5 p-2.5 rounded border border-green-50/50 dark:border-green-950/10 italic leading-relaxed">
              &ldquo;{aiSuggestion.reasoning}&rdquo;
            </div>
          </div>
        )}

        {/* Row details: Priority, Due Date, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-status" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Status
            </label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-priority" className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Priority
            </label>
            <select
              id="task-priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="form-input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <Input
            id="task-duedate"
            name="dueDate"
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
          />
        </div>

        {/* Estimated Effort manual input */}
        <Input
          id="task-effort"
          name="estimatedEffort"
          label="Estimated Effort (Manual)"
          placeholder="e.g. M, 3 hours, 2 days"
          value={form.estimatedEffort}
          onChange={handleChange}
          error={errors.estimatedEffort}
        />
      </form>
    </Modal>
  );
};

export default TaskForm;
