"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Music, MapPin, Store, Send } from "lucide-react";
import { useSession } from "next-auth/react";

// Unified Feed Types
type PostType = "ARTIST_POST" | "EVENT_UPDATE" | "BUSINESS_SPOTLIGHT" | "GENERAL";

interface Post {
  id: string;
  type: PostType;
  author: string;
  role?: string;
  timestamp: string;
  content: string;
  metadata?: any;
}

const fetchFeedPage = async (page: number): Promise<{ posts: Post[]; hasMore: boolean }> => {
  try {
    const res = await fetch(`/api/feed?page=${page}`);
    if (!res.ok) throw new Error("Failed to fetch feed");
    const data = await res.json();

    const formattedPosts: Post[] = data.posts.map((post: any) => ({
      id: post.id,
      type: post.type,
      author: post.author,
      role: post.role,
      timestamp: new Date(post.createdAt).toLocaleString(),
      content: post.content,
      metadata: post.metadata,
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
  const [postType, setPostType] = useState<string>("GENERAL");
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
      default: return <Send size={18} className="text-gray-400" />;
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
        body: JSON.stringify({ content: newPostContent, type: postType }),
      });

      if (res.ok) {
        const data = await res.json();
        const newPost: Post = {
          id: data.post.id,
          type: data.post.type as PostType,
          author: session?.user?.name || "Me",
          role: (session?.user as any)?.role,
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
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6 font-mono">
      {session && session.user && (
        <form onSubmit={handleCreatePost} className="bg-zinc-950 border border-zinc-800 p-4 rounded shadow-xl flex flex-col gap-3">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={(session.user as any).role === "ARTIST" ? "Broadcast your latest sound..." : (session.user as any).role === "BUSINESS" ? "Post a local spotlight..." : "Update the underground..."}
            className="w-full bg-black border border-zinc-800 rounded p-3 text-white focus:border-neon-green outline-none resize-none h-24 transition-colors text-sm"
            required
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
               {(session.user as any).role === "ARTIST" && (
                 <select 
                    value={postType === "GENERAL" ? "ARTIST_UPDATE" : postType} 
                    onChange={(e) => setPostType(e.target.value)}
                    className="bg-black border border-zinc-800 text-[10px] text-purple-400 font-bold uppercase p-1 rounded outline-none"
                 >
                    <option value="ARTIST_UPDATE">Track Update</option>
                    <option value="EVENT_ANNOUNCEMENT">Gig Announcement</option>
                 </select>
               )}
               {(session.user as any).role === "BUSINESS" && (
                 <select 
                    value={postType === "GENERAL" ? "BUSINESS_SPOTLIGHT" : postType} 
                    onChange={(e) => setPostType(e.target.value)}
                    className="bg-black border border-zinc-800 text-[10px] text-emerald-400 font-bold uppercase p-1 rounded outline-none"
                 >
                    <option value="BUSINESS_SPOTLIGHT">Business Update</option>
                    <option value="LOCAL_OFFER">Local Deal</option>
                 </select>
               )}
            </div>
            <button
              type="submit"
              disabled={isPosting || !newPostContent.trim()}
              className="bg-zinc-900 border border-zinc-700 hover:border-neon-green text-neon-green font-bold uppercase tracking-widest px-6 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2 text-[10px]"
            >
              <Send size={14} />
              {isPosting ? "Transmitting..." : "Broadcast"}
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
            className="bg-zinc-950 border border-zinc-900 rounded p-6 shadow-xl relative overflow-hidden"
          >
            {/* Aesthetic Detail */}
            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 opacity-20" />
            
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-900 pb-4">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center shrink-0">
                {renderPostIcon(post.type)}
              </div>
              <div className="flex-grow">
                <div className="font-bold text-gray-100 flex items-center gap-2 uppercase tracking-tighter">
                  {post.author}
                  {post.role && post.role !== "USER" && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${post.role === "ARTIST" ? 'border-purple-900 text-purple-400' : 'border-emerald-900 text-emerald-400'}`}>
                      {post.role}
                    </span>
                  )}
                  {post.type === "EVENT_UPDATE" && (
                    <span className="text-[8px] bg-blue-900/30 text-blue-400 border border-blue-900/50 px-1.5 py-0.5 rounded uppercase font-black">
                      {post.metadata?.source}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{post.timestamp}</div>
              </div>
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
              {post.content}
            </p>

            {post.type === "EVENT_UPDATE" && post.metadata?.link && (
               <a 
                 href={post.metadata.link} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-block text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest border border-blue-900/30 px-3 py-1 rounded bg-blue-900/10 transition-colors"
               >
                 View on {post.metadata.source} →
               </a>
            )}
          </div>
        );
      })}

      {loading && (
        <div className="py-8 text-center text-zinc-700 uppercase font-black tracking-widest animate-pulse text-xs">
          Scanning Network...
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="py-8 text-center text-zinc-800 uppercase text-[10px] font-black tracking-tighter border-t border-zinc-900">
          --- End of Transmission ---
        </div>
      )}
    </div>
  );
}
