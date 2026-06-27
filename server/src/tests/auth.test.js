const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

// Mock User model methods
jest.mock('../models/User');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return user data with a token', async () => {
      // Setup mock findOne to return null (no duplicate user)
      User.findOne.mockResolvedValue(null);

      // Setup mock create to return the created user
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        theme: 'light',
        createdAt: new Date().toISOString(),
        toJSON: function () {
          return {
            _id: this._id,
            name: this.name,
            email: this.email,
            theme: this.theme,
            createdAt: this.createdAt,
          };
        },
      };
      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.name).toBe('Jane Doe');
      expect(res.body.data.user.email).toBe('jane@example.com');
    });

    it('should return 400 if validation fails (e.g. missing fields)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123', // less than 6 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 if user email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return a token', async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        theme: 'light',
        comparePassword: mockComparePassword,
        createdAt: new Date().toISOString(),
      };

      // Mock chainable findOne and select
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(mockComparePassword).toHaveBeenCalledWith('password123');
    });

    it('should return 401 for incorrect credentials', async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(false);
      const mockUser = {
        comparePassword: mockComparePassword,
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid');
    });
  });
});
