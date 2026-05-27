"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 w-full max-w-md rounded shadow-2xl">
        <h1 className="text-3xl font-black uppercase tracking-widest text-center mb-2">
          Detroit <span className="text-purple-500">Underground</span>
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm uppercase tracking-wider font-bold">
          Artist & Business Portal
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 p-3 text-sm rounded mb-6 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dj@underground.com"
              className="bg-black border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-black border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest py-3 rounded mt-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter Portal"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            First time logging in? <br/> Your account will be auto-created.
          </p>
        </div>
      </div>
    </div>
  );
}
