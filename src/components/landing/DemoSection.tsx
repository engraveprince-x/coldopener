"use client";

import { useState } from "react";

export default function DemoSection() {
  const [url, setUrl] = useState("");

  const hasContent = url.trim().length > 5;

  return (
    <section id="demo" className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6">
      <span className="sec-label">/ TRY IT</span>
      <h2 className="section-h2">
        See ColdOpener
        <br />
        in action
      </h2>
      <div className="max-w-[540px] w-full bg-white rounded-[20px] p-7 shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_32px_rgba(0,0,0,.04)] mt-9 border border-hairline">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g. Sarah Chen, VP Engineering at Notion..."
          className="w-full py-[15px] px-[18px] border border-hairline rounded-xl text-sm font-mono outline-none bg-cream transition-colors focus:border-ink"
        />
        <button className="w-full py-[15px] bg-ink text-cream rounded-xl text-sm font-semibold mt-2.5 transition-transform active:scale-[.98]">
          Generate &rarr;
        </button>
        <div className="mt-3.5 p-[18px] bg-cream rounded-xl text-[13px] leading-[1.9] text-ink-muted min-h-[50px] border border-hairline">
          {hasContent ? (
            <>
              <div className="text-[8px] font-semibold tracking-[3px] text-warm uppercase mb-2.5 pb-2 border-b border-hairline">
                Generated Email
              </div>
              <div className="text-[10px] text-[#B0ADA5] mb-2">
                Subject: <span className="text-[#555]">Quick thought on your recent work</span>
              </div>
              <p className="leading-[1.9]">
                Hi <b className="text-ink">[Name]</b>,
                <br />
                <br />
                Your recent piece on <b className="text-ink">[Topic]</b> was
                genuinely refreshing. Most miss the connection between{" "}
                <b className="text-ink">[Insight A]</b> and{" "}
                <b className="text-ink">[Insight B]</b>.
                <br />
                <br />
                Open to a brief chat? I&apos;d love to swap notes.
                <br />
                <br />
                <span className="text-[#B0ADA5]">Best,</span>
                <br />
                <b className="text-ink">[Your Name]</b>
              </p>
              <div className="mt-3 pt-2 border-t border-hairline text-[8px] tracking-[1px] text-warm">
                Generated in real-time &middot; 100% unique
              </div>
            </>
          ) : (
            "Your personalized cold email will appear here"
          )}
        </div>
      </div>
    </section>
  );
}
