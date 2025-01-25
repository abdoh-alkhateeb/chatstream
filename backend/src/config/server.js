import express from 'express';
import connectDB from './database.js';
import dotenv from 'dotenv';
import errorMiddleware from '../middlewares/errorHandler.js';
import appRoutes from '../routes/index.js';
import morgan from 'morgan';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import socketHandler from '../services/socket/socketHandler.js';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
dotenv.config();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Socket Handlers
socketHandler(io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: '*', // Specify allowed origins
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true, // Enable credentials if needed
  })
);
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow frontend origin
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  },
  express.static('uploads')
);

// Database Connection
process.env.NODE_ENV !== 'test' && (await connectDB());
// await connectDB();

// Global error middleware
app.use('/api', appRoutes);
app.use(errorMiddleware);

app.get('/', (_, res) => {
  res.send('Welcome to our Chat API');
});

// Not found request
app.all('*', (req, res, _) => {
  res.status(404).send(`Can't find ${req.originalUrl} on this server!`);
});

export default server;
