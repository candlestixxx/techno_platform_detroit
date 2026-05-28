"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load profile");
          return res.json();
        })
        .then((data) => {
          setProfileData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setError("Please sign in to view your profile.");
      setLoading(false);
    }
  }, [status]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        <p>Loading Profile...</p>
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
    <div className="min-h-screen bg-black text-white p-8 max-w-5xl mx-auto">
      <div className="flex items-center space-x-6 mb-12 border-b border-zinc-800 pb-8">
        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.3)]">
           {profileData?.image ? (
               <img src={profileData.image} alt="Profile" className="w-full h-full object-cover" />
           ) : (
               <span className="text-3xl font-mono text-zinc-500">{profileData?.name?.charAt(0) || "U"}</span>
           )}
        </div>
        <div>
          <h1 className="text-4xl font-bold font-mono uppercase tracking-widest text-neon-green">{profileData?.name || "Anonymous User"}</h1>
          <p className="text-zinc-400 font-mono mt-2">{profileData?.email}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono uppercase tracking-wider text-zinc-300">
            Role: {profileData?.role}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subscriptions Section */}
        <section className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 font-mono text-white flex items-center">
             <span className="bg-neon-green w-2 h-6 mr-3 inline-block"></span>
             Active Subscriptions
          </h2>
          {profileData?.subscriptions && profileData.subscriptions.length > 0 ? (
            <ul className="space-y-4">
              {profileData.subscriptions.map((sub: any) => (
                <li key={sub.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <div>
                     <p className="font-bold text-lg">{sub.tier.artist?.name || "Unknown Artist"}</p>
                     <p className="text-zinc-400 text-sm font-mono">{sub.tier.name} - ${sub.tier.price}/mo</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded uppercase font-bold tracking-wider ${sub.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {sub.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 italic">No active artist subscriptions found.</p>
          )}
        </section>

        {/* Claimed Coupons / Redemptions Section */}
        <section className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 font-mono text-white flex items-center">
             <span className="bg-blue-500 w-2 h-6 mr-3 inline-block"></span>
             Claimed Promotions
          </h2>
          {profileData?.redemptions && profileData.redemptions.length > 0 ? (
            <ul className="space-y-4">
              {profileData.redemptions.map((redemption: any) => (
                <li key={redemption.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-between items-center">
                  <div>
                     <p className="font-bold text-lg">{redemption.product.title}</p>
                     <p className="text-zinc-400 text-sm font-mono">From: {redemption.product.seller?.name || "Local Business"}</p>
                     <p className="text-xs text-zinc-500 mt-1">Redeemed: {new Date(redemption.redeemedAt).toLocaleDateString()}</p>
                  </div>
                  {redemption.product.qrCode && (
                     <div className="bg-white p-1 rounded">
                       {/* Placeholder for actual QR image */}
                       <div className="w-12 h-12 bg-black flex items-center justify-center text-[10px] text-white text-center leading-tight">
                         QR<br/>CODE
                       </div>
                     </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 italic">No claimed promotions or coupons found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
