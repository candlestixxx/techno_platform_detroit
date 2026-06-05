"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Music, MapPin, Store, Send } from "lucide-react";
import { useSession } from "next-auth/react";

// Mock Data Types
type PostType = "ARTIST_POST" | "EVENT_UPDATE" | "BUSINESS_SPOTLIGHT";

interface Post {
  id: string;
  type: PostType;
  author: string;
  timestamp: string;
  content: string;
  metadata?: any;
}

// Fetch API Call to Prisma Route
const fetchFeedPage = async (page: number): Promise<{ posts: Post[]; hasMore: boolean }> => {
  try {
    const res = await fetch(`/api/feed?page=${page}`);
    if (!res.ok) throw new Error("Failed to fetch feed");
    const data = await res.json();

    // Map Prisma models to frontend expected format
    const formattedPosts: Post[] = data.posts.map((post: any) => ({
      id: post.id,
      type: post.type === "ARTIST_UPDATE" ? "ARTIST_POST" : post.type === "EVENT_ANNOUNCEMENT" ? "EVENT_UPDATE" : "BUSINESS_SPOTLIGHT",
      author: post.author?.name || "Unknown",
      timestamp: new Date(post.createdAt).toLocaleDateString(),
      content: post.content,
      metadata: post.metadata || (post.embedUrl ? { embedUrl: post.embedUrl } : undefined),
    }));

    return { posts: formattedPosts, hasMore: data.hasMore };
  } catch (error) {
    console.error(error);
    return { posts: [], hasMore: false };
  }
};

export default function HybridSocialFeed() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer setup for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setLoading(true);
    fetchFeedPage(page).then((data) => {
      setPosts((prev) => {
        // Prevent duplicate posts in dev strict mode
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPosts = data.posts.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });
      setHasMore(data.hasMore);
      setLoading(false);
    });
  }, [page]);

  const renderPostIcon = (type: PostType) => {
    switch (type) {
      case "ARTIST_POST": return <Music size={18} className="text-purple-400" />;
      case "EVENT_UPDATE": return <MapPin size={18} className="text-blue-400" />;
      case "BUSINESS_SPOTLIGHT": return <Store size={18} className="text-emerald-400" />;
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent, type: "GENERAL" }),
      });

      if (res.ok) {
        const data = await res.json();
        // Construct a new post object for immediate UI rendering
        const newPost: Post = {
          id: data.post.id,
          type: "ARTIST_POST", // Fallback for visual rendering logic
          author: session?.user?.name || "Me",
          timestamp: "Just now",
          content: data.post.content,
        };
        setPosts((prev) => [newPost, ...prev]);
        setNewPostContent("");
      }
    } catch (error) {
      console.error("Failed to create post", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">

      {session && session.user && (
        <form onSubmit={handleCreatePost} className="bg-gray-900 border border-purple-900/50 p-4 rounded shadow-xl flex flex-col gap-3">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Broadcast to the underground..."
            className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none resize-none h-24 transition-colors"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPosting || !newPostContent.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest px-6 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <Send size={16} />
              {isPosting ? "Sending..." : "Transmit"}
            </button>
          </div>
        </form>
      )}

      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;

        return (
          <div
            key={`${post.id}-${index}`}
            ref={isLast ? lastPostElementRef : null}
            className="bg-gray-900 border border-gray-800 rounded-sm p-6 shadow-xl"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                {renderPostIcon(post.type)}
              </div>
              <div className="flex-grow">
                <div className="font-bold text-gray-100 flex items-center gap-2">
                  {post.author}
                  {post.type === "EVENT_UPDATE" && (
                    <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded uppercase tracking-wider">
                      {post.metadata?.source}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{post.timestamp}</div>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-gray-300 mb-4 leading-relaxed">
              {post.content}
            </p>

            {/* Post Type Specific Metadata/Embeds */}
            {post.type === "ARTIST_POST" && post.metadata?.embedUrl && (
              <div className="bg-gray-800 p-4 border border-gray-700 flex items-center justify-center h-24 text-gray-500 text-sm">
                [ SoundCloud Embed Placeholder ]
              </div>
            )}

            {post.type === "BUSINESS_SPOTLIGHT" && post.metadata?.offerCode && (
              <div className="bg-emerald-900/20 border border-emerald-800 p-4 mt-4">
                <div className="text-xs text-emerald-500 uppercase tracking-widest font-bold mb-1">
                  Digital Coupon
                </div>
                <div className="font-mono text-emerald-300 font-bold">
                  Code: {post.metadata.offerCode}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {loading && (
        <div className="py-8 text-center text-gray-500 uppercase font-bold tracking-widest animate-pulse">
          Loading more from the underground...
        </div>
      )}

      {!hasMore && (
        <div className="py-8 text-center text-gray-600 uppercase text-sm tracking-widest">
          End of feed.
        </div>
      )}
    </div>
  );
}
