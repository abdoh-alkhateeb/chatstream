# ChatStream Backend

## Overview

ChatStream is a real-time chat application backend built with Node.js, Express, and Socket.IO. It supports user authentication, profile management, chat room management, and real-time messaging.

## Features

- User Authentication (Signup, Login, Logout)
- User Profile Management
- Chat Room Management
- Real-Time Messaging with WebSocket (Socket.IO)
- Chat History Storage
- Profile Picture Upload
- User Bio Management

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-Time Communication:** Socket.IO
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **Testing:** Jest, Supertest

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ````sh
   git clone https://github.com/your-username/chatstream-backend.git
   cd chatstream-backend```
   ````
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a .env file in the root directory and add the following environment variables:

```
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Start the server:
   `npm run dev`

## Running Tests

# To run the tests, use the following command:

```npm run test

```
