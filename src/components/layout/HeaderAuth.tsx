"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-gray-500 text-sm font-bold uppercase tracking-wider font-mono">...</div>;
  }

  if (session && session.user) {
    const isAdmin = (session.user as any).role === "ADMIN" || (session.user as any).isAdmin;
    
    return (
      <div className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/dashboard"
          className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-1 rounded"
          title="Consolidated Operations, Analytics & Control Center"
        >
          Dashboard
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
          >
            Admin
          </Link>
        )}
        <Link
          href="/profile"
          className="text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors"
        >
          Profile
        </Link>
        <div className="text-sm font-bold uppercase tracking-wider text-purple-400 font-mono hidden md:block">
          {session.user.name || session.user.email}
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="font-bold uppercase tracking-wider text-sm px-4 py-2 rounded text-white bg-gray-800 hover:bg-gray-700 transition-colors font-mono"
    >
      Login
    </button>
  );
}
