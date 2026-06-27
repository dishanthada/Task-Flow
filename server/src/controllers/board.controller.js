const Board = require('../models/Board');
const Task = require('../models/Task');

/**
 * @desc    Get all boards for the logged-in user
 * @route   GET /api/boards
 * @access  Private
 */
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    // Get task counts per board for display
    const boardIds = boards.map((b) => b._id);
    const taskCounts = await Task.aggregate([
      { $match: { board: { $in: boardIds }, owner: req.user._id } },
      { $group: { _id: '$board', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    taskCounts.forEach((tc) => {
      countMap[tc._id.toString()] = tc.count;
    });

    const boardsWithCounts = boards.map((board) => ({
      ...board.toJSON(),
      taskCount: countMap[board._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      data: { boards: boardsWithCounts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new board
 * @route   POST /api/boards
 * @access  Private
 */
const createBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const board = await Board.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: { board },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single board by ID
 * @route   GET /api/boards/:boardId
 * @access  Private
 */
const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      owner: req.user._id, // ownership enforcement
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { board },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update (rename) a board
 * @route   PUT /api/boards/:boardId
 * @access  Private
 */
const updateBoard = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const board = await Board.findOneAndUpdate(
      { _id: req.params.boardId, owner: req.user._id }, // ownership enforcement
      {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      data: { board },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a board and all its tasks (cascade)
 * @route   DELETE /api/boards/:boardId
 * @access  Private
 */
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.boardId,
      owner: req.user._id, // ownership enforcement
    });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Cascade delete all tasks belonging to this board
    await Task.deleteMany({ board: req.params.boardId });

    res.status(200).json({
      success: true,
      message: 'Board and all its tasks deleted successfully',
      data: { boardId: req.params.boardId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
};
