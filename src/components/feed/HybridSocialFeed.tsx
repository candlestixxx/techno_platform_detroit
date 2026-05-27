"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Music, MapPin, Building2, Store } from "lucide-react";

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

// Mock API Call
const fetchFeedPage = async (page: number): Promise<Post[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPosts: Post[] = [
        {
          id: `artist-${page}`,
          type: "ARTIST_POST",
          author: "DJ Minx",
          timestamp: "2 hours ago",
          content: "Just dropped a new mix on SoundCloud. Check it out!",
          metadata: {
            embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789",
          },
        },
        {
          id: `event-${page}`,
          type: "EVENT_UPDATE",
          author: "RA.co",
          timestamp: "4 hours ago",
          content: "Just Announced: TV Lounge Weekend Lineup.",
          metadata: { venue: "TV Lounge", source: "Resident Advisor" },
        },
        {
          id: `business-${page}`,
          type: "BUSINESS_SPOTLIGHT",
          author: "Spot Lite Detroit",
          timestamp: "1 day ago",
          content: "Come grab a coffee and browse some records. 15% off if you show this post today!",
          metadata: { offerCode: "UNDERGROUND15" },
        },
      ];
      resolve(newPosts);
    }, 800);
  });
};

export default function HybridSocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
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
    fetchFeedPage(page).then((newPosts) => {
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(page < 5); // Stop after 5 pages for mock
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
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
