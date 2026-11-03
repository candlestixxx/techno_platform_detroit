"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function BusinessDashboard() {
  const { status } = useSession();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/analytics/business")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to load analytics");
          }
          return res.json();
        })
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setError("Please sign in as a business to view your dashboard.");
      setLoading(false);
    }
  }, [status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p className="font-mono text-sm uppercase tracking-widest text-emerald-400">Loading Business Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-red-500 font-mono gap-4">
        <p>{error}</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-white rounded text-xs uppercase"
        >
          Return to Unified Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Consolidated Hub Notification Banner */}
      <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-lg p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <div>
            <h2 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wide">
              Consolidated Hub Available
            </h2>
            <p className="text-xs text-zinc-400">
              Business metrics are now fully integrated alongside moderation and communications in the Unified Dashboard.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition"
        >
          Open Unified Dashboard →
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neon-green font-mono uppercase tracking-widest">
          Business Analytics
        </h1>
        <Link
          href="/dashboard"
          className="text-xs font-mono text-zinc-400 hover:text-white underline uppercase"
        >
          ← Back to Hub Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-lg relative group">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Total Products/Coupons</h2>
            <span
              className="text-zinc-500 text-xs border border-zinc-800 rounded px-1.5 py-0.5 cursor-help"
              title="Number of active items and discounts listed in the Detroit Underground store."
            >
              ?
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-300">{data?.metrics?.totalProducts || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-lg relative group">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Total Redemptions</h2>
            <span
              className="text-zinc-500 text-xs border border-zinc-800 rounded px-1.5 py-0.5 cursor-help"
              title="Total successful discount claims made by users."
            >
              ?
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-300">{data?.metrics?.totalRedemptions || 0}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 font-mono">Product Breakdown</h2>
      <div className="overflow-x-auto bg-zinc-950 border border-zinc-900 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-xs uppercase">
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Redemptions</th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map((product: any) => (
              <tr key={product.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                <td className="p-3 font-semibold">{product.title}</td>
                <td className="p-3 text-zinc-400 text-sm">{product.type}</td>
                <td className="p-3 font-mono text-emerald-400">{product.redemptionCount}</td>
              </tr>
            ))}
            {data?.products?.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-zinc-500 font-mono text-sm">
                  No products or coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
