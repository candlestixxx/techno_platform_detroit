"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>({ flaggedPosts: [], flaggedEvents: [], unapprovedBusinesses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin");
      if (!res.ok) {
        throw new Error(res.status === 403 ? "Forbidden. You are not an admin." : "Failed to load admin data.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchData();
    else if (status === "unauthenticated") {
      setError("Please sign in.");
      setLoading(false);
    }
  }, [status]);

  const handleAction = async (action: string, targetId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId }),
      });
      if (res.ok) {
        alert("Action successful.");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold font-mono text-neon-green uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">
        Admin Governance
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-zinc-950 border border-red-900/50 p-6 rounded shadow-lg">
          <h2 className="text-xl font-bold font-mono text-red-500 mb-4 border-b border-zinc-800 pb-2">Flagged Posts</h2>
          {data.flaggedPosts.length === 0 ? (
            <p className="text-zinc-500 italic">No flagged posts.</p>
          ) : (
            <div className="space-y-4">
              {data.flaggedPosts.map((post: any) => (
                <div key={post.id} className="bg-zinc-900 p-4 rounded border border-zinc-800">
                   <p className="text-sm text-zinc-400 mb-2">Author: {post.author?.name || post.authorId}</p>
                   <p className="text-gray-300 bg-black p-2 rounded mb-4">"{post.content}"</p>
                   <div className="flex gap-2">
                     <button onClick={() => handleAction("unflag_post", post.id)} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold uppercase rounded transition">Pardon</button>
                     <button onClick={() => handleAction("delete_post", post.id)} className="px-3 py-1 bg-red-900 hover:bg-red-800 text-sm font-bold uppercase rounded transition text-red-200">Delete</button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-zinc-950 border border-blue-900/50 p-6 rounded shadow-lg">
          <h2 className="text-xl font-bold font-mono text-blue-500 mb-4 border-b border-zinc-800 pb-2">Pending Business Approvals</h2>
          {data.unapprovedBusinesses.length === 0 ? (
            <p className="text-zinc-500 italic">No pending businesses.</p>
          ) : (
             <div className="space-y-4">
               {data.unapprovedBusinesses.map((biz: any) => (
                 <div key={biz.id} className="bg-zinc-900 p-4 rounded border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{biz.name || "Unnamed Business"}</p>
                      <p className="text-xs text-zinc-500">{biz.email}</p>
                    </div>
                    <button onClick={() => handleAction("approve_business", biz.id)} className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-sm font-bold uppercase rounded transition text-blue-200">Approve</button>
                 </div>
               ))}
             </div>
          )}
        </section>

        <section className="bg-zinc-950 border border-yellow-900/50 p-6 rounded shadow-lg">
          <h2 className="text-xl font-bold font-mono text-yellow-500 mb-4 border-b border-zinc-800 pb-2">Flagged Events</h2>
          {data.flaggedEvents.length === 0 ? (
            <p className="text-zinc-500 italic">No flagged events.</p>
          ) : (
            <div className="space-y-4">
              {data.flaggedEvents.map((event: any) => (
                <div key={event.id} className="bg-zinc-900 p-4 rounded border border-zinc-800">
                   <p className="font-bold text-yellow-500">{event.title}</p>
                   <p className="text-xs text-zinc-400 mb-2">{event.venue} | {new Date(event.date).toLocaleDateString()}</p>
                   <div className="flex gap-2">
                     <button onClick={() => handleAction("unflag_event", event.id)} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold uppercase rounded transition">Pardon</button>
                     <button onClick={() => handleAction("delete_event", event.id)} className="px-3 py-1 bg-red-900 hover:bg-red-800 text-sm font-bold uppercase rounded transition text-red-200">Delete</button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
