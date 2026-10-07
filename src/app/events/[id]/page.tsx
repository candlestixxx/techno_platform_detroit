"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchEventData = async () => {
    try {
      // In a fully built app, we'd have a specific GET /api/events/[id] endpoint.
      // For now, we'll fetch all and filter to simulate it, or rely on the reviews endpoint
      // if it returned event data. Let's just fetch all events and find ours.
      const resEvents = await fetch("/api/events");
      const eventsData = await resEvents.json();
      const currentEvent = eventsData.find((e: any) => e.id === resolvedParams.id);
      setEvent(currentEvent);

      // Fetch Reviews
      const resReviews = await fetch(`/api/events/${resolvedParams.id}/reviews`);
      if (resReviews.ok) {
        const reviewsData = await resReviews.json();
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [resolvedParams.id]);

  const handleSubmitReview = async () => {
    if (!session) {
      alert("You must be logged in to submit a review.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${resolvedParams.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content })
      });

      if (res.ok) {
        setContent("");
        setRating(5);
        fetchEventData(); // Refresh reviews
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-neon-green flex items-center justify-center font-mono">Loading Event Details...</div>;

  if (!event && !loading) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono">Event not found in the database.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <button onClick={() => window.history.back()} className="text-zinc-500 hover:text-white font-mono text-sm mb-6 transition-colors">
          &larr; Back to Navigation
        </button>

        {/* Event Header */}
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold font-mono text-neon-green uppercase tracking-widest mb-2">{event.title}</h1>
          <p className="text-xl text-zinc-300 font-mono mb-4">{event.venue}</p>
          <div className="flex gap-4 mb-6">
            <span className="bg-zinc-900 px-3 py-1 rounded text-sm text-zinc-400 font-mono border border-zinc-700">
               {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="bg-zinc-900 px-3 py-1 rounded text-sm text-zinc-400 font-mono border border-zinc-700 uppercase">
               Source: {event.source}
            </span>
          </div>

          <h3 className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-2">Lineup</h3>
          <p className="text-white leading-relaxed bg-black p-4 rounded border border-zinc-800">{event.lineup || "TBA"}</p>
        </div>

        {/* Reviews Section */}
        <div className="bg-zinc-950 border border-purple-900/50 p-8 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.05)]">
          <h2 className="text-2xl font-bold font-mono text-purple-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2">
            Community Intel & Reviews
          </h2>

          {/* Submission Form */}
          {session ? (
            <div className="mb-10 bg-zinc-900 p-6 rounded border border-purple-900/30">
              <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Submit your assessment</h3>

              <div className="mb-4">
                <label className="block text-zinc-400 text-xs mb-2 font-mono">Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setRating(num)}
                      className={`w-10 h-10 rounded font-bold font-mono transition-colors ${rating >= num ? "bg-purple-600 text-white" : "bg-black text-zinc-500 border border-zinc-800 hover:border-purple-500"}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-zinc-400 text-xs mb-2 font-mono">Field Report (Optional)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="How was the sound system? The crowd?"
                  className="w-full bg-black border border-zinc-800 text-white p-3 rounded focus:outline-none focus:border-purple-500 min-h-[100px]"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="bg-purple-600 text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:bg-purple-500 disabled:opacity-50 transition"
              >
                {submitting ? "Transmitting..." : "Publish Review"}
              </button>
            </div>
          ) : (
            <div className="mb-10 bg-black p-4 rounded border border-zinc-800 text-center">
               <p className="text-zinc-500 font-mono text-sm">You must establish a secure session (Login) to submit intelligence.</p>
            </div>
          )}

          {/* Review List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-zinc-500 italic font-mono text-sm text-center py-8">No reviews transmitted for this sector yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-black border border-zinc-800 p-5 rounded">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-purple-500">
                         <span className="text-xs text-purple-300 font-bold">{rev.author?.name?.charAt(0) || "U"}</span>
                      </div>
                      <span className="font-bold text-zinc-300 uppercase tracking-wider text-sm">{rev.author?.name || "Unknown"}</span>
                    </div>
                    <div className="flex text-purple-500 text-sm tracking-widest">
                       {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </div>
                  </div>
                  {rev.content && (
                    <p className="text-zinc-400 leading-relaxed text-sm bg-zinc-900/50 p-3 rounded">{rev.content}</p>
                  )}
                  <p className="text-[10px] text-zinc-600 font-mono mt-3 text-right">
                    Transmitted: {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}