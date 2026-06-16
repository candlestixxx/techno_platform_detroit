"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [aiRecs, setAiRecs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");

  const fetchProfileData = () => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfileData(data);
        setEditName(data.name || "");
        setEditRole(data.role || "USER");
        setLoading(false);
        // Fetch AI Recommendations in background
        fetch("/api/ai/recommendations")
           .then(res => res.json())
           .then(recData => {
               if (recData.recommendations) {
                   setAiRecs(recData.recommendations);
               }
           })
           .catch(console.error);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setError("Please sign in to view your profile.");
      setLoading(false);
    }
  }, [status]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, role: editRole }),
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfileData();
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  const handleMint = async (productId: string) => {
    try {
      const res = await fetch("/api/blockchain/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully minted! Tx Hash: ${data.txHash}`);
        // Refresh profile data
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || "Minting failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during minting.");
    }
  };

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
      <div className="flex items-center justify-between mb-12 border-b border-zinc-800 pb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.3)]">
             {profileData?.image ? (
                 <img src={profileData.image} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <span className="text-3xl font-mono text-zinc-500">{profileData?.name?.charAt(0) || "U"}</span>
             )}
          </div>
          <div>
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-neon-green font-mono uppercase"
                  placeholder="Your Name"
                />
                <select 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-300 font-mono text-xs uppercase"
                >
                  <option value="USER">User</option>
                  <option value="ARTIST">Artist / DJ</option>
                  <option value="BUSINESS">Local Business</option>
                </select>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold font-mono uppercase tracking-widest text-neon-green">{profileData?.name || "Anonymous User"}</h1>
                <p className="text-zinc-400 font-mono mt-2">{profileData?.email}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Role: {profileData?.role}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-4">
           {isEditing ? (
             <>
               <button onClick={handleUpdateProfile} className="px-4 py-2 bg-neon-green text-black font-bold uppercase text-xs rounded hover:bg-green-400 transition-colors">Save</button>
               <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-zinc-800 text-zinc-400 font-bold uppercase text-xs rounded hover:bg-zinc-700 transition-colors">Cancel</button>
             </>
           ) : (
             <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase text-xs rounded hover:bg-zinc-800 transition-colors">Settings</button>
           )}
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

      {/* Manage Catalog Section for Artists/Businesses */}
      {profileData?.products && profileData.products.length > 0 && (
        <section className="mt-8 bg-zinc-950 border border-emerald-900/50 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 font-mono text-white flex items-center">
             <span className="bg-emerald-500 w-2 h-6 mr-3 inline-block"></span>
             Manage Catalog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileData.products.map((product: any) => (
              <div key={product.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-emerald-400">{product.title}</h3>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{product.type}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{product.description}</p>
                
                {product.type === "LIMITED_VINYL" && (
                  <div className="mt-auto pt-4 border-t border-zinc-800">
                    {product.txHash ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Blockchain Status: Minted</span>
                        <code className="text-[9px] text-emerald-500 bg-black p-1 rounded break-all">{product.txHash}</code>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleMint(product.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase py-2 rounded transition-colors"
                      >
                        Mint Limited Edition NFT
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Recommendations Section */}
      <section className="mt-8 bg-zinc-950 border border-purple-900/50 p-6 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.1)]">
        <h2 className="text-2xl font-bold mb-4 font-mono text-white flex items-center">
           <span className="bg-purple-500 w-2 h-6 mr-3 inline-block"></span>
           AI Underground Intel
        </h2>
        {aiRecs ? (
           <div className="bg-zinc-900 p-4 rounded-lg border border-purple-900/30 text-purple-200 font-mono text-sm leading-relaxed whitespace-pre-line">
              {aiRecs}
           </div>
        ) : (
           <div className="animate-pulse flex space-x-4">
             <div className="flex-1 space-y-4 py-1">
               <div className="h-2 bg-zinc-800 rounded w-3/4"></div>
               <div className="space-y-2">
                 <div className="h-2 bg-zinc-800 rounded"></div>
                 <div className="h-2 bg-zinc-800 rounded w-5/6"></div>
               </div>
             </div>
           </div>
        )}
      </section>
    </div>
  );
}
