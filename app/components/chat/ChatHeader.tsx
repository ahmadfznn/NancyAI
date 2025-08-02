import React from "react";

interface ChatHeaderProps {
  title?: string;
  statuses?: string[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "Fancy AI",
  statuses = ["Neural Link Active", "Quantum Processing", "Encryption Secure"],
}) => {
  return (
    <div
      className={`p-4 bg-gradient-to-r from-pink-500/10 via-black/80 to-pink-300/10 backdrop-blur-xs border-b border-pink-500/30 transition-all duration-300`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"
        style={{ animation: "headerGlow 3s ease-in-out infinite" }}
      />
      <div className="text-center relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-72 h-16 border border-pink-500/30 rounded-lg bg-gradient-to-r from-pink-500/5 to-pink-300/5 animate-pulse" />
        <div className="relative flex flex-col items-center">
          <h1
            className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-pink-500 to-pink-300 bg-clip-text text-transparent font-['Orbitron',monospace] tracking-wider"
            style={{
              textShadow: "0 0 30px rgba(255, 20, 147, 0.5)",
              animation: "titlePulse 4s ease-in-out infinite",
            }}
          >
            {title}
          </h1>
          {/* Refleksi */}
          <h1 className="mt-1 text-3xl lg:text-4xl font-bold bg-gradient-to-b from-white/30 to-transparent bg-clip-text text-transparent font-['Orbitron',monospace] tracking-wider opacity-30 scale-y-[-1] blur-sm pointer-events-none select-none">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex justify-center items-center gap-6">
        {statuses.map((status, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wide"
          >
            <div
              className="w-1.5 h-1.5 bg-pink-500 rounded-full shadow-[0_0_8px_#FF1493]"
              style={{ animation: "statusPulse 2s ease-in-out infinite" }}
            />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHeader;
