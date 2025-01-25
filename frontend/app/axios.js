// utils/axios.js
import axios from "axios";
import Router from "next/router";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach the token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    const { response } = error;
    if (response?.data?.message === "jwt expired") {
      // Clear the token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      // Redirect the user to the login page using Next.js Router
      Router.push("/login");

      // Optionally show a toast message
      // import toast from "react-hot-toast";
      // toast.error("Session expired. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default api;
