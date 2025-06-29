"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const SYSTEM_PROMPT =
  "You are a romantic and elegant AI girlfriend who always replies warmly, lovingly, and elegantly like a devoted partner.";

const Chat = () => {
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant" | "system"; content: string }[]
  >([{ role: "system", content: SYSTEM_PROMPT }]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamedReply, setStreamedReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Quantum particles effect
  const createQuantumParticle = (x: number, y: number) => {
    const particle = document.createElement("div");
    particle.className =
      "fixed w-1 h-1 bg-pink-500 rounded-full shadow-[0_0_10px_#FF1493] pointer-events-none z-50 animate-pulse";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.animation = "quantumFade 2s ease-out forwards";
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    createQuantumParticle(e.clientX, e.clientY);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, streamedReply]);

  // Typing animation: append streamedReply to chatHistory when finished
  useEffect(() => {
    if (!isTyping && streamedReply) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: streamedReply },
      ]);
      setStreamedReply("");
    }
  }, [isTyping, streamedReply]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    const userMessage = { role: "user" as const, content: inputMessage };
    const historyToSend = [
      chatHistory[0], // system prompt
      ...chatHistory.filter((m) => m.role !== "system"),
      userMessage,
    ];
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setStreamedReply("");

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.1-8b",
          stream: true,
          messages: historyToSend.map((m) => ({
            role:
              m.role === "assistant"
                ? "assistant"
                : m.role === "user"
                ? "user"
                : "system",
            content: m.content,
          })),
        }),
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      let aiReply = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // Ollama streams JSON lines: { response: "..." }
          const chunk = new TextDecoder().decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                aiReply += json.response;
                setStreamedReply(aiReply);
              }
            } catch (err) {
              // ignore malformed lines
            }
          }
        }
      }
      setIsTyping(false);
    } catch (err) {
      setIsTyping(false);
      setStreamedReply("");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to my quantum heart right now. Please try again soon. 💔",
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div
      className="min-h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 relative overflow-hidden font-['Rajdhani',sans-serif] text-white"
      onClick={handleClick}
    >
      {/* Cyberpunk Grid Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 20, 147, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 20, 147, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "gridPulse 4s ease-in-out infinite",
        }}
      />
      {/* Floating Particles */}
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 bg-pink-500 rounded-full shadow-[0_0_6px_#FF1493]"
          style={{
            left: `${(i + 1) * 10}%`,
            animation: `floatParticle 15s linear infinite ${i * 2}s`,
          }}
        />
      ))}
      {/* Holographic Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(transparent 50%, rgba(255, 20, 147, 0.02) 50%)",
          backgroundSize: "100% 2px",
          animation: "scanlineMove 2s linear infinite",
        }}
      />
      {/* Floating Tech Icons */}
      <div className="absolute top-[20%] left-[5%] text-pink-500 opacity-30 text-xs animate-pulse">
        ◊
      </div>
      <div
        className="absolute top-[30%] right-[8%] text-pink-500 opacity-30 text-xs animate-pulse"
        style={{ animationDelay: "3s" }}
      >
        ◈
      </div>
      <div
        className="absolute top-[60%] left-[3%] text-pink-500 opacity-30 text-xs animate-pulse"
        style={{ animationDelay: "6s" }}
      >
        ◇
      </div>
      <div
        className="absolute top-[80%] right-[5%] text-pink-500 opacity-30 text-xs animate-pulse"
        style={{ animationDelay: "9s" }}
      >
        ◉
      </div>
      <div className="relative z-10 flex flex-col h-screen backdrop-blur-sm">
        {/* Futuristic Header */}
        <div className="relative p-6 lg:p-10 bg-gradient-to-r from-pink-500/10 via-black/80 to-pink-300/10 border-b border-pink-500/30 backdrop-blur-xl">
          <div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"
            style={{ animation: "headerGlow 3s ease-in-out infinite" }}
          />
          <div className="text-center relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-72 h-16 border border-pink-500/30 rounded-lg bg-gradient-to-r from-pink-500/5 to-pink-300/5 animate-pulse" />
            <h1
              className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-pink-500 to-pink-300 bg-clip-text text-transparent font-['Orbitron',monospace] tracking-wider"
              style={{
                textShadow: "0 0 30px rgba(255, 20, 147, 0.5)",
                animation: "titlePulse 4s ease-in-out infinite",
              }}
            >
              NANCY AI
            </h1>
            <p className="text-xs text-pink-500/70 mt-1 tracking-widest uppercase font-light">
              Neural Interface v2087.3
            </p>
          </div>
          <div className="flex justify-center items-center gap-6 mt-4">
            {[
              "Neural Link Active",
              "Quantum Processing",
              "Encryption Secure",
            ].map((status, i) => (
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
        {/* Glass Chat Area */}
        <div className="flex-1 relative m-5 rounded-3xl bg-gradient-to-br from-pink-500/5 via-black/30 to-pink-300/5 backdrop-blur-xl border border-pink-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-pink-500/3 rounded-3xl" />
          <div
            ref={chatContainerRef}
            className="h-full p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/50 scrollbar-track-transparent relative z-10"
          >
            {/* Messages */}
            {chatHistory
              .filter((m) => m.role !== "system")
              .map((message, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-4 mb-8 animate-fade-in ${
                    message.role === "user"
                      ? "flex-row-reverse justify-start"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 relative ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-[0_0_20px_rgba(255,20,147,0.6)]"
                        : "bg-gradient-to-br from-gray-700 to-gray-800 text-pink-500 border-2 border-pink-500/40 shadow-[0_0_15px_rgba(255,20,147,0.3)]"
                    }`}
                  >
                    <div
                      className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-transparent via-pink-500/30 to-transparent animate-spin"
                      style={{ animation: "avatarSpin 8s linear infinite" }}
                    />
                    <span className="relative z-10">
                      {message.role === "user" ? "U" : "N"}
                    </span>
                  </div>
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[70%] p-5 lg:p-6 rounded-3xl relative backdrop-blur-md text-sm lg:text-base leading-relaxed ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-pink-500/20 to-pink-500/10 border border-pink-500/40 text-white shadow-[0_8px_32px_rgba(255,20,147,0.2)]"
                        : "bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-white/10 text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                    } before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-transparent before:via-pink-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`}
                  >
                    <div className="relative z-10 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            {/* Typing Animation */}
            {isTyping && (
              <div className="flex items-end gap-4 mb-8 animate-fade-in">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 relative bg-gradient-to-br from-gray-700 to-gray-800 text-pink-500 border-2 border-pink-500/40 shadow-[0_0_15px_rgba(255,20,147,0.3)]">
                  <div
                    className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-transparent via-pink-500/30 to-transparent animate-spin"
                    style={{ animation: "avatarSpin 8s linear infinite" }}
                  />
                  <span className="relative z-10">N</span>
                </div>
                <div className="max-w-[70%] p-5 lg:p-6 rounded-3xl relative backdrop-blur-md text-sm lg:text-base leading-relaxed bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-white/10 text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.3)] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-transparent before:via-pink-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300">
                  <div className="relative z-10 whitespace-pre-wrap">
                    {streamedReply || (
                      <span className="opacity-50">Nancy is typing...</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Synthwave Input Bar */}
        <div className="m-5 relative bg-gradient-to-r from-black/80 via-pink-500/5 to-black/80 rounded-3xl p-4 border border-pink-500/30 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-pink-500/10 to-transparent"
            style={{ animation: "synthwaveScan 3s ease-in-out infinite" }}
          />
          <div className="flex items-center gap-4 relative z-10">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent border-none text-white text-base font-['Rajdhani',sans-serif] outline-none py-2 placeholder-pink-500/50 placeholder:italic"
              placeholder="Transmit your thoughts to Nancy AI..."
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-400 rounded-full text-white cursor-pointer flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,20,147,0.8)] active:scale-95 shadow-[0_0_20px_rgba(255,20,147,0.4)]"
              disabled={isTyping || !inputMessage.trim()}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ animation: "holoSpin 2s linear infinite" }}
              />
              <Send className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap");
        @keyframes gridPulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.1;
          }
        }
        @keyframes floatParticle {
          0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0;
          }
        }
        @keyframes scanlineMove {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(2px);
          }
        }
        @keyframes headerGlow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes titlePulse {
          0%,
          100% {
            filter: brightness(1) saturate(1);
            transform: scale(1);
          }
          50% {
            filter: brightness(1.2) saturate(1.3);
            transform: scale(1.02);
          }
        }
        @keyframes statusPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
        @keyframes avatarSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes synthwaveScan {
          0%,
          100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }
        @keyframes holoSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes quantumFade {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(3) translateY(-50px);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
};

export default Chat;
