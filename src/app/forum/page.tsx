"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HeaderAuth from "@/components/layout/HeaderAuth";
import { MessageSquare, Send } from "lucide-react";

type ForumTopic = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { name: string | null; role: string };
  _count: { replies: number };
};

export default function ForumPage() {
  const { data: session } = useSession();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetch("/api/forum")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopics(data);
        }
        setLoading(false);
      });
  }, []);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsPosting(true);
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setTopics([data.topic, ...topics]);
        setNewTitle("");
        setNewContent("");
      }
    } catch (error) {
      console.error("Failed to create topic", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 flex flex-col">
      <header className="mb-12 border-b border-gray-800 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">
            Detroit <span className="text-gray-500">Underground</span> Forum
          </h1>
          <p className="text-xl text-gray-400 font-medium mb-4">
            Discuss events, releases, and local news.
          </p>
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300">
            ← Back to Hub
          </Link>
        </div>
        <HeaderAuth />
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-8">
        {session && session.user && (
          <form onSubmit={handleCreateTopic} className="bg-gray-900 border border-purple-900/50 p-6 rounded shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white">Start a Discussion</h2>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Topic Title"
              className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none transition-colors"
              required
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-purple-500 outline-none resize-none h-32 transition-colors"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPosting || !newTitle.trim() || !newContent.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest px-6 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <Send size={16} />
                {isPosting ? "Posting..." : "Post Topic"}
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-gray-500 py-12 font-bold uppercase tracking-widest animate-pulse">
              Loading Discussions...
            </div>
          ) : topics.length > 0 ? (
            topics.map((topic) => (
              <div key={topic.id} className="bg-gray-900 border border-gray-800 p-6 rounded group hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MessageSquare size={14} />
                    <span>{topic._count.replies}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{topic.content}</p>
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-400">{topic.author.name || "Unknown"}</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded">{topic.author.role}</span>
                  </div>
                  <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 italic py-12">No topics found. Start the conversation!</div>
          )}
        </div>
      </div>
    </div>
  );
}
