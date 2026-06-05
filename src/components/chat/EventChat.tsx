"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";
import { io, Socket } from "socket.io-client";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string | null; role: string };
};

export default function EventChat({ eventId }: { eventId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/chat`);
      if (res.ok) {
        const data = await res.json();
        // The API returns messages in descending order (newest first).
        // We want to display oldest at the top, newest at the bottom.
        setMessages(data.reverse());
      }
    } catch (error) {
      console.error("Error fetching chat messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Connect to WebSocket server
    const newSocket = io(window.location.origin, {
      path: "/socket.io/",
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_event_room", eventId);
    });

    newSocket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.emit("leave_event_room", eventId);
      newSocket.disconnect();
    };
  }, [eventId]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/events/${eventId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");

        // Broadcast over WebSocket
        if (socket) {
          // Send the message payload explicitly appending the authorId to pass the server-side IDOR check
          socket.emit("send_message", { ...data.message, eventId, authorId: (session.user as any).id });
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800 p-3 border-b border-gray-700 font-bold uppercase tracking-widest text-xs flex justify-between items-center text-gray-300">
        <span>Live Event Comms</span>
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[250px] max-h-[400px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-purple-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-bold text-purple-400">{msg.author.name || "Unknown"}</span>
                <span className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className="text-gray-200 text-sm bg-black/40 p-2 rounded inline-block w-fit max-w-[90%] break-words">
                {msg.content}
              </p>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm italic">
            No messages yet. Be the first to coordinate the meetup!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-gray-800 border-t border-gray-700">
        {session ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message the network..."
              className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-purple-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded px-4 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div className="text-center text-xs text-gray-400 uppercase tracking-widest py-2">
            Log in to join the discussion.
          </div>
        )}
      </div>
    </div>
  );
}
