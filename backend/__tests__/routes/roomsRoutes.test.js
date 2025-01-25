import app from '../../src/config/server.js';
import Rooms from '../../src/models/room/RoomSchema.js';
import User from '../../src/models/user/UserSchema.js';
import mongoose from 'mongoose';
import request from 'supertest';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

describe('Testing Rooms module', () => {
  beforeAll(() => {
    sinon.stub(mongoose, 'connect').resolves();
    console.log('Mocked database connection');
  });

  afterAll(() => {
    sinon.stub(mongoose, 'disconnect').resolves();
    console.log('Mocked database disconnection');
  });

  afterEach(() => {
    // Restore all stubs after each test
    sinon.restore();
  });
  
  describe('GET /', () => {
    beforeAll(() => {
      findUser = sinon.stub(Rooms, 'find').returns ({
        populate: sinon.stub().returnsThis(),
      });
      verifyToken = sinon.stub(jwt, 'verify');
      findUserById = sinon.stub(Rooms, 'findById').returns ({
        select: sinon.stub().returnsThis(),
      });
    });
    it('should return all rooms', async () => {
      const rooms = [
        {
          _id: '1',
          name: 'Room 1',
          type: 'room',
          participants: [
            { _id: '1', name: 'User 1' },
            { _id: '2', name: 'User 2' },
          ],
          creator: { _id: '1', name: 'User 1' },
        },
        {
          _id: '2',
          name: 'Room 2',
          type: 'room',
          participants: [
            { _id: '1', name: 'User 1' },
            { _id: '3', name: 'User 3' },
          ],
          creator: { _id: '1', name: 'User 1' },
        },
        {
          _id: '3',
          name: 'Room 3',
          type: 'connections',
          participants: [
            { _id: '1', name: 'User 1' },
            { _id: '4', name: 'User 4' },
          ],
          creator: { _id: '1', name: 'User 1' },
        },
      ];

      findUser.returns({
        populate: sinon.stub().returns({
          populate: sinon.stub().returns(rooms),
        })
      });

      const res = await request(app).get('/api/v1/rooms');

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(rooms);
      sinon.assert.calledOnce(findUser);
    });
  });


  // 🏠 Create a Room
  // Still working on this test
  describe('POST /', () => {
    beforeAll(() => {
      createRoom = sinon.stub(Rooms, 'create');
      findOne = sinon.stub(User, 'findOne');
      findUser = sinon.stub(Rooms, 'find').returns ({
        populate: sinon.stub().returnsThis(),
      });
      verifyToken = sinon.stub(jwt, 'verify');
      findUserById = sinon.stub(User, 'findById').returns ({
        select: sinon.stub().returnsThis(),
      });
    });
    it('should create a new room', async () => {
      const user = {
        _id: '1',
        name: 'User 1',
      };

      const newRoom = {
        name: 'Room 4',
        type: 'room',
        creator: user._id,
        participants: [user._id],
      };

      const token = 'valid token'; // Assume token is valid
      verifyToken.returns({ id: user._id });

      createRoom.resolves(newRoom);

      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${token}`)
        .send(newRoom);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toMatchObject(newRoom);
      expect(res.body.data.creator).toEqual(user._id);
      expect(res.body.data.participants).toContain(user._id);
      expect(res.body.data.participants).toHaveLength(1);
      expect(res.body.data.type).toEqual('room');
      sinon.assert.calledOnce(createRoom);
      sinon.assert.calledOnce(findUserById);
    });

    it('should create a new room', async () => {
      const user = {
        _id: '1',
        name: 'User 1',
      };

      const newRoom = {
        name: 'Room 4',
        type: 'room',
        creator: user._id,
        participants: [user._id],
      };

      const token = 'valid token'; // Assume token is valid
      verifyToken.returns({ id: user._id });

      createRoom.resolves(newRoom);

      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${token}`)
        .send(newRoom);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toMatchObject(newRoom);
      expect(res.body.data.creator).toEqual(user._id);
      expect(res.body.data.participants).toContain(user._id);
      expect(res.body.data.participants).toHaveLength(1);
      expect(res.body.data.type).toEqual('room');
      sinon.assert.calledOnce(createRoom);
      sinon.assert.calledOnce(findUserById);
    });
  });
});