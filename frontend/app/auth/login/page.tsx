"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/v1/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      alert(response.data.message);

      router.push("/chat/rooms");
    } catch (error) {
      alert("Login failed!");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border mb-4 p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border mb-4 p-2 rounded" />
      <button className="bg-blue-500 text-white py-2 px-4 rounded">Login</button>
    </form>
  );
}
