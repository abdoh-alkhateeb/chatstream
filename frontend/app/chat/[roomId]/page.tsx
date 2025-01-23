"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/app/context/socketContext";
import api from "@/app/axios";

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
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
  const router = useRouter();
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
    } else {
      const fetchUser = async () => {
        try {
          const response = await api.get("/api/v1/auth/me");
          setUsername(response.data.user.name);
          setUserId(response.data.user._id);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      };
      fetchUser();
    }
  }, [router]);

  useEffect(() => {
    if (!roomId || !socket) return;

    // Join the room
    socket.emit("joinRoom", { roomId });

    // Listen for messages
    socket.on("receiveMessage", (data: IncomingMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          senderId: data.senderId,
          content: data.message,
          createdAt: data.timestamp,
        },
      ]);
    });

    // Listen for typing events
    socket.on("typing", (data: TypingUser) => {
      setIsTyping(data.username);
    });

    socket.on("stopTyping", () => {
      setIsTyping(null);
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [roomId, socket]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const response = await api.get(`/api/v1/rooms/${roomId}/messages`);
        setMessages(response.data.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };

    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !roomId || !socket) return;

    const newMessage: IncomingMessage = {
      roomId: roomId as string,
      senderId: userId,
      message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", newMessage);

    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        senderId: userId,
        content: message,
        createdAt: new Date().toISOString(),
      },
    ]);
    setMessage("");

    socket.emit("stopTyping", { roomId, username });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!socket) return;

    socket.emit("typing", { roomId, username });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId, username });
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Chat Room</h1>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg._id} className={`mb-4 ${msg.senderId === userId ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.senderId === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        {isTyping && <div className="text-gray-500 italic">{isTyping} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="bg-background p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            className="flex-1 border bg-background text-foreground border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
