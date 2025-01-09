"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface Message {
  senderId: string;
  message: string;
  timestamp: string;
}

interface IncomingMessage {
  roomId: string;
  senderId: string;
  message: string;
  timestamp: string;
}

interface TypingUser {
  username: string;
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  let socket: Socket;

  useEffect(() => {
    if (!roomId) return;

    socket = io("http://localhost:3000");

    socket.emit("joinRoom", { roomId });

    socket.on("receiveMessage", (data: IncomingMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (data: TypingUser) => {
      setIsTyping(data.username);
    });

    socket.on("stopTyping", () => {
      setIsTyping(null);
    });

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const response = await axios.get<Message[]>(`/api/v1/chat/history/${roomId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim() || !roomId) return;

    const newMessage: IncomingMessage = {
      roomId: roomId as string,
      senderId: "currentUserId", // TODO
      message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", newMessage);

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    socket.emit("stopTyping", { roomId, username: "currentUsername" }); // TODO
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    socket.emit("typing", { roomId, username: "currentUsername" }); // TODO

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId, username: "currentUsername" }); // TODO
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-bold">{msg.senderId}</span>: {msg.message}
            <span className="text-sm text-gray-500 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
        {isTyping && <div className="text-gray-500 italic">{isTyping} is typing...</div>}
      </div>

      <div className="flex">
        <input type="text" placeholder="Type a message..." value={message} onChange={handleTyping} className="flex-1 border p-2 rounded" />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
          Send
        </button>
      </div>
    </div>
  );
}
