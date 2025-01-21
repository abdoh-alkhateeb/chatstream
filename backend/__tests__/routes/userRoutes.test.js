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
    // Restore all stubs after each test
    sinon.restore();
  });

  describe('GET /search', () => {
    beforeEach(() => {
      varifyToken = sinon.stub(jwt, 'verify');
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

      findUserById.returns({
        select: sinon.stub().resolves(mockedUser),
      });

      findUser.resolves(mockedUser);

      varifyToken.resolves({ id: mockedUser._id });

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

      varifyToken.resolves({ id: mockedUser._id });

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
      
      varifyToken.resolves({ id: '1' });

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

  describe('GET /:id', () => {
    beforeEach(() => {
      varifyToken = sinon.stub(jwt, 'verify');
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

      // findUserById.returns({
      //   select: sinon.stub().resolves(mockedUsers[0]),
      // });

      // Testing the findById method
      findUserById.callsFake((id) => {
        console.log('findById called with:', id); // Debug argument
        return {
          select: sinon.stub().resolves(mockedUsers[0]),
        };
      });

      varifyToken.resolves({ id: mockedUsers[0]._id});

      const token = 'valid token'; // Assume this is a valid token

      const response = await request(app)
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${token}`);

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data).toEqual(mockedUsers[0]);
      expect(response.body.data.name).toEqual('John Doe');
      sinon.assert.calledOnce(findUserById);
    });

  });
});
