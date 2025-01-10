import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../config/server.js';
import User from '../../models/user/UserSchema.js';

let mongoServer;

beforeAll(async () => {
  console.log('Setting up in-memory MongoDB...');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log('Connecting to database...');
  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  const user = new User({ name: 'John Doe', email: 'anyone@example.com', password: '123456' });
  await user.save();
});

describe('POST /signup', () => {
  it('should create a new user', async () => {
    const user = { name: 'John Doe', email: 'john@example.com', password: '123456' };
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(user);
  
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.user.email).toBe(user.email);
  });

  it('should return 400 if required fields are missing', async () => {
    const user = { email: 'someone@example.com', password: '123456' };
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('\"name\" is required');
  });

  // it('should return 400 if user already exists', async () => {
  //   const user = { name: 'John Doe', email: 'anyone@example.com', password: '123456' };
  //   const response = await request(app)
  //     .post('/api/v1/auth/signup')
  //     .send(user);

  //   expect(response.status).toBe(400);
  //   expect(response.body.status).toBe('fail');
  // });
});

