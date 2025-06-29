import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentiMate",
  description: "An emotionally-aware AI chat companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-pink-50 text-gray-900`}>
        <main className="min-h-screen flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
