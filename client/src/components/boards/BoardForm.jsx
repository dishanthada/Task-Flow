import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const BoardForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Create Board',
}) => {
  const [form, setForm] = useState({ title: '', description: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
      });
    } else {
      setForm({ title: '', description: '' });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = 'Board title is required';
    } else if (form.title.trim().length > 100) {
      errs.title = 'Title cannot exceed 100 characters';
    }
    if (form.description.trim().length > 500) {
      errs.description = 'Description cannot exceed 500 characters';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
    });
    setSubmitting(false);
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} loading={submitting}>
        {initialData ? 'Save Changes' : 'Create Board'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          id="board-title"
          name="title"
          label="Board Title"
          placeholder="e.g. Website Redesign"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          required
          autoFocus
        />
        <Input
          id="board-desc"
          name="description"
          label="Description"
          as="textarea"
          placeholder="Brief description of the board projects..."
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          rows={3}
        />
      </form>
    </Modal>
  );
};

export default BoardForm;
