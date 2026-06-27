import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { suggestEstimate } from '../../api/aiApi';
import { toInputDate } from '../../utils/dateUtils';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

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
    isAiEstimated: false,
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
        isAiEstimated: initialData.isAiEstimated || false,
      });
    } else {
      setForm({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        dueDate: '',
        estimatedEffort: '',
        isAiEstimated: false,
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
      isAiEstimated: true,
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
        <Button variant="secondary" onClick={onClose} disabled={submitting} className="rounded-lg text-xs font-semibold py-2">
          Cancel
        </Button>
        <Button onClick={handleSubmit} loading={submitting} className="btn-primary rounded-lg text-xs font-semibold py-2">
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
          className="rounded-lg text-xs"
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
          className="rounded-lg text-xs"
        />

        {/* AI Helper Trigger Banner */}
        <div className="p-4 rounded-xl border border-[#E8E8E8] dark:border-neutral-800 bg-[#F5F5F5] dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div className="flex-1">
              <h5 className="text-xs font-semibold text-black dark:text-white">AI Estimate Assistant</h5>
              <p className="text-[10px] text-neutral-500 mt-0.5">Get AI-powered suggestions for due dates & effort estimates based on task metadata.</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAISuggest}
            disabled={aiLoading}
            className="btn-primary text-[11px] font-semibold py-2 px-4 rounded-lg self-start sm:self-auto flex items-center gap-1.5"
          >
            {aiLoading ? <Spinner size="sm" /> : <Sparkles size={12} />}
            <span>Suggest Estimate</span>
          </Button>
        </div>

        {/* AI Suggestion Display */}
        {aiSuggestion && (
          <div className="p-4 rounded-xl border border-black dark:border-white bg-[#FFFFFF] dark:bg-[#121212] animate-fade-in flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-xs font-semibold text-black dark:text-white flex items-center gap-1.5">
                  <Bot size={14} /> AI Recommendation
                </h5>
                <p className="text-[10px] text-neutral-500 mt-0.5">Accept or ignore recommended due date and effort estimate.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiSuggestion(null)}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white"
                >
                  Ignore
                </Button>
                <Button
                  type="button"
                  onClick={handleAcceptSuggestion}
                  className="btn-primary text-xs px-3 py-1.5 rounded-lg"
                >
                  Apply Recommendation
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-[#E8E8E8] dark:border-neutral-800 bg-[#FAFAFA] dark:bg-neutral-900/40">
              <div>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold block">Effort Estimate</span>
                <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1 mt-0.5">
                  ⏱️ {aiSuggestion.effortEstimate} ({aiSuggestion.effortHours || ''})
                </span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold block">Suggested Due Date</span>
                <span className="text-xs font-bold text-black dark:text-white flex items-center gap-1 mt-0.5">
                  📅 {new Date(aiSuggestion.suggestedDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="text-xs text-neutral-600 dark:text-neutral-350 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-[#E8E8E8] dark:border-neutral-800 italic leading-relaxed">
              &ldquo;{aiSuggestion.reasoning}&rdquo;
            </div>
          </div>
        )}

        {/* Row details: Priority, Due Date, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-status" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Status
            </label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-input text-xs rounded-lg py-2.5"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-priority" className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Priority
            </label>
            <select
              id="task-priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="form-input text-xs rounded-lg py-2.5"
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
            className="rounded-lg text-xs"
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
          className="rounded-lg text-xs"
        />
      </form>
    </Modal>
  );
};

export default TaskForm;
