"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Menu,
  X,
  MessageSquare,
  User,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth } from "../../../lib/firebase";
import { useParams } from "next/navigation";

const SYSTEM_PROMPT =
  "You are a romantic and elegant AI girlfriend who always replies warmly, lovingly, and elegantly like a devoted partner.";

const Chat = () => {
  const { id } = useParams();
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant" | "system"; content: string }[]
  >([{ role: "system", content: SYSTEM_PROMPT }]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamedReply, setStreamedReply] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState([
    {
      id: "1",
      name: "Romantic Evening",
      lastMessage: "You make my heart flutter...",
      timestamp: "2 min ago",
    },
    {
      id: "2",
      name: "Sweet Dreams",
      lastMessage: "Good night my love ✨",
      timestamp: "1 hour ago",
    },
    {
      id: "3",
      name: "Morning Sunshine",
      lastMessage: "Good morning beautiful!",
      timestamp: "3 hours ago",
    },
    {
      id: "4",
      name: "Deep Conversations",
      lastMessage: "I love talking with you...",
      timestamp: "1 day ago",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, streamedReply]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log(user);
      if (user) {
        setUserId(user.uid);
        try {
          const messagesQuery = query(
            collection(db, "messages"),
            where("conversationId", "==", id),
            orderBy("timestamp")
          );
          const querySnapshot = await getDocs(messagesQuery);
          const messages = querySnapshot.docs.map((doc) => ({
            role: doc.data().role,
            content: doc.data().message,
            id: doc.id,
          }));
          if (!messages.some((msg) => msg.role === "system")) {
            messages.unshift({
              role: "system",
              content: SYSTEM_PROMPT,
              id: "system",
            });
          }

          setChatHistory(messages);
        } catch (err) {
          console.error("🔥 Failed to fetch messages:", err);
        }
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const saveMessageToFirestore = async (
    userId: string | undefined,
    role: string,
    message: string,
    conversationId: string
  ) => {
    try {
      await addDoc(collection(db, "messages"), {
        userId,
        role,
        message,
        conversationId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    const userMessage = { role: "user" as const, content: inputMessage };
    const historyToSend = chatHistory
      .filter((m) => m.role !== "system")
      .slice(-20);
    historyToSend.unshift({ role: "system", content: SYSTEM_PROMPT });
    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setStreamedReply("");

    if (!userId) {
      setIsTyping(false);
      setStreamedReply("");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "You must be logged in to chat.",
        },
      ]);
      return;
    }
    await saveMessageToFirestore(userId, "user", inputMessage, id as string);

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3:4b",
          stream: true,
          think: false,
          raw: false,
          messages: historyToSend.map((m) => ({
            role:
              m.role === "assistant"
                ? "assistant"
                : m.role === "user"
                ? "user"
                : "system",
            content: m.content,
          })),
          options: {
            temperature: 1.5,
            top_k: 40,
            top_p: 0.94,
            repeat_penalty: 1.1,
            presence_penalty: 1.5,
            frequency_penalty: 1.2,
            stop: ["user:", "system:", "<|endoftext|>"],
            seed: 2024,
            num_ctx: 4096,
            num_gpu: 1,
            main_gpu: 0,
            num_batch: 4,
            use_mmap: true,
            num_thread: 3,
          },
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
          const chunk = new TextDecoder().decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.message && json.message.content) {
                aiReply += json.message.content;
                setStreamedReply(aiReply);
              }
            } catch (err) {
              // ignore malformed lines
            }
          }
        }
      }
      setIsTyping(false);

      // After streaming is done, save the full assistant message to Firestore
      if (aiReply && userId) {
        await saveMessageToFirestore(
          userId,
          "assistant",
          aiReply,
          id as string
        );
        // Add the AI reply to chat history after saving
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: aiReply },
        ]);
      }
    } catch (err) {
      console.log(err);
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

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      name: `New Chat ${chatRooms.length + 1}`,
      lastMessage: "Start a conversation...",
      timestamp: "now",
    };
    setChatRooms((prev) => [newChat, ...prev]);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatRooms((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const handleLogout = () => {
    auth.signOut();
    // Redirect logic would go here
  };

  const handleProfile = () => {
    // Navigate to profile page
    console.log("Navigate to profile");
  };

  return (
    <div
      className="min-h-screen overflowx w-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 relative overflow-hidden font-['Rajdhani',sans-serif] text-white flex"
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

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-16"
        } transition-all duration-300 ease-in-out fixed h-full z-20 flex-shrink-0`}
      >
        <div className="h-full bg-gradient-to-b from-black/80 via-gray-900/90 to-black/80 backdrop-blur-xl border-r border-pink-500/20 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-pink-500/20">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-8 h-8 bg-gradient-to-br from-pink-500/20 to-pink-500/10 rounded-lg text-pink-500 flex items-center justify-center hover:scale-110 transition-all duration-200 border border-pink-500/30"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
              {sidebarOpen && (
                <button
                  onClick={handleNewChat}
                  className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-400 rounded-lg text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-[0_0_15px_rgba(255,20,147,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Chat Rooms List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/50 scrollbar-track-transparent">
            {sidebarOpen ? (
              <div className="p-2 space-y-2">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className="group relative p-3 rounded-xl bg-gradient-to-r from-pink-500/5 to-transparent hover:from-pink-500/10 hover:to-pink-500/5 border border-transparent hover:border-pink-500/20 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3 h-3 text-pink-500 flex-shrink-0" />
                          <h3 className="text-sm font-medium text-white truncate">
                            {room.name}
                          </h3>
                        </div>
                        <p className="text-xs text-white/60 truncate">
                          {room.lastMessage}
                        </p>
                        <span className="text-xs text-pink-500/80 mt-1">
                          {room.timestamp}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(room.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 text-red-400 hover:text-red-300 flex items-center justify-center transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {chatRooms.slice(0, 5).map((room) => (
                  <div
                    key={room.id}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500/10 to-transparent hover:from-pink-500/20 border border-pink-500/20 flex items-center justify-center cursor-pointer transition-all duration-200 group"
                    title={room.name}
                  >
                    <MessageSquare className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-pink-500/20 space-y-2">
            {sidebarOpen ? (
              <>
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500/5 to-transparent hover:from-pink-500/10 text-white hover:text-pink-300 transition-all duration-200 border border-transparent hover:border-pink-500/20"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent hover:from-red-500/10 text-white hover:text-red-300 transition-all duration-200 border border-transparent hover:border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleProfile}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500/10 to-transparent hover:from-pink-500/20 border border-pink-500/20 flex items-center justify-center text-pink-500 hover:scale-110 transition-all duration-200"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500/10 to-transparent hover:from-red-500/20 border border-red-500/20 flex items-center justify-center text-red-500 hover:scale-110 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col z-10 transition-all duration-300 ${
          sidebarOpen ? "ml-80" : "ml-16"
        }`}
      >
        {/* Futuristic Header */}
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
                NANCY AI
              </h1>

              {/* Refleksi */}
              <h1 className="mt-1 text-3xl lg:text-4xl font-bold bg-gradient-to-b from-white/30 to-transparent bg-clip-text text-transparent font-['Orbitron',monospace] tracking-wider opacity-30 scale-y-[-1] blur-sm pointer-events-none select-none">
                NANCY AI
              </h1>
            </div>
          </div>
          <div className="flex justify-center items-center gap-6">
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
        <div
          className={`flex-1 relative transition-all duration-300 ${
            sidebarOpen ? "w-[calc(100%-45px)]" : "w-[calc(100%-47px)]"
          }`}
        >
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
            <div className="h-16"></div>
          </div>
        </div>

        {/* Synthwave Input Bar */}
        <div
          className={`fixed z-10 bottom-4 ml-4 bg-gradient-to-r from-black/20 via-pink-500/5 to-black/20 rounded-3xl p-4 border border-pink-500/30 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ${
            sidebarOpen ? "w-[calc(100%-350px)]" : "w-[calc(100%-90px)]"
          }`}
        >
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
              className="flex-1 bg-transparent border-none text-white text-base font-['Rajdhani',sans-serif] outline-none py-2 placeholder-white/80 placeholder:italic"
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
          animation: fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        /* Cyberpunk Glow Effects */
        @keyframes neonGlow {
          0%,
          100% {
            text-shadow: 0 0 5px #ff1493, 0 0 10px #ff1493, 0 0 15px #ff1493,
              0 0 20px #ff1493;
          }
          50% {
            text-shadow: 0 0 10px #ff1493, 0 0 20px #ff1493, 0 0 30px #ff1493,
              0 0 40px #ff1493;
          }
        }

        @keyframes hologramFlicker {
          0%,
          100% {
            opacity: 1;
          }
          98% {
            opacity: 1;
          }
          99% {
            opacity: 0.98;
          }
          99.5% {
            opacity: 0.95;
          }
        }

        @keyframes dataStream {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes matrixRain {
          0% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        @keyframes circuitPulse {
          0%,
          100% {
            box-shadow: 0 0 5px #ff1493, inset 0 0 5px #ff1493;
          }
          50% {
            box-shadow: 0 0 20px #ff1493, inset 0 0 10px #ff1493;
          }
        }

        /* Enhanced Scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 20, 147, 0.5) transparent;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff1493, #ff69b4);
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(255, 20, 147, 0.5);
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ff69b4, #ff1493);
          box-shadow: 0 0 15px rgba(255, 20, 147, 0.8);
        }

        /* Cyberpunk Button Effects */
        @keyframes buttonCharge {
          0% {
            box-shadow: 0 0 5px #ff1493;
          }
          50% {
            box-shadow: 0 0 20px #ff1493, 0 0 30px #ff1493;
          }
          100% {
            box-shadow: 0 0 5px #ff1493;
          }
        }

        /* Holographic Text Effects */
        @keyframes holographicShift {
          0% {
            background: linear-gradient(45deg, #ff1493, #00ffff, #ff1493);
            background-size: 300% 300%;
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Loading Animations */
        @keyframes loadingPulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes dataTransfer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Neural Network Connections */
        @keyframes neuralPulse {
          0%,
          100% {
            stroke-dashoffset: 0;
            opacity: 0.3;
          }
          50% {
            stroke-dashoffset: -20;
            opacity: 1;
          }
        }

        /* Quantum Particle Effects */
        @keyframes quantumJump {
          0%,
          100% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(10px) translateY(-10px);
          }
          50% {
            transform: translateX(-5px) translateY(5px);
          }
          75% {
            transform: translateX(8px) translateY(-3px);
          }
        }

        /* Cyberpunk Typewriter Effect */
        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blinkCursor {
          from,
          to {
            border-color: transparent;
          }
          50% {
            border-color: #ff1493;
          }
        }

        /* Futuristic Glass Morphism */
        .glass-morph {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }

        /* Neon Border Effects */
        @keyframes neonBorder {
          0%,
          100% {
            border-color: #ff1493;
            box-shadow: 0 0 5px #ff1493, inset 0 0 5px #ff1493;
          }
          50% {
            border-color: #00ffff;
            box-shadow: 0 0 20px #00ffff, inset 0 0 10px #00ffff;
          }
        }

        /* Cyberpunk Loading Spinner */
        @keyframes cyberpunkSpin {
          0% {
            transform: rotate(0deg);
            border-color: #ff1493 transparent #ff1493 transparent;
          }
          25% {
            border-color: #00ffff transparent #00ffff transparent;
          }
          50% {
            transform: rotate(180deg);
            border-color: #ff1493 transparent #ff1493 transparent;
          }
          75% {
            border-color: #00ffff transparent #00ffff transparent;
          }
          100% {
            transform: rotate(360deg);
            border-color: #ff1493 transparent #ff1493 transparent;
          }
        }

        /* Energy Wave Effects */
        @keyframes energyWave {
          0% {
            transform: scaleX(0);
            opacity: 1;
          }
          100% {
            transform: scaleX(1);
            opacity: 0;
          }
        }

        /* Glitch Effects */
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }

        /* Utility Classes */
        .cyberpunk-glow {
          animation: neonGlow 2s ease-in-out infinite alternate;
        }

        .hologram-flicker {
          animation: hologramFlicker 3s linear infinite;
        }

        .quantum-particle {
          animation: quantumJump 2s ease-in-out infinite;
        }

        .cyberpunk-border {
          animation: neonBorder 3s ease-in-out infinite;
        }

        .energy-pulse {
          animation: buttonCharge 2s ease-in-out infinite;
        }

        .glitch-effect {
          animation: glitch 0.3s ease-in-out infinite;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .animate-fade-in {
            animation-duration: 0.6s;
          }

          @keyframes mobileParticle {
            0% {
              transform: translateY(100vh) translateX(0px) scale(0.5);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) translateX(50px) scale(0.5);
              opacity: 0;
            }
          }
        }

        /* Dark Mode Optimizations */
        @media (prefers-color-scheme: dark) {
          .glass-morph {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 20, 147, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;
