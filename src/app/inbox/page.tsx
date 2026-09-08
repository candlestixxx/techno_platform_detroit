"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/dm");
      if (!res.ok) throw new Error("Failed to load inbox.");
      const data = await res.json();
      setConversations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchConversations();
    else if (status === "unauthenticated") {
      setError("Please sign in to access your inbox.");
      setLoading(false);
    }
  }, [status]);

  const loadConversation = async (conv: any) => {
    setActiveConversation(conv);
    const targetUserId = getOtherUser(conv).id;
    try {
      const res = await fetch(`/api/dm?targetUserId=${targetUserId}`);
      if (!res.ok) throw new Error("Failed to load messages.");
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const targetUserId = getOtherUser(activeConversation).id;
    const optimisticMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: (session?.user as any)?.id,
      sender: { name: session?.user?.name },
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    scrollToBottom();

    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, content: optimisticMessage.content }),
      });
      if (!res.ok) throw new Error("Failed to send message.");

      // Optionally reload to ensure true state, but optimistic is fine for now
      fetchConversations();
    } catch (err) {
      console.error(err);
      alert("Failed to send message. Please try again.");
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };

  const getOtherUser = (conv: any) => {
    const userId = (session?.user as any)?.id;
    return conv.user1Id === userId ? conv.user2 : conv.user1;
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-neon-green font-mono">Loading Inbox...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono font-bold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold font-mono text-neon-green uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4 w-full max-w-6xl">
        Private Comm Link
      </h1>

      <div className="w-full max-w-6xl flex flex-col md:flex-row h-[70vh] border border-zinc-800 rounded shadow-[0_0_15px_rgba(57,255,20,0.1)] overflow-hidden">
        {/* Sidebar - Conversations */}
        <div className="w-full md:w-1/3 bg-zinc-950 border-r border-zinc-800 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-zinc-500 font-mono text-sm italic">No active connections.</p>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const isActive = activeConversation?.id === conv.id;
              const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[0].content : "No messages yet.";
              return (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv)}
                  className={`p-4 border-b border-zinc-900 cursor-pointer transition-colors ${isActive ? "bg-zinc-900 border-l-4 border-l-neon-green" : "hover:bg-zinc-900"}`}
                >
                  <p className="font-bold text-sm text-zinc-200 uppercase tracking-wide">{otherUser?.name || "Unknown Identity"}</p>
                  <p className="text-xs text-zinc-500 truncate mt-1 font-mono">{lastMessage}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Main Chat Area */}
        <div className="w-full md:w-2/3 bg-black flex flex-col h-full">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-zinc-950 p-4 border-b border-zinc-800">
                <p className="font-bold text-neon-green uppercase tracking-widest text-sm">
                  Uplink Established: {getOtherUser(activeConversation)?.name}
                </p>
              </div>

              {/* Chat History */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId === (session?.user as any)?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? "bg-neon-green text-black rounded-br-none" : "bg-zinc-900 text-white border border-zinc-800 rounded-bl-none"}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-mono mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Transmit message..."
                  className="flex-1 bg-black border border-zinc-700 text-white p-2 rounded focus:outline-none focus:border-neon-green font-mono text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-neon-green text-black px-6 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-green-400 disabled:opacity-50 transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono text-sm uppercase tracking-widest">
              Select a transmission channel
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
