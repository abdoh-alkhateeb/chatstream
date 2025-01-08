"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/v1/auth/signup", { name, email, password });
      alert(response.data.message);

      router.push("/auth/login");
    } catch (error) {
      alert("Signup failed!");
    }
  };

  return (
    <form onSubmit={handleSignup} className="max-w-md mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border mb-4 p-2 rounded" />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border mb-4 p-2 rounded" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border mb-4 p-2 rounded" />
      <button className="bg-blue-500 text-white py-2 px-4 rounded">Sign Up</button>
    </form>
  );
}
