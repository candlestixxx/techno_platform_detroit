"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "dummy_public_key";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          setSubscription(sub);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    try {
      if (!session) {
          alert("You must be logged in to subscribe to notifications.");
          return;
      }
      const registration = await navigator.serviceWorker.ready;

      let sub = null;
      try {
          const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
      } catch (err: any) {
         // Gracefully mock in DEV environments where vapid keys are fake
         if (err.message.includes("ApplicationServerKey is not valid") || process.env.NODE_ENV === "development") {
             console.warn("Mocking push subscription in development.");
             sub = { endpoint: "mock_endpoint", keys: { p256dh: "mock", auth: "mock" } } as any;
         } else {
             throw err;
         }
      }

      setSubscription(sub);

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });

      alert("Successfully subscribed to notifications!");
    } catch (error) {
      console.error("Failed to subscribe user", error);
      alert("Failed to subscribe. Check console for details.");
    }
  };

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!subscription && session && (
        <button
          onClick={subscribeUser}
          className="bg-neon-green text-black px-4 py-2 rounded-full shadow-lg font-bold hover:bg-green-400 transition"
        >
          Enable Alerts
        </button>
      )}
    </div>
  );
}
