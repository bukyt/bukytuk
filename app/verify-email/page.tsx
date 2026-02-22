"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying your email...");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link");
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage("Email verified successfully! Redirecting to login...");
          setIsVerified(true);
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setMessage(data.error || "Email verification failed");
        }
      } catch (error) {
        setMessage("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-900">
      <h1 className="text-3xl font-bold mb-6 text-white">Verify Email</h1>
      <div className="flex flex-col gap-4 bg-gray-800 p-8 rounded shadow-md w-80 text-center">
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}
        <p
          className={`text-sm mt-2 ${
            isVerified ? "text-green-400" : "text-white"
          }`}
        >
          {message}
        </p>
      </div>
      {!isLoading && (
        <Link href="/login" className="mt-6 text-blue-300 hover:text-blue-100">
          Back to Login
        </Link>
      )}
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-blue-900"><div className="text-white">Loading...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
