"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, QrCode, Package, Music } from "lucide-react";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch mock products from the API route we created
    fetch("/api/marketplace")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case "LIMITED_VINYL":
      case "DIGITAL_TRACK":
        return <Music size={20} className="text-purple-400" />;
      case "PHYSICAL_MERCH":
        return <Package size={20} className="text-gray-400" />;
      case "LOCAL_PROMO_COUPON":
        return <QrCode size={20} className="text-emerald-400" />;
      default:
        return <ShoppingCart size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8">
      <header className="mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
          Detroit <span className="text-gray-500">Underground</span> Exchange
        </h1>
        <p className="text-xl text-gray-400 font-medium">
          Support local artists and businesses. Direct from the source.
        </p>
      </header>

      {loading ? (
        <div className="text-center text-gray-500 py-20 font-bold uppercase tracking-widest animate-pulse">
          Loading Grid...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors group flex flex-col h-full"
            >
              {/* Product Visual Area (Mock Image Box) */}
              <div className="aspect-square bg-gray-800 relative overflow-hidden flex items-center justify-center border-b border-gray-800">
                <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-2 backdrop-blur-sm">
                  {getIconForType(product.type)}
                  {product.type.replace(/_/g, " ")}
                </div>
                {/* Fallback pattern for visual interest */}
                <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="w-48 h-48 border-8 border-current rounded-full" />
                </div>
              </div>

              {/* Product Metadata */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
                  {product.seller.name}
                </div>
                <h2 className="text-xl font-bold mb-2 leading-tight">
                  {product.title}
                </h2>
                <p className="text-gray-400 text-sm mb-6 flex-grow">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-black">
                    {product.price > 0 ? `$${product.price.toFixed(2)}` : "FREE"}
                  </span>

                  <button className="bg-white text-black px-4 py-2 font-bold uppercase text-sm hover:bg-gray-200 transition-colors">
                    {product.type === "LOCAL_PROMO_COUPON" ? "Claim" : "Buy"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
