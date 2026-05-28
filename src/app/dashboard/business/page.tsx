"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BusinessDashboard() {
  const { data: session, status } = useSession();
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
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-neon-green font-mono uppercase tracking-widest">Business Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Total Products/Coupons</h2>
          <p className="text-4xl font-bold text-gray-300">{data?.metrics?.totalProducts || 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Total Redemptions</h2>
          <p className="text-4xl font-bold text-gray-300">{data?.metrics?.totalRedemptions || 0}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 font-mono">Product Breakdown</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Redemptions</th>
            </tr>
          </thead>
          <tbody>
            {data?.products?.map((product: any) => (
              <tr key={product.id} className="border-b border-zinc-900 hover:bg-zinc-900">
                <td className="p-3 font-semibold">{product.title}</td>
                <td className="p-3 text-zinc-400 text-sm">{product.type}</td>
                <td className="p-3 font-mono">{product.redemptionCount}</td>
              </tr>
            ))}
            {data?.products?.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-zinc-500">
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
