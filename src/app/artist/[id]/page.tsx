import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import HeaderAuth from "@/components/layout/HeaderAuth";

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      products: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 flex flex-col">
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
            {user.name || "Unknown Artist"}
          </h1>
          <p className="text-xl text-purple-400 font-bold uppercase tracking-widest mb-4">
            {user.role}
          </p>
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300">
            ← Back to Hub
          </Link>
        </div>
        <HeaderAuth />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {/* Left Column: Latest Posts */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-600 border-b border-gray-800 pb-2">
            Latest Transmissions
          </h2>
          {user.posts.length > 0 ? (
            user.posts.map((post) => (
              <div key={post.id} className="bg-gray-900 border border-gray-800 p-6 rounded shadow-xl">
                <div className="text-xs text-gray-500 mb-4">{new Date(post.createdAt).toLocaleDateString()}</div>
                <p className="text-gray-300 leading-relaxed">{post.content}</p>
                {post.embedUrl && (
                  <div className="mt-4 border border-gray-700 bg-black p-4 text-center text-gray-500 text-sm">
                    [ Audio Embed: {post.embedUrl} ]
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-600 italic">No recent posts.</div>
          )}
        </div>

        {/* Right Column: Merch / Products */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase tracking-widest text-emerald-600 border-b border-gray-800 pb-2">
            Available Merch
          </h2>
          {user.products.length > 0 ? (
            user.products.map((product) => (
              <div key={product.id} className="bg-gray-900 border border-gray-800 p-4 rounded group hover:border-gray-600 transition-colors">
                <h3 className="font-bold mb-1">{product.title}</h3>
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">{product.type.replace(/_/g, " ")}</div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-emerald-400">
                    {product.price > 0 ? `$${product.price.toFixed(2)}` : "FREE"}
                  </span>
                  <Link href="/marketplace" className="px-3 py-1 bg-gray-800 text-white text-xs uppercase font-bold tracking-widest rounded hover:bg-gray-700 transition-colors">
                    View in Store
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-600 italic">No products available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
