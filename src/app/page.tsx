"use client";

import React, { useState } from "react";
import HybridSocialFeed from "@/components/feed/HybridSocialFeed";
import UndergroundMap from "@/components/map/UndergroundMap";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"feed" | "map">("feed");

  // Mock data for the map
  const mockEvents = [
    { type: "event", title: "Movement Pre-Party", venue: "TV Lounge", lineup: ["DJ Minx", "Carl Craig"] }
  ];
  const mockBusinesses = [
    { type: "business", title: "Spot Lite Detroit", venue: "Spot Lite", offer: "15% off", code: "UNDERGROUND15" }
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100 overflow-hidden font-sans">
      <header className="bg-gray-900 border-b border-gray-800 p-4 shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter uppercase text-white">
          Detroit <span className="text-gray-500">Underground</span> Hub
        </h1>

        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("feed")}
            className={`font-bold uppercase tracking-wider text-sm px-4 py-2 rounded transition-colors ${
              activeTab === "feed" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Social Feed
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`font-bold uppercase tracking-wider text-sm px-4 py-2 rounded transition-colors ${
              activeTab === "map" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            Explore Map
          </button>
          <a
            href="/marketplace"
            className="font-bold uppercase tracking-wider text-sm px-4 py-2 rounded text-emerald-400 hover:bg-emerald-900/30 transition-colors border border-emerald-800/50"
          >
            Marketplace
          </a>
        </nav>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === "feed" && (
          <div className="absolute inset-0 overflow-y-auto">
            <HybridSocialFeed />
          </div>
        )}

        {activeTab === "map" && (
          <div className="absolute inset-0">
            <UndergroundMap events={mockEvents} businesses={mockBusinesses} />
          </div>
        )}
      </main>
    </div>
  );
}
