"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Filter, X, MapPin } from "lucide-react";

// In a real app, this would be an environment variable
mapboxgl.accessToken = "pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xleWF0Znp5MDN3YTNxbzUzM2F1NjYzOSJ9.example-token"; // Placeholder

type MapProps = {
  events: any[];
  businesses: any[];
};

export default function UndergroundMap({ events, businesses }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(-83.0458); // Detroit coordinates
  const [lat, setLat] = useState(42.3314);
  const [zoom, setZoom] = useState(12);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filters, setFilters] = useState({
    genres: { techno: true, house: true, acid: true, electro: true },
    categories: { restaurants: true, recordStores: true, apparel: true },
  });

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11", // Dark monochrome industrial style
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      // Setup map layers and sources here once loaded
      // This is a simplified version, in reality you'd add GeoJSON sources and layers
    });
  });

  const toggleGenreFilter = (genre: keyof typeof filters.genres) => {
    setFilters((prev) => ({
      ...prev,
      genres: { ...prev.genres, [genre]: !prev.genres[genre] },
    }));
  };

  const toggleCategoryFilter = (category: keyof typeof filters.categories) => {
    setFilters((prev) => ({
      ...prev,
      categories: { ...prev.categories, [category]: !prev.categories[category] },
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <div className="flex flex-wrap p-4 bg-gray-800 border-b border-gray-700 gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <span className="font-bold uppercase tracking-wider text-sm">Filters</span>
        </div>

        <div className="flex gap-2 items-center border-l border-gray-700 pl-4">
          <span className="text-xs text-gray-400 uppercase">Music:</span>
          {Object.keys(filters.genres).map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenreFilter(genre as keyof typeof filters.genres)}
              className={`px-3 py-1 text-xs uppercase font-bold rounded-full border transition-colors ${
                filters.genres[genre as keyof typeof filters.genres]
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-gray-800 border-gray-600 text-gray-400"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center border-l border-gray-700 pl-4">
          <span className="text-xs text-gray-400 uppercase">Local:</span>
          {Object.keys(filters.categories).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategoryFilter(cat as keyof typeof filters.categories)}
              className={`px-3 py-1 text-xs uppercase font-bold rounded-full border transition-colors ${
                filters.categories[cat as keyof typeof filters.categories]
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-gray-800 border-gray-600 text-gray-400"
              }`}
            >
              {cat.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Interactive Drawer / Popup */}
        {selectedItem && (
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10 animate-in slide-in-from-bottom-4">
            <div className="max-w-md mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                    {selectedItem.type === "event" ? "Live Event" : "Local Business"}
                  </span>
                  <h3 className="text-xl font-black">{selectedItem.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={16} />
                <span>{selectedItem.venue}</span>
              </div>

              {selectedItem.type === "event" && (
                <div className="bg-gray-800 p-3 rounded text-sm">
                  <div className="font-bold text-gray-300 mb-1">Lineup:</div>
                  <div className="text-gray-400">{selectedItem.lineup.join(" • ")}</div>
                </div>
              )}

              {selectedItem.type === "business" && (
                <div className="bg-emerald-900/30 border border-emerald-800/50 p-3 rounded text-sm">
                  <div className="font-bold text-emerald-400 mb-1">Special Offer:</div>
                  <div className="text-gray-300">{selectedItem.offer}</div>
                  <div className="mt-2 text-xs font-mono bg-black p-1 inline-block rounded text-emerald-400">
                    Code: {selectedItem.code}
                  </div>
                </div>
              )}

              <button className="w-full py-2 bg-gray-100 text-gray-900 font-bold uppercase text-sm tracking-wider rounded hover:bg-white transition-colors mt-2">
                {selectedItem.type === "event" ? "Get Tickets via RA" : "Claim Coupon"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
