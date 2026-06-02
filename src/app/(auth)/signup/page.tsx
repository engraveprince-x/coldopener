"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      // Sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="text-ink-muted text-sm hover:text-ink transition-colors">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight mt-4">Create your account</h1>
        <p className="text-sm text-ink-muted mt-2">
          Start your 7-day free trial. No credit card.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold tracking-wide text-ink-muted mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-hairline rounded-xl text-sm outline-none bg-white transition-colors focus:border-ink"
            placeholder="Your name"
          />
        </div>
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
            minLength={8}
            className="w-full px-4 py-3 border border-hairline rounded-xl text-sm outline-none bg-white transition-colors focus:border-ink"
            placeholder="Min. 8 characters"
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
          {loading ? "Creating account..." : "Start free trial"}
        </button>
      </form>

      <p className="text-xs text-ink-muted text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-ink font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
