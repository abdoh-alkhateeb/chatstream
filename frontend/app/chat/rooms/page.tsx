"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSocket } from "@/app/context/socketContext";

export default function ChatRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [userId, setUserId] = useState("");
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
    } else {
      const fetchUser = async () => {
        try {
          const response = await api.get("/api/v1/auth/me");
          setUserId(response.data.user._id);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      };
      fetchUser();
    }
  }, [router]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/api/v1/rooms");
        setRooms(response.data.data);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        toast.error("Failed to fetch rooms. Please try again.");
      }
    };
    fetchRooms();
  }, [userId]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Room name cannot be empty!");
      return;
    }

    try {
      const response = await api.post("/api/v1/rooms", { name: newRoomName });
      setRooms([...rooms, response.data.data]);
      setNewRoomName("");
      setIsModalOpen(false);
      toast.success("Room created successfully!");
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket) {
      toast.error("WebSocket connection not established.");
      return;
    }

    socket.emit("joinRoom", { roomId });
    setRooms((prevRooms) => prevRooms.map((room) => (room._id === roomId ? { ...room, participants: [...room.participants, userId] } : room)));
    toast.success("You have joined the room!");
  };

  const handleOpenConversation = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Chat Rooms</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create Room
          </button>
        </div>

        {/* Room List */}
        <div className="grid gap-4">
          {rooms.length === 0 ? (
            <p className="text-center text-foreground/80">No Rooms</p>
          ) : (
            rooms.map((room: any) => (
              <div
                key={room._id}
                className="bg-background border border-foreground/10 p-6 rounded-lg hover:shadow-md transition-shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{room.name || "Unnamed Room"}</h2>
                  <p className="text-sm text-foreground/80">Participants: {room.participants?.length || 0}</p>
                </div>

                <div className="flex gap-2">
                  {room.participants.some((user: any) => user._id === userId) ? (
                    <button
                      onClick={() => handleOpenConversation(room._id)}
                      className="bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Open Conversation
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinRoom(room._id)}
                      className="bg-green-600 text-white py-1 px-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      Join Room
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Room Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-background shadow-lg rounded-lg p-8 border border-foreground/10">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Create a New Room</h2>

              {/* Room Name Input */}
              <div className="mb-6">
                <label htmlFor="roomName" className="block text-sm font-medium text-foreground mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  placeholder="Enter room name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-transparent border border-foreground/20 text-foreground py-2 px-4 rounded-lg hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
