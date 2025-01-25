import app from '../../src/config/server.js';
import mongoose from 'mongoose';
import User from '../../src/models/user/UserSchema.js';
import request from 'supertest';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

describe('Testing users module', () => {
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
    sinon.restore();
  });

  describe('GET /search', () => {
    beforeEach(() => {
      verifyToken = sinon.stub(jwt, 'verify');
      // Mock User model methods before each test
      findUserById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });
      findUser = sinon.stub(User, 'find');
      
    });

    it('should return user by name', async () => {
      const mockedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'johny@gmail.com',
        password: 'password',
      };

      findUserById.returns ({
        select: sinon.stub().resolves(mockedUser),
      });

      findUser.resolves(mockedUser);

      verifyToken.resolves({ id: mockedUser._id });

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/users/search?query=john')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data).toEqual(mockedUser);
      expect(response.body.data.name).toEqual('John Doe');
      sinon.assert.calledOnce(findUserById);
      sinon.assert.calledOnce(findUser);
    });

    it('should return user by email', async () => {
      const mockedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'johny@gmail.com',
        password: 'password',
      };

      findUserById.returns({
        select: sinon.stub().resolves(mockedUser),
      });

      findUser.resolves(mockedUser);

      verifyToken.resolves({ id: mockedUser._id });

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/users/search?query=johny@gmail.com')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockedUser);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.email).toEqual('johny@gmail.com');
      sinon.assert.calledOnce(findUserById);
      sinon.assert.calledOnce(findUser);
    });

    it('should return null array if user not found', async () => {
      findUser.resolves(null);
      
      verifyToken.resolves({ id: '1' });

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/users/search?query=john')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data).toEqual(null);
      sinon.assert.calledOnce(findUser);
      sinon.assert.calledOnce(findUserById);
    });
  });


  // still working on this test
  describe('GET /:id, getting user by ID', () => {
    beforeEach(() => {
      verifyToken = sinon.stub(jwt, 'verify');
      findUserById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });
      findUser = sinon.stub(User, 'find');
    });

    it('should return user by id', async () => {
      const mockedUsers = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'johny@gmail.com',
          password: 'password'
        },
        {
          _id: '2',
          name: 'Alex Tom',
          email: 'alextom@gmail.com',
          password: 'password'
        },
        {
          _id: '3',
          name: 'Youssef',
          email: 'youssef@gmail.com',
          password: 'password'
        }
      ];

      verifyToken.returns({ id: mockedUsers[0]._id});

      findUserById
        .withArgs('1')
        .onFirstCall()
        .returns({
          select: sinon.stub().resolves(mockedUsers[0]),
        })
        .onSecondCall()
        .resolves(mockedUsers[0]);

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data).toEqual(mockedUsers[0]);
      expect(response.body.data.name).toEqual('John Doe');
      sinon.assert.calledTwice(findUserById);
    });

    it('should return User no longer exists ', async () => {

      findUserById
        .withArgs('1')
        .onFirstCall()
        .returns({
          select: sinon.stub().resolves(null),
        })
        .onSecondCall()
        .resolves(null);

      verifyToken.returns({ id: '1' });

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${token}`);

      console.log(response.body);
      expect(response.status).toBe(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('User no longer exists');
      sinon.assert.calledOnce(findUserById);
    });
  });

  describe('PATCH /:id, updating user', () => {
    beforeEach(() => {
      verifyToken = sinon.stub(jwt, 'verify');
      findUserById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });
      findUserByIdAndUpdate = sinon.stub(User, 'findByIdAndUpdate');
    });

    // still working on this test
    // it returns initial user name instead of updated name
    it('should update user', async () => {
      const mockedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'johny@gmail.com',
        password: 'password',
      };

      findUserById.returns({
        select: sinon.stub().resolves(mockedUser),
      });
      findUserByIdAndUpdate.resolves(mockedUser);


      verifyToken.returns({ id: mockedUser._id });

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .patch('/api/v1/users/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Youssef' });

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data).toEqual(mockedUser);
      expect(response.body.data.name).toEqual('Youssef');
      sinon.assert.calledOnce(findUserById);
    });
  });

  // still working on this test
  describe('PATCH /:id/profile, updating user profile', () => {
    beforeEach(() => {
      verifyToken = sinon.stub(jwt, 'verify');
      findUserById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });

      findUserByIdAndUpdate = sinon.stub(User, 'findByIdAndUpdate');
    });

    it('should update user profile', async () => {
      const mockedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'johny@gmail.com',
        password: 'password',
      };

      findUserById.returns({
        select: sinon.stub().resolves(mockedUser),
      });

      findUserByIdAndUpdate.resolves(mockedUser);

      verifyToken.returns({ id: mockedUser._id });

      const JWT_SECRET = 'jwtsecret'; // Mock JWT_SECRET

      const token = jwt.sign({ id: mockedUser._id }, JWT_SECRET);
      console.log(token);
      const response = await request(app)
        .patch('/api/v1/users/1/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ bio: 'I am a software engineer' });

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.bio).toEqual('I am a software engineer');
      sinon.assert.calledOnce(findUserById);
    });
  });


  // still working on this test
  describe('PATCH /:id/password, updating user password', () => {
    beforeEach(() => {
      verifyToken = sinon.stub(jwt, 'verify');
      findUserById = sinon.stub(User, 'findById').returns({
        select: sinon.stub().returnsThis(),
      });
      findUserByIdAndUpdate = sinon.stub(User, 'findByIdAndUpdate');

      isMatch = sinon.stub(User, 'isValidPassword');
    });

    it('should update user password', async () => {
      const mockedUser = {
        _id: '1',
        name: 'John Doe',
        email: 'johny@gmail.com',
        password: 'password',
      };

      findUserById.returns({
        select: sinon.stub().resolves(mockedUser),
      });

      findUserByIdAndUpdate.resolves(mockedUser);

      isMatch.resolves(mockedUser.password);

      verifyToken.returns({ id: mockedUser._id });

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .patch('/api/v1/users/1/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ oldPassword: 'password', newPassword: 'newpassword' });

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.message).toEqual('Password updated successfully');
      sinon.assert.calledOnce(findUserById);
    });
  });
});
