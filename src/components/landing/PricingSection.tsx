export default function PricingSection() {
  const features = [
    "Unlimited email generation",
    "Deep AI personalization",
    "LinkedIn profile research",
    "Email history & search",
    "Copy with one click",
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6">
      <span className="sec-label">/ PRICING</span>
      <h2 className="section-h2">
        Simple and
        <br />
        transparent
      </h2>
      <div className="border-2 border-ink rounded-[20px] p-10 text-center max-w-[380px] w-full mt-9 bg-white">
        <span className="text-[52px] font-light tracking-[-3px]">
          $29<small className="text-[15px] text-ink-muted font-normal">&thinsp;/month</small>
        </span>
        <p className="text-xs text-ink-muted mt-1">
          7-day free trial. No credit card required.
        </p>
        <ul className="text-left my-6 list-none">
          {features.map((f) => (
            <li
              key={f}
              className="py-2 text-[13px] text-[#666] border-b border-hairline before:content-['→'] before:font-bold before:text-warm before:mr-2"
            >
              {f}
            </li>
          ))}
        </ul>
        <a href="/signup" className="btn-primary w-full text-center block">
          Start free trial
        </a>
      </div>
    </section>
  );
}
