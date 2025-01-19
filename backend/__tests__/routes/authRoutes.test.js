import app from '../../src/config/server.js';
import mongoose from 'mongoose';
import User from '../../src/models/user/UserSchema.js';
import request from 'supertest';
import sinon from 'sinon';

describe('Testing auth module', () => {
  let mockUserFind;
  let mockUserCreate;

  beforeAll(() => {
    // Mock Mongoose connect
    sinon.stub(mongoose, 'connect').resolves();
    console.log('Mocked database connection');
  });

  afterAll(() => {
    // Mock Mongoose disconnect
    sinon.stub(mongoose, 'disconnect').resolves();
    console.log('Mocked database disconnection');
  });

  afterEach(() => {
    // Restore all stubs after each test
    sinon.restore();
  });

  describe('POST /signup mocked', () => {
    beforeEach(() => {
      // Mock User model methods before each test
      mockUserFind = sinon.stub(User, 'findOne');
      mockUserCreate = sinon.stub(User, 'create');
    });

    it('should create a new user', async () => {
      const mockUser = {
        _id: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword',
      };

      mockUserCreate.resolves(mockUser);

      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.user.email).toBe(user.email);
      sinon.assert.calledOnce(mockUserCreate);
      sinon.assert.calledWith(mockUserCreate, user);
    });

    it('should return 400 if required fields are missing', async () => {
      const user = { email: 'someone@example.com', password: '123456' };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('"name" is required');
      sinon.assert.notCalled(mockUserCreate);
    });

    it('should return 400 if user already exists', async () => {
      mockUserFind.resolves({
        _id: '123456',
        name: 'John Doe',
        email: 'anyone@example.com',
        password: 'hashedpassword',
      });

      const user = {
        name: 'John Doe',
        email: 'anyone@example.com',
        password: '123456',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('User with this email already exists');
      sinon.assert.calledOnce(mockUserFind);
      sinon.assert.notCalled(mockUserCreate);
    });
  });
});
