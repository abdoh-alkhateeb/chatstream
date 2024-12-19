# Chat Application Data Model

## **1. User Model**
Stores user information, including authentication details, profile data, and additional bonus fields.

```json
User = {
  userId: "string",
  username: "string",
  password: "string",
  email: "string",
  profilePicture: "string",
  bio: "string",
  createdAt: "Date",
  updatedAt: "Date"
}
```

---

## **2. ChatRoom Model**
Stores information about individual chat rooms.

```json
ChatRoom = {
  roomId: "string",
  name: "string",
  description: "string",
  createdAt: "Date",
  members: ["string"],
  messages: ["string"]
}
```

---

## **3. Message Model**
Stores chat messages exchanged between users.

```json
Message = {
  messageId: "string",
  roomId: "string",
  senderId: "string",
  content: "string",
  createdAt: "Date",
  attachments: ["string"]
}
```

---

## **4. ChatHistory Model**
Tracks the chat history for users in specific rooms.

```json
ChatHistory = {
  historyId: "string",
  userId: "string",
  roomId: "string",
  messages: ["string"],
  lastAccessedAt: "Date"
}
```

---

## **Relationships Between Models**
1. **User ↔ ChatRoom:** Users are members of multiple chat rooms (many-to-many relationship).
   - `ChatRoom.members` references `User.userId`.
2. **User ↔ Message:** Messages are sent by users.
   - `Message.senderId` references `User.userId`.
3. **ChatRoom ↔ Message:** Messages belong to a specific chat room.
   - `Message.roomId` references `ChatRoom.roomId`.
4. **User ↔ ChatHistory ↔ ChatRoom:** Tracks each user's chat history in a room.
   - `ChatHistory.userId` links to `User.userId` and `ChatRoom.roomId`.

---

## **Database Structure**
- **NoSQL (e.g., MongoDB):** Collections for `users`, `chatRooms`, `messages`, and `chatHistories`.
---

## **Sample JSON Representation**

### **User Example**
```json
{
  "userId": "u123",
  "username": "john_doe",
  "email": "john@example.com",
  "profilePicture": "https://example.com/john.jpg",
  "bio": "I love chatting about tech!",
  "createdAt": "2024-06-10T08:30:00Z"
}
```

### **ChatRoom Example**
```json
{
  "roomId": "r001",
  "name": "Tech Talk",
  "description": "Discuss the latest tech trends",
  "members": ["u123", "u456"],
  "createdAt": "2024-06-09T12:00:00Z"
}
```

### **Message Example**
```json
{
  "messageId": "m789",
  "roomId": "r001",
  "senderId": "u123",
  "content": "Hey everyone, what's the latest in AI?",
  "attachments": [],
  "createdAt": "2024-06-10T09:15:00Z"
}
```

### **ChatHistory Example**
```json
{
  "historyId": "h001",
  "userId": "u123",
  "roomId": "r001",
  "messages": ["m789", "m790"],
  "lastAccessedAt": "2024-06-10T09:20:00Z"
}
```

---