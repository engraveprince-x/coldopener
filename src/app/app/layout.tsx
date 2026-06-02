import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-ink hover:opacity-70 transition-opacity"
          >
            ColdOpener
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/app"
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/app/history"
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              History
            </Link>
            <Link
              href="/api/auth/signout"
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Sign out
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
