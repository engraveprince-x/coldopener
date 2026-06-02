export default function FooterSection() {
  const links = ["Features", "Pricing", "FAQ", "Privacy", "Terms"];

  return (
    <footer className="bg-ink text-cream py-12 px-14 text-center">
      <div className="text-[22px] font-light mb-5 tracking-tight">
        ColdOpener
      </div>
      <nav className="flex gap-7 justify-center flex-wrap mb-6">
        {links.map((l) => (
          <a
            key={l}
            href="#"
            className="text-[#888] text-xs no-underline transition-colors hover:text-cream"
          >
            {l}
          </a>
        ))}
      </nav>
      <p className="text-[10px] text-[#666]">
        &copy; {new Date().getFullYear()} ColdOpener. All rights reserved.
      </p>
    </footer>
  );
}
