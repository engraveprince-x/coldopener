"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/app");
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-ink-muted text-sm hover:text-ink transition-colors">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4">Welcome back</h1>
        <p className="text-sm text-ink-muted mt-2">
          Log in to your ColdOpener account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold tracking-wide text-ink-muted mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-hairline rounded-xl text-sm outline-none bg-white transition-colors focus:border-ink"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-ink-muted mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-hairline rounded-xl text-sm outline-none bg-white transition-colors focus:border-ink"
            placeholder="Your password"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-ink text-cream rounded-xl text-sm font-semibold transition-transform active:scale-[.98] disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/app" })}
          className="w-full py-3.5 bg-white border border-hairline rounded-xl text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-xs text-ink-muted text-center mt-6">
        No account?{" "}
        <Link href="/signup" className="text-ink font-semibold hover:underline">
          Start free trial
        </Link>
      </p>
    </>
  );
}
