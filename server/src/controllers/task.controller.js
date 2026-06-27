const Task = require('../models/Task');
const Board = require('../models/Board');

/**
 * Helper: verify the board belongs to the current user
 */
const verifyBoardOwnership = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  return board;
};

/**
 * @desc    Get all tasks for a board
 * @route   GET /api/boards/:boardId/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const board = await verifyBoardOwnership(req.params.boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    // Filtering
    const filter = { board: req.params.boardId, owner: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    // Sorting
    const sortField = req.query.sortBy || 'order';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortField]: sortOrder };

    const tasks = await Task.find(filter).sort(sortObj);

    res.status(200).json({
      success: true,
      data: { tasks, count: tasks.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a task in a board
 * @route   POST /api/boards/:boardId/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const board = await verifyBoardOwnership(req.params.boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedEffort,
    } = req.body;

    // Get the highest order in the column to append at end
    const lastTask = await Task.findOne({
      board: req.params.boardId,
      status: status || 'todo',
    }).sort({ order: -1 });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'todo',
      priority,
      dueDate: dueDate || null,
      estimatedEffort: estimatedEffort || '',
      order,
      board: req.params.boardId,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task
 * @route   GET /api/boards/:boardId/tasks/:taskId
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      board: req.params.boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task (edit fields, move column, reorder)
 * @route   PUT /api/boards/:boardId/tasks/:taskId
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedEffort,
      order,
      aiSuggestedDueDate,
      aiReasoning,
    } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.taskId,
        board: req.params.boardId,
        owner: req.user._id,
      },
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate || null }),
        ...(estimatedEffort !== undefined && { estimatedEffort }),
        ...(order !== undefined && { order }),
        ...(aiSuggestedDueDate !== undefined && { aiSuggestedDueDate }),
        ...(aiReasoning !== undefined && { aiReasoning }),
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/boards/:boardId/tasks/:taskId
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      board: req.params.boardId,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { taskId: req.params.taskId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
