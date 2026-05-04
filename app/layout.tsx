import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://researchforge.app"),
  title: {
    default: "ResearchForge",
    template: "%s | ResearchForge",
  },
  description:
    "ResearchForge is an AI PDF research assistant for students to upload papers, ask questions, get simple explanations, generate summaries, create notes, and find citations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
