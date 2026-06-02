"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    subject: string;
    body: string;
    recipientName: string;
    recipientCompany: string;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!description.trim()) return;
    setError("");
    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate email");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    const text = `Subject: ${result.subject}\n\n${result.body}`;
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="max-w-[600px]">
      <h1 className="text-3xl font-extrabold tracking-tight mb-1">
        Generate email
      </h1>
      <p className="text-sm text-ink-muted mb-6">
        Describe your prospect — name, role, company, anything that helps
        personalize the email.
      </p>

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="e.g. Sarah Chen, VP Engineering at Notion, writes about systems design"
          className="flex-1 px-4 py-3 border border-hairline rounded-xl text-sm outline-none bg-white transition-colors focus:border-ink"
        />
        <button
          onClick={handleGenerate}
          disabled={generating || !description.trim()}
          className="px-6 py-3 bg-ink text-cream rounded-xl text-sm font-semibold transition-transform active:scale-[.98] disabled:opacity-40 shrink-0"
        >
          {generating ? "Writing..." : "Generate"}
        </button>
      </div>

      {/* Loading state */}
      {generating && (
        <div className="bg-white rounded-2xl p-6 border border-hairline animate-pulse">
          <div className="h-3 bg-cream-dark rounded w-1/3 mb-3" />
          <div className="h-3 bg-cream-dark rounded w-2/3 mb-2" />
          <div className="h-3 bg-cream-dark rounded w-full mb-2" />
          <div className="h-3 bg-cream-dark rounded w-4/5" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !generating && (
        <div className="bg-white rounded-2xl p-6 border border-hairline shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
            <div>
              <div className="text-xs text-warm font-semibold tracking-wide mb-0.5">
                Generated Email
              </div>
              <div className="text-sm text-ink-muted">
                To:{" "}
                <span className="text-ink font-semibold">
                  {result.recipientName}
                </span>
                {result.recipientCompany && (
                  <>
                    {" "}
                    at{" "}
                    <span className="text-ink font-semibold">
                      {result.recipientCompany}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-cream-dark border border-hairline rounded-lg text-xs font-semibold hover:bg-hairline transition-colors"
            >
              Copy
            </button>
          </div>

          <div className="text-xs font-semibold text-ink-muted mb-2">
            Subject: <span className="text-ink">{result.subject}</span>
          </div>

          <div className="text-sm leading-relaxed text-ink whitespace-pre-wrap">
            {result.body}
          </div>

          <div className="mt-4 pt-3 border-t border-hairline flex gap-2">
            <button
              onClick={handleGenerate}
              className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !generating && !error && (
        <div className="text-center py-20">
          <p className="text-ink-muted text-sm">
            Describe a prospect above to generate your first cold email.
          </p>
        </div>
      )}
    </div>
  );
}
