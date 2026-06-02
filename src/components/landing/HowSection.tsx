export default function HowSection() {
  const steps = [
    {
      num: "1",
      title: "Paste a LinkedIn URL",
      desc: "Any public profile. AI starts researching immediately.",
    },
    {
      num: "2",
      title: "AI analyzes & writes",
      desc: "Deep personalization from real data. No templates, no filler.",
    },
    {
      num: "3",
      title: "Send & convert",
      desc: "Copy, paste, send. Reply rates 3.2× higher than generic outreach.",
    },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6">
      <span className="sec-label">/ PROCESS</span>
      <h2 className="section-h2">
        Three seconds
        <br />
        from URL to inbox
      </h2>
      <div className="w-[60px] h-px bg-hairline my-6" />
      <div className="flex gap-14 max-w-[820px] flex-wrap justify-center mt-11">
        {steps.map((s) => (
          <div
            key={s.num}
            className="flex-1 min-w-[180px] max-w-[230px] text-center"
          >
            <span className="text-[60px] font-light tracking-[-5px] text-hairline leading-none">
              {s.num}
            </span>
            <h4 className="text-[15px] font-bold mt-2.5 mb-1.5 tracking-tight">
              {s.title}
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
