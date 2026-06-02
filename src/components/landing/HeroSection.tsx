"use client";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6 relative">
      <h1 className="text-[clamp(48px,9vw,104px)] font-extrabold tracking-tightest leading-tightest text-ink max-w-[860px]">
        Cold emails<br />that feel<br />human
      </h1>
      <p className="text-lg font-normal leading-relaxed text-ink-muted max-w-[500px] mt-6">
        Paste a LinkedIn URL. Our AI researches your prospect and writes a
        message so personal, they&apos;ll forget it was generated.
      </p>
      <div className="mt-10 flex gap-3.5 flex-wrap">
        <a href="/signup" className="btn-primary">
          Start free trial
        </a>
        <a href="#demo" className="btn-ghost">
          Watch demo
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[9px] font-semibold tracking-[5px] uppercase text-ink-muted">
          Scroll
        </span>
        <div className="w-px h-8 bg-hairline" />
      </div>
    </section>
  );
}
