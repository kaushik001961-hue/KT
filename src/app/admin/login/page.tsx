"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@krupalitraders.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background)] px-5 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,85,160,0.14),transparent_55%)]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-black text-white shadow-xl shadow-blue-600/20">
            KT
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--foreground)]">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-[var(--foreground)]/60">
            Krupali Traders Private Limited
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)]/90 p-7 shadow-2xl shadow-blue-900/10 backdrop-blur-xl sm:p-9"
        >
          <div>
            <label className="text-sm font-semibold text-[var(--foreground)]">
              Email
            </label>

            <div className="relative mt-2">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="h-13 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-12 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="admin@krupalitraders.com"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-[var(--foreground)]">
              Password
            </label>

            <div className="relative mt-2">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="h-13 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] pl-12 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}