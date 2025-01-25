"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import toast from "react-hot-toast";
import { useToken } from "@/components/socketContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setToken } = useToken();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/v1/auth/signup", { name, email, password });
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);

      // Show success toast
      toast.success(response.data.message || "Signup successful!");

      router.push("/chat/rooms");
    } catch (error) {
      toast.error("Signup failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSignup} className="w-full max-w-md bg-background shadow-lg rounded-lg p-8 border border-foreground/10">
        {/* Animated App Name */}
        <h1 className="text-3xl font-bold animate-gradient text-center mb-6">Chat Stream</h1>

        {/* Name Input */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-foreground/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
          />
        </div>

        {/* Email Input */}
        <div className="mb-6">
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
        <div className="mb-6">
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

        {/* Sign Up Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Sign Up
        </button>

        {/* Link to Login */}
        <p className="text-center text-sm text-foreground/70 mt-4">
          Already have an account?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
