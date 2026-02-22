"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`Logged in successfully! Redirecting...`);
      setTimeout(() => router.push("/forum"), 500); // redirect to /forum
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-900">
      <h1 className="text-3xl font-bold mb-6 text-white">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-800 p-8 rounded shadow-md w-80"
      >
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
        {message && <p className="text-sm mt-2 text-white">{message}</p>}
        
        <div className="flex flex-col gap-2 mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-300 hover:text-blue-100"
          >
            Forgot Password?
          </Link>
          <div className="border-t border-gray-600 my-2"></div>
          <Link
            href="/register"
            className="text-sm text-green-300 hover:text-green-100"
          >
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </main>
  );
}