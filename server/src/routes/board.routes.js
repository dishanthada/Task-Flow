const express = require('express');
const { body } = require('express-validator');
const {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
} = require('../controllers/board.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All board routes require authentication
router.use(protect);

// Validation chains
const createBoardValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Board title is required')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const updateBoardValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Board title cannot be empty')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

// Routes
router.get('/', getBoards);
router.post('/', createBoardValidation, validate, createBoard);
router.get('/:boardId', getBoardById);
router.put('/:boardId', updateBoardValidation, validate, updateBoard);
router.delete('/:boardId', deleteBoard);

module.exports = router;
