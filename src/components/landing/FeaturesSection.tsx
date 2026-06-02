export default function FeaturesSection() {
  const features = [
    {
      n: "01",
      title: "Deep Research",
      desc: "AI scans LinkedIn, Twitter, blogs — building a real picture of who your prospect is and what they care about.",
    },
    {
      n: "02",
      title: "One-Click",
      desc: "Paste a URL, hit generate. No forms, no templates, no complexity. Just a perfectly tailored email in seconds.",
    },
    {
      n: "03",
      title: "Human Tone",
      desc: "Every email reads like a thoughtful colleague wrote it. Never robotic, never generic, never templated.",
    },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6">
      <span className="sec-label">/ CAPABILITIES</span>
      <h2 className="section-h2">
        Everything you need
        <br />
        to open any conversation
      </h2>
      <div className="w-[60px] h-px bg-hairline my-6" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 max-w-[920px] w-full mt-11">
        {features.map((f) => (
          <div
            key={f.n}
            className="bg-cream-dark rounded-2xl p-8 transition-colors hover:bg-[#EFEEEA]"
          >
            <span className="text-[10px] font-bold tracking-[4px] text-warm mb-3 block">
              {f.n}
            </span>
            <h4 className="text-lg font-bold mb-2 tracking-tight">{f.title}</h4>
            <p className="text-[13px] leading-relaxed text-ink-muted">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
