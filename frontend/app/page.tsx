"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/axios";
import toast from "react-hot-toast";
import { useSocket } from "./context/socketContext";
// TODO: Profile page, online status, message sender name

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const socket = useSocket();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/v1/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);

      // Show success toast
      toast.success(response.data.message || "Login successful!");

      router.push("/chat/rooms");
    } catch (error) {
      // Show error toast
      toast.error("Login failed!");
    }
  };

  useEffect(() => {
    console.log("socket: ", socket);
  }, [socket]);

  // if already logged in, redirect to chats
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/chat/rooms");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-background shadow-lg rounded-lg p-8 border border-foreground/10">
        {/* App Title */}
        {/* <h1 className="text-3xl font-bold text-foreground mb-6 text-center">Welcome to Chat Stream</h1> */}
        <h1 className="text-4xl font-extrabold animate-gradient text-center mb-6">Chat Stream</h1>
        {/* Login Form */}
        <form onSubmit={handleLogin} className="mb-4">
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Login
          </button>
        </form>

        {/* Link to Signup */}
        <p className="text-center text-sm text-foreground/70">
          Don't have an account?{" "}
          <button onClick={() => router.push("/auth/signup")} className="text-blue-600 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
