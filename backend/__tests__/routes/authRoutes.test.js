import app from '../../src/config/server.js';
import mongoose from 'mongoose';
import User from '../../src/models/user/UserSchema.js';
import request from 'supertest';
import sinon from 'sinon';
import bcrypt from 'bcrypt';

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
        password: '123456',
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

  describe('POST /login mocked', () => {
    beforeEach(() => {
      // Mock User model methods before each test
      mockUserFind = sinon.stub(User, 'findOne').returns({
        select: sinon.stub().returnsThis(),
      });
      sinon.stub(bcrypt, 'compare').resolves(true);
    });
  
    it('should login user', async () => {

      const mockUser = {
        _id: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword', // Assume this is the hashed password
      };

      mockUserFind.returns({
        select: sinon.stub().resolves(mockUser),
      });

      const user = { email: 'john@example.com', password: '123456' };
  
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user);
  
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(user.email);
      sinon.assert.calledOnce(mockUserFind);
    });

    it('should return 400 and password is required if password field is missing', async () => {
      const user = { email: 'john@example.com' };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('"password" is required');
      sinon.assert.notCalled(mockUserFind);
    });

    it('should return 400 and email is required if email field is missing', async () => {
      const user = { password: '123456' };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('"email" is required');
      sinon.assert.notCalled(mockUserFind);
    });

    it('should return 401 if user does not exist', async () => {
      // Ensure the findOne method returns null to simulate a non-existent user
      mockUserFind.returns({
        select: sinon.stub().resolves(null),
      });
    
      const user = { email: 'newperson@example.com', password: '123456' };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid credentials');
      sinon.assert.calledOnce(mockUserFind);
    });

    it('should return 401 if password is incorrect', async () => {

      const mockUser = {
        _id: '123456',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedpassword', // Assume this is the hashed password
      };

      mockUserFind.returns({
        select: sinon.stub().resolves(mockUser),
      });
      
      // Ensure the bcrypt compare method returns false to simulate incorrect password
      bcrypt.compare.resolves(false);
      
      const user = { email: 'john@example.com', password: 'wrongpassword' };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(user);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid credentials');
      sinon.assert.calledOnce(mockUserFind);
    });
  });

  describe('GET /me mocked', () => {
    beforeEach(() => {
      // Mock User model methods before each test
      mockUserFind = sinon.stub(User, 'findOne');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No token provided');
      sinon.assert.notCalled(mockUserFind);
    });

    it('should return 500 and jwt malformed if token is invalid and malformed', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'malformedtoken');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('jwt malformed');
      expect(response.body.stack).toBeDefined();
    });

  });
});
