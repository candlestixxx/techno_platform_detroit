"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  tooltip: string;
  highlightColor?: string;
}

function MetricCard({ label, value, subtext, tooltip, highlightColor = "text-white" }: MetricCardProps) {
  return (
    <div className="relative group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 rounded-lg shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-semibold">{label}</span>
        <span
          className="text-zinc-500 hover:text-zinc-300 text-xs cursor-help px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-950 select-none"
          title={tooltip}
        >
          ?
        </span>
      </div>
      <p className={`text-3xl font-extrabold mt-2 font-mono ${highlightColor}`}>{value}</p>
      {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}

      {/* Tooltip Hover Overlay */}
      <div className="opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-950 text-zinc-200 text-xs rounded border border-zinc-700 shadow-xl z-20 text-center">
        {tooltip}
      </div>
    </div>
  );
}

export default function UnifiedDashboard() {
  const { data: session, status } = useSession();

  // Data state
  const [activeTab, setActiveTab] = useState<"overview" | "business" | "governance" | "navigation">("overview");
  const [businessData, setBusinessData] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>({ flaggedPosts: [], flaggedEvents: [], unapprovedBusinesses: [] });
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");

  // Broadcast push state
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [sendingPush, setSendingPush] = useState(false);
  const [pushFeedback, setPushFeedback] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === "ADMIN" || (session?.user as any)?.isAdmin;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch business analytics if applicable
      const bizPromise = fetch("/api/analytics/business")
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      // 2. Fetch admin moderation if user is admin
      const adminPromise = isAdmin
        ? fetch("/api/admin")
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        : Promise.resolve(null);

      const [bizRes, adminRes] = await Promise.all([bizPromise, adminPromise]);

      if (bizRes) setBusinessData(bizRes);
      if (adminRes) setAdminData(adminRes);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, isAdmin]);

  const handleAdminAction = async (action: string, targetId: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetId }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || "Action failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred executing moderation action.");
    }
  };

  const handleBroadcastPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushMessage.trim()) return;
    setSendingPush(true);
    setPushFeedback(null);

    try {
      const res = await fetch("/api/push/expo-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pushTitle, message: pushMessage }),
      });
      if (res.ok) {
        const result = await res.json();
        setPushFeedback(`✓ Broadcast sent to ${result.sent} device(s).`);
        setPushTitle("");
        setPushMessage("");
      } else {
        const err = await res.json();
        setPushFeedback(`✗ Failed: ${err.error || "Unknown error"}`);
      }
    } catch {
      setPushFeedback("✗ Connection error dispatching notification.");
    } finally {
      setSendingPush(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-zinc-400 font-mono">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-sm uppercase tracking-widest">Loading Unified Hub Dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-white p-6">
        <h2 className="text-2xl font-bold font-mono text-yellow-500 uppercase tracking-widest mb-4">Authentication Required</h2>
        <p className="text-zinc-400 max-w-md text-center mb-6 text-sm">
          You must be logged in to access the unified hub operations dashboard and control center.
        </p>
        <Link
          href="/auth/signin"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-wider rounded text-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6 md:p-8 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Banner / Header */}
      <header className="border-b border-zinc-800 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white font-mono">
              Hub <span className="text-emerald-400">Dashboard</span>
            </h1>
            <span
              className="text-xs px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono uppercase tracking-widest"
              title="Current logged-in identity level"
            >
              Role: {(session?.user as any)?.role || "USER"}
            </span>
            {isAdmin && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-mono font-bold uppercase tracking-wider">
                Admin Mode
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Consolidated operational overview: analytics, commerce, moderation & platform management.
          </p>
        </div>

        {/* Global Action / Subsystem Quick Links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-xs uppercase font-mono tracking-wider transition"
          >
            ← Live Feed
          </Link>
          <Link
            href="/marketplace"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-emerald-400 rounded text-xs uppercase font-mono tracking-wider transition"
          >
            Marketplace
          </Link>
          <Link
            href="/inbox"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-purple-400 rounded text-xs uppercase font-mono tracking-wider transition"
          >
            Inbox (DM)
          </Link>
          <Link
            href="/forum"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 rounded text-xs uppercase font-mono tracking-wider transition"
          >
            Community Forum
          </Link>
        </div>
      </header>

      {/* Primary Tab Navigation Filter */}
      <div className="flex border-b border-zinc-800 mb-8 gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition ${
            activeTab === "overview"
              ? "bg-emerald-500 text-black shadow-lg"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab("business")}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition ${
            activeTab === "business"
              ? "bg-emerald-500 text-black shadow-lg"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          Business Analytics
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("governance")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition ${
              activeTab === "governance"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Admin Governance
          </button>
        )}
        <button
          onClick={() => setActiveTab("navigation")}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition ${
            activeTab === "navigation"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"
          }`}
        >
          Subsystems Directory
        </button>
      </div>

      {/* OVERVIEW / METRICS SECTION */}
      {(activeTab === "overview" || activeTab === "business") && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Commerce & Business Activity
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Consolidated from /dashboard/business</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Active Products/Coupons"
              value={businessData?.metrics?.totalProducts || 0}
              subtext="Catalog items across marketplace"
              tooltip="Total vinyl, merch, and business promotional coupons active in the Detroit Underground store."
              highlightColor="text-emerald-400"
            />
            <MetricCard
              label="Total Redemptions"
              value={businessData?.metrics?.totalRedemptions || 0}
              subtext="Customer coupon claims"
              tooltip="Sum of verified in-person or online coupon code claims by community members."
              highlightColor="text-blue-400"
            />
            <MetricCard
              label="Pending Moderations"
              value={
                isAdmin
                  ? (adminData.flaggedPosts?.length || 0) + (adminData.flaggedEvents?.length || 0)
                  : "N/A"
              }
              subtext="Flagged items awaiting review"
              tooltip="Community reported posts or events requiring admin pardon or deletion."
              highlightColor="text-yellow-400"
            />
            <MetricCard
              label="Pending Businesses"
              value={isAdmin ? adminData.unapprovedBusinesses?.length || 0 : "N/A"}
              subtext="New vendor onboard requests"
              tooltip="Business accounts awaiting administrator vetting and approval."
              highlightColor="text-purple-400"
            />
          </div>

          {/* Product Breakdown Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-300">
                Product & Promotion Breakdown
              </h3>
              <span className="text-xs text-zinc-500" title="Tracks real-time redemption velocity">
                ℹ Real-time metrics
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-wider">
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Redemptions</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {businessData?.products?.map((product: any) => (
                    <tr key={product.id} className="hover:bg-zinc-900/50 transition">
                      <td className="p-3 font-semibold text-zinc-200">{product.title}</td>
                      <td className="p-3 text-zinc-400 text-xs font-mono uppercase">{product.type}</td>
                      <td className="p-3 font-mono text-emerald-400">{product.redemptionCount}</td>
                      <td className="p-3 text-right">
                        <Link
                          href="/marketplace"
                          className="text-xs font-mono text-zinc-400 hover:text-white underline"
                        >
                          View in Store →
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!businessData?.products || businessData.products.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-zinc-600 text-xs font-mono">
                        No products or coupons registered yet. Create items in the Marketplace.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ADMIN GOVERNANCE & BROADCAST SECTION */}
      {isAdmin && (activeTab === "overview" || activeTab === "governance") && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Admin Governance & Moderation
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Consolidated from /admin</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mobile Push Notification Broadcast */}
            <div className="bg-zinc-950 border border-purple-900/40 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold font-mono text-purple-400 uppercase tracking-wider">
                  Broadcast Push Notification (Mobile)
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 cursor-help"
                  title="Sends instant push messages to all registered iOS/Android Expo tokens."
                >
                  Expo Server SDK
                </span>
              </div>

              <form onSubmit={handleBroadcastPush} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="Detroit Underground Dispatch"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Message Body *
                  </label>
                  <textarea
                    value={pushMessage}
                    onChange={(e) => setPushMessage(e.target.value)}
                    placeholder="Enter urgent event update or community alert..."
                    required
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>
                {pushFeedback && (
                  <p className="text-xs font-mono p-2 rounded bg-zinc-900 border border-zinc-800 text-purple-300">
                    {pushFeedback}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sendingPush || !pushMessage.trim()}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition"
                >
                  {sendingPush ? "Broadcasting..." : "Broadcast to All Devices"}
                </button>
              </form>
            </div>

            {/* Pending Business Approvals */}
            <div className="bg-zinc-950 border border-blue-900/40 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold font-mono text-blue-400 uppercase tracking-wider">
                  Pending Business Approvals
                </h3>
                <span
                  className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 cursor-help"
                  title="Vendors must be verified by admins before publishing coupons and products."
                >
                  {adminData.unapprovedBusinesses?.length || 0} Pending
                </span>
              </div>

              {adminData.unapprovedBusinesses?.length === 0 ? (
                <p className="text-zinc-500 text-xs italic font-mono p-4 text-center">No pending vendor applications.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {adminData.unapprovedBusinesses.map((biz: any) => (
                    <div
                      key={biz.id}
                      className="bg-zinc-900 p-3 rounded border border-zinc-800 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-sm text-zinc-200">{biz.name || "Unnamed Business"}</p>
                        <p className="text-xs text-zinc-500 font-mono">{biz.email}</p>
                      </div>
                      <button
                        onClick={() => handleAdminAction("approve_business", biz.id)}
                        className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-blue-200 text-xs font-bold font-mono uppercase rounded transition"
                        title="Grant seller access to the marketplace"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flagged Posts */}
            <div className="bg-zinc-950 border border-red-900/40 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold font-mono text-red-400 uppercase tracking-wider">Flagged Posts</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  {adminData.flaggedPosts?.length || 0} Reported
                </span>
              </div>

              {adminData.flaggedPosts?.length === 0 ? (
                <p className="text-zinc-500 text-xs italic font-mono p-4 text-center">Community feed is clean.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {adminData.flaggedPosts.map((post: any) => (
                    <div key={post.id} className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <p className="text-xs text-zinc-400 mb-1 font-mono">
                        Author: {post.author?.name || post.authorId}
                      </p>
                      <p className="text-zinc-300 bg-black/60 p-2 rounded text-xs mb-3 font-sans">
                        "{post.content}"
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleAdminAction("unflag_post", post.id)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono uppercase rounded text-zinc-300 transition"
                          title="Clear flagged flag and preserve post"
                        >
                          Pardon
                        </button>
                        <button
                          onClick={() => handleAdminAction("delete_post", post.id)}
                          className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono uppercase rounded transition"
                          title="Permanently remove post from platform"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flagged Events */}
            <div className="bg-zinc-950 border border-yellow-900/40 p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold font-mono text-yellow-400 uppercase tracking-wider">Flagged Events</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                  {adminData.flaggedEvents?.length || 0} Reported
                </span>
              </div>

              {adminData.flaggedEvents?.length === 0 ? (
                <p className="text-zinc-500 text-xs italic font-mono p-4 text-center">No reported event listings.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {adminData.flaggedEvents.map((event: any) => (
                    <div key={event.id} className="bg-zinc-900 p-3 rounded border border-zinc-800">
                      <p className="font-bold text-yellow-400 text-sm">{event.title}</p>
                      <p className="text-xs text-zinc-400 mb-2 font-mono">
                        {event.venue} | {new Date(event.date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleAdminAction("unflag_event", event.id)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono uppercase rounded text-zinc-300 transition"
                          title="Clear flagged status and keep event active"
                        >
                          Pardon
                        </button>
                        <button
                          onClick={() => handleAdminAction("delete_event", event.id)}
                          className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono uppercase rounded transition"
                          title="Permanently purge event listing"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SUBSYSTEMS DIRECTORY / NAVIGATION */}
      {(activeTab === "overview" || activeTab === "navigation") && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Consolidated Platform Modules
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Direct access points</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white mb-2 flex items-center justify-between">
                <span>Social & Events</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">Core</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Hybrid social feed integrating local community thoughts, RA.co scrapers, and Tectroit event listings.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-xs font-mono text-emerald-400 hover:underline flex items-center justify-between"
                >
                  <span>Explore Social Feed</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/forum"
                  className="text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-between"
                >
                  <span>Discussion Forum</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/inbox"
                  className="text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-between"
                >
                  <span>Direct Messaging (Inbox)</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white mb-2 flex items-center justify-between">
                <span>Commerce & Artists</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">Economy</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Decentralized merchant store, digital coupon redemption, Stripe payouts, and limited vinyl minting.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/marketplace"
                  className="text-xs font-mono text-emerald-400 hover:underline flex items-center justify-between"
                >
                  <span>Open Marketplace</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/profile"
                  className="text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-between"
                >
                  <span>My Profile & Tickets</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/dashboard/business"
                  className="text-xs font-mono text-zinc-400 hover:text-white flex items-center justify-between"
                >
                  <span>Legacy Business Route</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white mb-2 flex items-center justify-between">
                <span>System Daemon</span>
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-normal">Active</span>
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Underground server controller and desktop tray utility running for autonomous service management.
              </p>
              <div className="flex flex-col gap-2 text-xs font-mono text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Server Daemon:</span>
                  <span className="text-emerald-400 font-bold">Node.js + WebSockets</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tray Control:</span>
                  <span className="text-zinc-300">scripts/tray_server.py</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Version:</span>
                  <span className="text-zinc-300">v5.6.0</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
