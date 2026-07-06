"use client";

import type { UserProfile } from "@fittrack/shared-types";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const fallbackUser: Pick<UserProfile, "email" | "full_name"> = {
  email: "demo@fittrack.dev",
  full_name: "Demo Athlete"
};

export function AccountMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(fallbackUser);

  useEffect(() => {
    const token = localStorage.getItem("fittrack_token");
    fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((response) => (response.ok ? response.json() : fallbackUser))
      .then((profile: UserProfile) => {
        setUser({
          email: profile.email ?? fallbackUser.email,
          full_name: profile.full_name ?? fallbackUser.full_name
        });
      })
      .catch(() => setUser(fallbackUser));
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function logout() {
    localStorage.removeItem("fittrack_token");
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-11 items-center gap-2 rounded-lg border border-ink/10 bg-white/75 px-2 pr-3 text-left shadow-sm transition hover:bg-white"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-mint text-sm font-bold text-white">
          {initials(user.full_name)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-ink">
            {user.full_name}
          </span>
          <span className="block max-w-36 truncate text-xs text-ink/55">{user.email}</span>
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-ink/10 bg-white p-2 shadow-soft"
          role="menu"
        >
          <div className="border-b border-ink/10 px-2 py-2">
            <p className="truncate text-sm font-semibold">{user.full_name}</p>
            <p className="truncate text-xs text-ink/55">{user.email}</p>
          </div>
          <Link
            className="mt-2 flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink/75 hover:bg-panel"
            href="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <User size={16} />
            Profile
          </Link>
          <Link
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink/75 hover:bg-panel"
            href="/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Settings size={16} />
            Settings
          </Link>
          <button
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-coral hover:bg-coral/10"
            onClick={logout}
            role="menuitem"
            type="button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
