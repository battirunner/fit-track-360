"use client";

import { Dumbbell, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { postJson } from "@/lib/api";

type AuthResponse = {
  access_token: string;
  token_type: string;
};

type Props = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("demo@fittrack.dev");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await postJson<AuthResponse, Record<string, string>>(
        isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register",
        isLogin ? { email, password } : { email, password, full_name: fullName }
      );
      localStorage.setItem("fittrack_token", response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-panel/95 p-5 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg bg-mint text-white">
            <Dumbbell size={22} />
          </div>
          <div>
            <p className="text-xl font-bold">FitTrack</p>
            <p className="text-sm text-ink/65">{isLogin ? "Sign in" : "Create your account"}</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {!isLogin && (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-steel">Full name</span>
              <input
                className="w-full rounded-md border border-ink/15 bg-white/80 px-3 py-2 outline-none focus:border-mint"
                onChange={(event) => setFullName(event.target.value)}
                required
                value={fullName}
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-steel">Email</span>
            <input
              className="w-full rounded-md border border-ink/15 bg-white/80 px-3 py-2 outline-none focus:border-mint"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-steel">Password</span>
            <input
              className="w-full rounded-md border border-ink/15 bg-white/80 px-3 py-2 outline-none focus:border-mint"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error && <p className="rounded-md bg-coral/10 px-3 py-2 text-sm font-medium text-coral">{error}</p>}

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {isLogin ? <LogIn size={17} /> : <UserPlus size={17} />}
            {loading ? "Please wait" : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/65">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <Link className="font-semibold text-mint" href={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Login"}
          </Link>
        </p>
      </section>
    </main>
  );
}
