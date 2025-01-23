"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {/* App Name with Gradient and Animation */}
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">Chat Stream</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-foreground/80 mb-8">Join us to get started or log in to continue your journey.</p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Sign Up Button */}
          <button
            onClick={() => router.push("/auth/signup")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign Up
          </button>

          {/* Login Button */}
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-transparent border border-foreground/20 text-foreground py-2 px-6 rounded-lg hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
