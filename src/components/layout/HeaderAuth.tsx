"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-gray-500 text-sm font-bold uppercase tracking-wider">...</div>;
  }

  if (session && session.user) {
    const isAdmin = (session.user as any).role === "ADMIN" || (session.user as any).isAdmin;
    
    return (
      <div className="flex items-center gap-6">
        {isAdmin && (
           <a href="/admin" className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Admin</a>
        )}
        <a href="/profile" className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">Profile</a>
        <div className="text-sm font-bold uppercase tracking-wider text-purple-400">
          {session.user.name}
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
      className="font-bold uppercase tracking-wider text-sm px-4 py-2 rounded text-white bg-gray-800 hover:bg-gray-700 transition-colors"
    >
      Login
    </button>
  );
}
