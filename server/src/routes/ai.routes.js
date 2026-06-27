const express = require('express');
const { body } = require('express-validator');
const { suggestEstimate } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All AI routes require authentication
router.use(protect);

const suggestValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required for AI estimate'),
  body('description')
    .optional()
    .trim(),
];

router.post('/suggest', suggestValidation, validate, suggestEstimate);

module.exports = router;
