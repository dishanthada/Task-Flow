const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// mergeParams: true allows access to :boardId from parent router
const router = express.Router({ mergeParams: true });

// All task routes require authentication
router.use(protect);

// Validation chains
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .notEmpty().withMessage('Priority is required')
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedEffort')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Estimated effort cannot exceed 100 characters'),
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty')
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done'),
  body('dueDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      return !isNaN(Date.parse(value));
    }).withMessage('Due date must be a valid date or null'),
  body('estimatedEffort')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Estimated effort cannot exceed 100 characters'),
];

// Routes
router.get('/', getTasks);
router.post('/', createTaskValidation, validate, createTask);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTaskValidation, validate, updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router;
