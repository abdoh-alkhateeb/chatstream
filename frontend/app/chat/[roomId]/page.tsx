"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/components/socketContext";
import api from "@/utils/axios";
import Image from "next/image";

interface Message {
  _id: string;
  senderId: {
    name: string;
    _id: string;
  };
  content: string;
  createdAt: string;
}

interface IncomingMessage {
  roomId: string;
  message: string;
}

interface TypingUser {
  username: string;
}

interface ViewingUser {
  name: string;
  bio: string;
  profile_photo: string;
  interests: string[];
}

export default function ChatRoomPage() {
  const router = useRouter();
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ViewingUser, setViewingUser] = useState<ViewingUser | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
    } else {
      const fetchUser = async () => {
        try {
          const response = await api.get("/api/v1/auth/me");
          setUsername(response.data.user.name);
          setUserPhoto(response.data.user.profile?.profile_picture);
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
    socket.on("receiveMessage", (data: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          senderId: data.senderId,
          content: data.content,
          createdAt: data.createdAt,
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

    socket.on("viewUser", (user) => {
      console.log("🚀 ~ socket.on ~ user:", user);

      setViewingUser({
        ...user,
      });
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("viewUser");
    };
  }, [roomId, socket]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const response = await api.get(`/api/v1/rooms/${roomId}/messages`);
        console.log("🚀 ~ fetchMessages ~ response:", response.data);
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
    console.log("Triggered sendMessage");
    console.log("🚀 ~ sendMessage ~ socket:", socket);

    if (!message.trim() || !roomId || !socket) return;

    const newMessage: IncomingMessage = {
      roomId: roomId as string,
      message,
    };

    socket.emit("sendMessage", newMessage);

    setMessages((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        senderId: {
          _id: userId,
          name: username,
        },
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
    }, 1500);
  };

  const handleViewUser = (id: string) => {
    if (!socket) return;
    console.log("🚀 ~ handleViewUser ~ id:", id, socket);
    socket.emit("getUser", { userId: id, socketId: socket.id });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 relative">
        <h1 className="text-xl font-bold">Chat Room</h1>
        {isTyping && <div className="text-md text-orange-300 italic">{isTyping} is typing...</div>}

        <span
          className="cursor-pointer absolute right-2 top-full -translate-y-[150%] overflow-hidden rounded-md px-3 text-lg font-semibold text-foreground bg-orange-400 hover:text-black transition duration-200 ease-in-out"
          onClick={() => router.push(`/profile/${userId}`)}
        >
          {!userPhoto ? username : <Image src={userPhoto} alt="user pic" width={30} height={30} className="rounded-full" />}
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg._id} className={`mb-4 ${msg.senderId._id === userId ? "text-right" : "text-left"}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.senderId._id === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              <p
                className="text-sm px-1 rounded-sm cursor-pointer hover:font-bold hover:bg-gray-900 hover:text-orange-500"
                onClick={() => handleViewUser(msg.senderId._id)}
              >
                {msg.senderId.name}
              </p>
              <p className="text-md">{msg.content}</p>
              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
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

      {ViewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setViewingUser(null)}>
          <div className="bg-foreground flex flex-col justify-center items-center text-background p-8 rounded-lg" onClick={(e) => e.stopPropagation()}>
            {ViewingUser.profile_photo && <Image src={ViewingUser.profile_photo} alt="user pic" width={128} height={128} className="rounded-full" />}
            <p className="text-lg">
              <span className="italic text-sm text-orange-950">Name:</span> {ViewingUser.name}
            </p>
            {ViewingUser.bio && (
              <p className="text-lg">
                <span className="italic text-sm text-orange-950">bio:</span> {ViewingUser.bio}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
