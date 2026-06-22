"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<NotificationPermission | "unsupported">(
    "unsupported"
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    if ("Notification" in window) {
      setNotifications(Notification.permission);
    }
  }, []);

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setNotifications("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifications(permission);
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-panel/90 p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">PWA notifications</h2>
          <p className="text-sm text-ink/65">Browser permission: {notifications}</p>
        </div>
        <Bell className="text-lemon" size={24} />
      </div>
      <button
        className="w-full rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white"
        onClick={requestNotifications}
        type="button"
      >
        Enable reminders
      </button>
    </section>
  );
}
