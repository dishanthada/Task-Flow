const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title cannot be empty'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      required: [true, 'Priority is required'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedEffort: {
      type: String,
      trim: true,
      maxlength: [100, 'Estimated effort cannot exceed 100 characters'],
      default: '',
    },
    aiSuggestedDueDate: {
      type: Date,
      default: null,
    },
    aiReasoning: {
      type: String,
      trim: true,
      maxlength: [500, 'AI reasoning cannot exceed 500 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
taskSchema.index({ board: 1, status: 1, order: 1 });
taskSchema.index({ board: 1, owner: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
