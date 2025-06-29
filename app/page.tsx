'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center max-w-xl">
      <h1 className="text-4xl font-bold mb-4 text-pink-700">Welcome to SentiMate 🫶</h1>
      <p className="text-lg text-gray-700 mb-6">
        Your emotionally intelligent AI chat companion. Designed to feel, respond, and vibe with your mood.
      </p>
      <Link href="/chat">
        <button className="bg-pink-600 text-white px-6 py-3 rounded-2xl hover:bg-pink-700 transition">
          Start Chatting 💌
        </button>
      </Link>
    </div>
  );
}
