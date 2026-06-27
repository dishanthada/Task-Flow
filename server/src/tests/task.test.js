const request = require('supertest');

// Mock protect middleware before requiring app
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', name: 'Test User', email: 'test@example.com' };
    next();
  },
}));

const app = require('../app');
const Task = require('../models/Task');
const Board = require('../models/Board');

// Mock Mongoose models
jest.mock('../models/Task');
jest.mock('../models/Board');

describe('Task Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/boards/:boardId/tasks', () => {
    it('should fetch all tasks for a board if owned by the user', async () => {
      // Mock board ownership check
      Board.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439022', owner: '507f1f77bcf86cd799439011' });

      const mockTasks = [
        { _id: '507f1f77bcf86cd799439033', title: 'Task 1', status: 'todo', priority: 'medium' },
        { _id: '507f1f77bcf86cd799439034', title: 'Task 2', status: 'in-progress', priority: 'high' }
      ];

      // Mock Task.find query chain: find().sort()
      const mockSort = jest.fn().mockResolvedValue(mockTasks);
      Task.find.mockReturnValue({ sort: mockSort });

      const res = await request(app).get('/api/boards/507f1f77bcf86cd799439022/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks).toHaveLength(2);
      expect(res.body.data.tasks[0].title).toBe('Task 1');
    });

    it('should return 404 if board does not exist or is not owned by the user', async () => {
      Board.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/boards/507f1f77bcf86cd799439022/tasks');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('POST /api/boards/:boardId/tasks', () => {
    it('should create a task in the specified board and auto-order it', async () => {
      Board.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439022', owner: '507f1f77bcf86cd799439011' });

      // Mock finding last task for order: findOne().sort()
      const mockSort = jest.fn().mockResolvedValue({ order: 2 });
      Task.findOne.mockReturnValue({ sort: mockSort });

      const mockCreatedTask = {
        _id: '507f1f77bcf86cd799439033',
        title: 'New Task',
        status: 'todo',
        priority: 'high',
        order: 3,
        board: '507f1f77bcf86cd799439022',
        owner: '507f1f77bcf86cd799439011',
      };
      Task.create.mockResolvedValue(mockCreatedTask);

      const res = await request(app)
        .post('/api/boards/507f1f77bcf86cd799439022/tasks')
        .send({
          title: 'New Task',
          priority: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task.order).toBe(3);
      expect(Task.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
        priority: 'high',
        order: 3,
        board: '507f1f77bcf86cd799439022',
        owner: '507f1f77bcf86cd799439011',
      }));
    });
  });
});
