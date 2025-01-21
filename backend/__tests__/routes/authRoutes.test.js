import app from '../../src/config/server.js';
import mongoose from 'mongoose';
import User from '../../src/models/user/UserSchema.js';
import request from 'supertest';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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

    it('should return 400 if email is invalid', async () => {
      const user = { name: 'John Doe', email: 'invalidemail', password: '123456' };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(user);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('"email" must be a valid email');
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
      varifyToken = sinon.stub(jwt, 'verify');
      // Mock User model methods before each test
      mockUserFindById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });
    });

    // it('should return 401 if no token is provided', async () => {
    //   const response = await request(app).get('/api/v1/auth/me');
    it('should return 200 and user data if valid token is provided', async () => {
      const mockUser = {
        _id: '123456',
        name: 'John Doe',
        email: 'john@example.com',
      };

      mockUserFindById.returns({
        select: sinon.stub().resolves(mockUser),
      });

      varifyToken.resolves({ id: mockUser._id });
      const token = 'validtoken'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.user.email).toBe(mockUser.email);
      sinon.assert.calledOnce(mockUserFindById);
    });

    // Check this test
    it('should return 401 if token is expired', async () => {
      varifyToken.throws(new jwt.TokenExpiredError('jwt expired', new Date()));
      const token = 'expiredtoken'; // Assume this is an expired token

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      console.log(response.body);
      
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('jwt expired');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should returnn 500 if token is invalid', async () => {
      varifyToken.throws(new jwt.JsonWebTokenError('invalid token'));
      const token = 'invalid token'; // Assume this is an invalid token

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('invalid token');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 500 and jwt malformed if token is malformed', async () => {
      varifyToken.throws(new jwt.JsonWebTokenError('jwt malformed'));
      const token = 'malformedtoken'; // Assume this is a malformed token

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('jwt malformed');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 401 if token is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No token provided');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 404 if user is not found', async () => {
      mockUserFindById.returns({
        select: sinon.stub().resolves(null),
      });
      varifyToken.resolves({ id: null });
      const token = 'faketoken'; // Assume this is a fake token

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      console.log(response.body);
      
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('User not found');
      sinon.assert.calledOnce(mockUserFindById);
    });
  });

  describe('POST /logout mocked', () => {
    beforeEach(() => {

      varifyToken = sinon.stub(jwt, 'verify');
      // Mock User model methods before each test
      mockUserFindById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });
    });

    it('should logout successfully', async() => {
      const mockUser = {
        _id: '123456',
        name: 'John Doe',
        email: 'john@example.com',
      };
      mockUserFindById.returns({
        select: sinon.stub().resolves(mockUser)
      });
      varifyToken.resolves({ id: mockUser._id });

      const token = 'Bearer valid token'; //consider this is valid taken

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logged out successfully');
      sinon.assert.calledOnce(mockUserFindById);
    });

    it('should return 401 if token is expired', async () => {
      varifyToken.throws(new jwt.TokenExpiredError('jwt expired', new Date()));
      const token = 'expired token'; // Assume this is an expired token

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('jwt expired');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 500 if token is invalid', async () => {
      varifyToken.throws(new jwt.JsonWebTokenError('invalid token'));
      const token = 'invalid token'; // Assume this is an invalid token

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('invalid token');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 500 and jwt malformed if token is malformed', async () => {
      varifyToken.throws(new jwt.JsonWebTokenError('jwt malformed'));
      const token = 'malformed token'; // Assume this is a malformed token

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('jwt malformed');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 401 if token is not provided', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Not authorized, no token');
      sinon.assert.notCalled(mockUserFindById);
    });

    it('should return 401 if user is not found', async () => {
      mockUserFindById.returns({
        select: sinon.stub().resolves(null)
      });
      varifyToken.resolves({ id: null });
      const token = 'fake token'; // Assume this is a fake token

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('User no longer exists');
      sinon.assert.calledOnce(mockUserFindById);
    });
  });
});
