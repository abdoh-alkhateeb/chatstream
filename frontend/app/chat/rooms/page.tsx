"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [userName, setUserName] = useState("");
  const [creatorProfile, setCreatorProfile] = useState<any | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
    } else {
      const fetchUser = async () => {
        try {
          const response = await api.get("/api/v1/auth/me");
          setUserId(response.data.user._id);
          setUserName(response.data.user.name);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      };
      fetchUser();
    }
  }, []);

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

  const handleJoinRoom = useCallback(
    (roomId: string) => {
      if (!socket) {
        toast.error("WebSocket connection not established.");
        return;
      }

      socket.emit("joinRoom", { roomId });
      setRooms((prevRooms) => prevRooms.map((room) => (room._id === roomId ? { ...room, participants: [...room.participants, userId] } : room)));
      toast.success("You have joined the room!");
    },
    [socket, userId]
  );

  const handleOpenConversation = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  const handleViewCreatorProfile = async (creatorId: string) => {
    try {
      const response = await api.get(`/api/v1/users/${creatorId}`);
      setCreatorProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch creator profile:", error);
      toast.error("Failed to fetch creator profile.");
    }
  };

  const handleCloseCreatorProfile = () => {
    setCreatorProfile(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Chat Rooms</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              Create Room
            </button>
            <span className="cursor-pointer text-lg font-medium text-foreground hover:text-blue-600" onClick={() => router.push(`/profile/${userId}`)}>
              {userName}
            </span>
          </div>
        </div>

        <div className="grid gap-4">
          {rooms.length === 0 ? (
            <p className="text-center text-foreground/80">No Rooms</p>
          ) : (
            rooms.map((room: any) => (
              <div key={room._id} className="bg-background border p-6 rounded-lg flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{room.name || "Unnamed Room"}</h2>
                  <p className="text-sm text-foreground/80">Participants: {room.participants?.length || 1}</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleViewCreatorProfile(room.creator._id)} className="bg-gray-600 text-white py-1 px-3 rounded-lg hover:bg-gray-700">
                    View Creator Profile
                  </button>

                  <button
                    onClick={() => (room.participants.some((user: any) => user._id === userId) ? handleOpenConversation(room._id) : handleJoinRoom(room._id))}
                    className={`py-1 px-3 rounded-lg ${
                      room.participants.some((user: any) => user._id === userId)
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {room.participants.some((user: any) => user._id === userId) ? "Open Conversation" : "Join Room"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg">
              <h2 className="text-xl font-bold">Create a New Room</h2>
              <input
                type="text"
                placeholder="Enter room name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="border p-2 w-full mt-4"
              />
              <div className="flex mt-4 gap-4">
                <button onClick={handleCreateRoom} className="bg-blue-600 text-white py-2 px-4 rounded-lg">
                  Create
                </button>
                <button onClick={() => setIsModalOpen(false)} className="bg-gray-600 text-white py-2 px-4 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {creatorProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg w-96">
              <div className="flex flex-col items-center">
                {creatorProfile.profile?.profile_picture && (
                  <img src={creatorProfile.profile.profile_picture} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
                )}
                <h2 className="text-xl font-bold">{creatorProfile.name}</h2>
                {creatorProfile.profile?.bio && <p className="text-sm text-foreground/80 mt-2">{creatorProfile.profile.bio}</p>}
              </div>
              <button onClick={handleCloseCreatorProfile} className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg w-full">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
