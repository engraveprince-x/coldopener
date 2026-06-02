import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ColdOpener — AI Cold Emails That Feel Human",
  description:
    "Paste a LinkedIn URL. Our AI researches your prospect and writes a message so personal, they'll forget it was generated.",
  openGraph: {
    title: "ColdOpener — AI Cold Emails That Feel Human",
    description:
      "Paste a LinkedIn URL. AI researches and writes deeply personalized cold emails in seconds.",
    siteName: "ColdOpener",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-cream text-ink`}>
        {children}
      </body>
    </html>
  );
}
