
# Chat Application API Design

## **Overview**
**Tech Stack:** JavaScript (React for frontend, Node.js for backend), WebSocket

**Description:**
Develop a real-time chat application where users can join different rooms and exchange messages. The system includes authentication, user profiles, chat history, and room management.

**Core Features:**
- User Authentication
- User Profile Management
- Chat Room Management
- Real-Time Messaging with WebSocket
- Chat History Storage

**Bonus Features:**
- Profile Picture Upload
- User Bio
- View Bios of Other Users in Chatrooms

---

## **1. Authentication API**

### **1.1 Register User**
- **Endpoint:** `POST /api/v1/auth/signup`
- **Description:** Register a new user.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "userId": "string"
  }
  ```

### **1.2 Login User**
- **Endpoint:** `POST /api/v1/auth/login`
- **Description:** Authenticate and login a user.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "string"
  }
  ```

### **1.3 Logout User**
- **Endpoint:** `POST /api/v1/auth/logout`
- **Description:** Logout a user.
- **Response:**
  ```json
  {
    "message": "Logout successful"
  }
  ```

---

## **2. User Management API**

### **2.1 Get User Profile**
- **Endpoint:** `GET /api/v1/users/:id`
- **Description:** Retrieve user profile by ID.
- **Response:**
  ```json
  {
    "userId": "string",
    "username": "string",
    "email": "string",
    "profilePicture": "string",
    "bio": "string"
  }
  ```

### **2.2 Update User Profile**
- **Endpoint:** `PUT /api/v1/users/:id`
- **Description:** Update user profile.
- **Request Body:**
  ```json
  {
    "username": "string",
    "profilePicture": "string",
    "bio": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

---

## **3. Chat Room Management API**

### **3.1 Get Available Chat Rooms**
- **Endpoint:** `GET /api/v1/chat/rooms`
- **Description:** Fetch a list of available chat rooms.
- **Response:**
  ```json
  [
    {
      "roomId": "string",
      "roomName": "string"
    }
  ]
  ```

### **3.2 Create a Chat Room**
- **Endpoint:** `POST /api/v1/chat/rooms`
- **Description:** Create a new chat room.
- **Request Body:**
  ```json
  {
    "roomName": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Room created successfully",
    "roomId": "string"
  }
  ```

### **3.3 Get Chat History**
- **Endpoint:** `GET /api/v1/chat/history/:roomId`
- **Description:** Fetch chat history for a specific room.
- **Response:**
  ```json
  [
    {
      "senderId": "string",
      "message": "string",
      "timestamp": "Date"
    }
  ]
  ```

---

## **4. Real-Time Chat Events (Socket.IO)**

### **4.1 Connection Events**
- **`connect`**: Triggered when a client connects.
- **`disconnect`**: Triggered when a client disconnects.

### **4.2 Room Management Events**
- **`joinRoom`**
  - **Payload:**
    ```json
    {
      "roomId": "string",
      "username": "string"
    }
    ```
- **`leaveRoom`**
  - **Payload:**
    ```json
    {
      "roomId": "string"
    }
    ```

### **4.3 Messaging Events**
- **`sendMessage`**
  - **Payload:**
    ```json
    {
      "roomId": "string",
      "message": "string"
    }
    ```
- **`receiveMessage`**
  - **Broadcast Event:**
    ```json
    {
      "senderId": "string",
      "message": "string",
      "timestamp": "Date"
    }
    ```

### **4.4 Typing Events**
- **`typing`**
  - **Payload:**
    ```json
    {
      "roomId": "string",
      "username": "string"
    }
    ```
- **`stopTyping`**
  - **Payload:**
    ```json
    {
      "roomId": "string",
      "username": "string"
    }
    ```

---

## **5. Error Handling**
- Consistent error response format:
  ```json
  {
    "error": "Error message",
    "code": "Error code"
  }
  ```

---

# Summary:

## **Authentication** (`/auth`)
- **POST /register** → Register a new user  
   - **Body:**  
     ```json
     { "username": "string", "email": "string", "password": "string" }
     ```
- **POST /login** → Login user  
   - **Body:**  
     ```json
     { "email": "string", "password": "string" }
     ```
- **POST /logout** → Logout user  

---

## **Users** (`/users`)
- **GET /:id** → Get a user by ID  
- **PUT /:id** → Update user profile  
   - **Body:**  
     ```json
     { "username": "string", "profilePicture": "string", "bio": "string" }
     ```

---

## **Chat Rooms** (`/chat/rooms`)
- **GET /** → Get all available chat rooms  
- **POST /** → Create a new chat room  
   - **Body:**  
     ```json
     { "roomName": "string" }
     ```

---

## **Chat History** (`/chat/history`)
- **GET /:roomId** → Get chat history for a specific room  

---

## **Socket.IO Events**

### **Connection**
- **connect** → Triggered when a client connects  
- **disconnect** → Triggered when a client disconnects  

### **Room Management**
- **joinRoom**  
   - **Payload:**  
     ```json
     { "roomId": "string", "username": "string" }
     ```
- **leaveRoom**  
   - **Payload:**  
     ```json
     { "roomId": "string" }
     ```

### **Messaging**
- **sendMessage**  
   - **Payload:**  
     ```json
     { "roomId": "string", "message": "string" }
     ```
- **receiveMessage** *(Broadcast Event)*  
   - **Payload:**  
     ```json
     { "senderId": "string", "message": "string", "timestamp": "Date" }
     ```

### **Typing Indicators**
- **typing**  
   - **Payload:**  
     ```json
     { "roomId": "string", "username": "string" }
     ```
- **stopTyping**  
   - **Payload:**  
     ```json
     { "roomId": "string", "username": "string" }
     ```

---

## **Error Handling**
- **Error Response Format:**  
   ```json
   { "error": "Error message", "code": "Error code" }
