"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function ChatRoomsPage() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await axios.get("/api/v1/chat/rooms");
      setRooms(response.data);
    };
    fetchRooms();
  }, []);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Chat Rooms</h1>
      {rooms.map((room: any) => (
        <Link href={`/chat/${room.roomId}`} key={room.roomId} className="bg-white shadow p-4 rounded hover:bg-gray-100">
          {room.roomName}
        </Link>
      ))}
    </div>
  );
}
