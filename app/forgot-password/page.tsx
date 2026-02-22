"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        setEmail("");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-900">
      <h1 className="text-3xl font-bold mb-6 text-white">Forgot Password</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-800 p-8 rounded shadow-md w-80"
      >
        <p className="text-sm text-gray-300 mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
        {message && (
          <p
            className={`text-sm mt-2 ${
              message.includes("successfully") ||
              message.includes("sent")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>
      <Link href="/login" className="mt-6 text-blue-300 hover:text-blue-100">
        Back to Login
      </Link>
    </main>
  );
}
