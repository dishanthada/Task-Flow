const request = require('supertest');

// Mock protect middleware before requiring app
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: '507f1f77bcf86cd799439011', name: 'Test User', email: 'test@example.com' };
    next();
  },
}));

const app = require('../app');
const Board = require('../models/Board');
const Task = require('../models/Task');

// Mock Mongoose models
jest.mock('../models/Board');
jest.mock('../models/Task');

describe('Board Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/boards', () => {
    it('should get all boards for the logged-in user with task counts', async () => {
      const mockBoards = [
        {
          _id: '507f1f77bcf86cd799439022',
          title: 'Project Alpha',
          description: 'Alpha desc',
          owner: '507f1f77bcf86cd799439011',
          toJSON: function() { return this; }
        },
      ];

      // Mock Board.find chain: find().sort()
      const mockSort = jest.fn().mockResolvedValue(mockBoards);
      Board.find.mockReturnValue({ sort: mockSort });

      // Mock Task.aggregate for task counts
      Task.aggregate.mockResolvedValue([
        { _id: '507f1f77bcf86cd799439022', count: 5 }
      ]);

      const res = await request(app).get('/api/boards');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.boards).toHaveLength(1);
      expect(res.body.data.boards[0].title).toBe('Project Alpha');
      expect(res.body.data.boards[0].taskCount).toBe(5);
    });
  });

  describe('POST /api/boards', () => {
    it('should create a new board and return it', async () => {
      const mockBoard = {
        _id: '507f1f77bcf86cd799439022',
        title: 'New Board',
        description: 'New desc',
        owner: '507f1f77bcf86cd799439011',
      };

      Board.create.mockResolvedValue(mockBoard);

      const res = await request(app)
        .post('/api/boards')
        .send({
          title: 'New Board',
          description: 'New desc',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.board.title).toBe('New Board');
      expect(Board.create).toHaveBeenCalledWith({
        title: 'New Board',
        description: 'New desc',
        owner: '507f1f77bcf86cd799439011',
      });
    });

    it('should return 400 validation error if title is empty', async () => {
      const res = await request(app)
        .post('/api/boards')
        .send({
          title: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });
});
