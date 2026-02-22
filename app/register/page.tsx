"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message || "Registered successfully! Check your email to verify your account.");
      setIsRegistered(true);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-900">
      <h1 className="text-3xl font-bold mb-6 text-white">Register</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-800 p-8 rounded shadow-md w-80"
      >
        {!isRegistered ? (
          <>
            <input
              type="email"
              placeholder="Email"
              className="p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Username"
              className="p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Register
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-green-400 font-semibold mb-4">Registration Successful!</p>
            <p className="text-sm text-gray-300 mb-4">
              Please check your email to verify your account before logging in.
            </p>
          </div>
        )}
        {message && (
          <p
            className={`text-sm mt-2 text-center ${
              message.includes("successfully") || message.includes("Check")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        {isRegistered && (
          <Link
            href="/login"
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
          >
            Go to Login
          </Link>
        )}

        {!isRegistered && (
          <div className="border-t border-gray-600 mt-4 pt-4">
            <Link
              href="/login"
              className="text-sm text-blue-300 hover:text-blue-100 text-center block"
            >
              Already have an account? Login
            </Link>
          </div>
        )}
      </form>
    </main>
  );
}