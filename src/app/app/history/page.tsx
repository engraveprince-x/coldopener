"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Generation {
  id: string;
  recipientName: string | null;
  recipientCompany: string | null;
  emailSubject: string | null;
  emailBody: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/generations")
      .then((res) => res.json())
      .then((data) => {
        setGenerations(data.generations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCopy(gen: Generation) {
    const text = `Subject: ${gen.emailSubject || ""}\n\n${gen.emailBody}`;
    await navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="max-w-[700px]">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">History</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-hairline animate-pulse"
            >
              <div className="h-3 bg-cream-dark rounded w-1/4 mb-2" />
              <div className="h-3 bg-cream-dark rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[700px]">
      <h1 className="text-3xl font-extrabold tracking-tight mb-1">History</h1>
      <p className="text-sm text-ink-muted mb-6">Your past email generations.</p>

      {generations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-muted text-sm">
            No emails generated yet.{" "}
            <Link href="/app" className="text-ink font-semibold hover:underline">
              Generate your first
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="bg-white rounded-xl border border-hairline overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === gen.id ? null : gen.id)
                }
                className="w-full p-5 text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {gen.recipientName || "Unknown recipient"}
                    {gen.recipientCompany && (
                      <span className="text-ink-muted font-normal">
                        {" "}
                        at {gen.recipientCompany}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    {new Date(gen.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" — "}
                    {gen.emailSubject || "No subject"}
                  </div>
                </div>
                <span className="text-xs text-ink-muted">
                  {expandedId === gen.id ? "▲" : "▼"}
                </span>
              </button>

              {expandedId === gen.id && (
                <div className="px-5 pb-5 border-t border-hairline pt-4">
                  <div className="text-xs font-semibold text-ink-muted mb-1">
                    Subject:{" "}
                    <span className="text-ink">
                      {gen.emailSubject || "No subject"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap mb-3">
                    {gen.emailBody}
                  </p>
                  <button
                    onClick={() => handleCopy(gen)}
                    className="px-4 py-2 bg-cream-dark border border-hairline rounded-lg text-xs font-semibold hover:bg-hairline transition-colors"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
