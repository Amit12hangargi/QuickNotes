import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickNotes App",
  description: "A fast, modern note-taking app built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>QuickNotes App</title>
        <meta name="description" content="A fast, modern note-taking app built with Next.js and Supabase" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} theme-light`}>
        <main role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
