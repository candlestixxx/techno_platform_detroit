"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, QrCode, Package, Music } from "lucide-react";
import HeaderAuth from "@/components/layout/HeaderAuth";
import Link from "next/link";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutProduct, setCheckoutProduct] = useState<any | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isScanningGeo, setIsScanningGeo] = useState(false);
  const [geoVerified, setGeoVerified] = useState(false);

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
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
            Detroit <span className="text-gray-500">Underground</span> Exchange
          </h1>
          <p className="text-xl text-gray-400 font-medium mb-4">
            Support local artists and businesses. Direct from the source.
          </p>
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300">
            ← Back to Hub
          </Link>
        </div>
        <HeaderAuth />
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

                  <button
                    onClick={() => setCheckoutProduct(product)}
                    className="bg-white text-black px-4 py-2 font-bold uppercase text-sm hover:bg-gray-200 transition-colors"
                  >
                    {product.type === "LOCAL_PROMO_COUPON" ? "Claim" : "Buy"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout Modal Overlay */}
      {checkoutProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-black uppercase tracking-widest text-lg">
                {checkoutProduct.type === "LOCAL_PROMO_COUPON" ? "Claim Coupon" : "Checkout"}
              </h2>
              <button
                onClick={() => setCheckoutProduct(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Product Summary */}
              <div className="flex gap-4 items-center bg-black/30 p-4 rounded border border-gray-800">
                <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center shrink-0">
                  {getIconForType(checkoutProduct.type)}
                </div>
                <div>
                  <div className="font-bold">{checkoutProduct.title}</div>
                  <div className="text-sm text-gray-400">{checkoutProduct.seller.name}</div>
                  <div className="font-black text-purple-400 mt-1">
                    {checkoutProduct.price > 0 ? `$${checkoutProduct.price.toFixed(2)}` : "FREE"}
                  </div>
                </div>
              </div>

              {checkoutProduct.type === "PHYSICAL_MERCH" || checkoutProduct.type === "LIMITED_VINYL" ? (
                // Physical Shipping Form
                <form
                  className="flex flex-col gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setCheckoutLoading(true);
                    try {
                      const res = await fetch("/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          productId: checkoutProduct.id,
                        }),
                      });
                      const data = await res.json();
                      if (data.url) {
                        alert("Mocking redirect to: " + data.url);
                        setCheckoutProduct(null);
                      }
                    } catch (error) {
                      console.error("Checkout failed:", error);
                    } finally {
                      setCheckoutLoading(false);
                    }
                  }}
                >
                  <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Shipping Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-purple-500 outline-none" required />
                    <input type="text" placeholder="Last Name" className="bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-purple-500 outline-none" required />
                  </div>
                  <input type="text" placeholder="Street Address" className="bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-purple-500 outline-none" required />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="text" placeholder="City" className="col-span-2 bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-purple-500 outline-none" required />
                    <input type="text" placeholder="Zip" className="bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-purple-500 outline-none" required />
                  </div>
                  <button disabled={checkoutLoading} type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest py-3 rounded mt-4 transition-colors disabled:opacity-50">
                    {checkoutLoading ? "Processing..." : "Continue to Payment"}
                  </button>
                </form>
              ) : checkoutProduct.type === "LOCAL_PROMO_COUPON" ? (
                // Digital Coupon Claim with Simulated Geo-Scan
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <QrCode size={64} className={`mb-4 transition-all duration-500 ${isScanningGeo ? 'text-emerald-500 animate-pulse scale-110' : geoVerified ? 'text-emerald-400' : 'text-gray-600'}`} />

                  {!geoVerified ? (
                    <>
                      <p className="text-gray-400 text-sm mb-6">
                        You must be physically near {checkoutProduct.seller.name} to claim this drop. Scan your coordinates to unlock.
                      </p>
                      <button
                        type="button"
                        disabled={isScanningGeo}
                        onClick={() => {
                          setIsScanningGeo(true);
                          // Simulate a geolocation check taking 2 seconds
                          setTimeout(() => {
                            setIsScanningGeo(false);
                            setGeoVerified(true);
                          }, 2000);
                        }}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-emerald-500 border border-emerald-900 font-bold uppercase tracking-widest py-3 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isScanningGeo ? "Acquiring Satellites..." : "Scan Location"}
                      </button>
                    </>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
                       <p className="text-emerald-400 font-bold text-sm mb-6 uppercase tracking-widest">
                        Location Verified. Drop Unlocked.
                      </p>
                      <button type="button" onClick={() => { alert("Coupon Claimed!"); setCheckoutProduct(null); setGeoVerified(false); }} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest py-3 rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Digital Download
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <p className="text-gray-400 text-sm mb-6">
                    You are purchasing a digital audio file. A secure download link will be emailed to you after payment.
                  </p>
                  <button
                    type="button"
                    disabled={checkoutLoading}
                    onClick={async () => {
                      setCheckoutLoading(true);
                      try {
                        const res = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            productId: checkoutProduct.id,
                          }),
                        });
                        const data = await res.json();
                        if (data.url) {
                          alert("Mocking redirect to: " + data.url);
                          setCheckoutProduct(null);
                        }
                      } catch (error) {
                        console.error("Checkout failed:", error);
                      } finally {
                        setCheckoutLoading(false);
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest py-3 rounded transition-colors disabled:opacity-50"
                  >
                    {checkoutLoading ? "Processing..." : "Continue to Payment"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
