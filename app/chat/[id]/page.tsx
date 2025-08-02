"use client";

import React, { useState } from "react";
import { useChatLogicV2 } from "../../../lib/hooks/useChatLogicV2";
import { createQuantumParticle } from "../../../lib/utils/chat";
import { useMessageActions } from "../../../lib/hooks/useMessageActions";
import Sidebar from "../../components/chat/Sidebar";
import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";
import { useParams } from "next/navigation";

const Chat = () => {
  const params = useParams();
  const conversationId = params.id as string;
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);
  const [systemRole, setSystemRole] = useState("System As");
  const [tone, setTone] = useState("Friendly");
  const roles = ["Programmer", "Doctor", "Girlfriend", "Lecturer"];

  const handleSystemRoleChange = (role: string) => {
    setSystemRole(role);
    setSystemDropdownOpen(false);
  };

  const handleToneChange = (selectedTone: string) => {
    setTone(selectedTone);
  };

  const {
    chatHistory,
    setChatHistory,
    inputMessage,
    setInputMessage,
    isTyping,
    streamedReply,
    sidebarOpen,
    setSidebarOpen,
    dropdownOpen,
    setDropdownOpen,
    chatRooms,
    messagesEndRef,
    chatContainerRef,
    userId,
    sendMessage,
    handleKeyPress,
    handleNewChat,
    handleLogout,
    handleProfile,
    handleChatClick,
  } = useChatLogicV2(systemRole, tone);

  // Log chat history whenever it changes
  React.useEffect(() => {
    console.log("Current Chat History:", chatHistory);
  }, [chatHistory]);

  const {
    handleDropdownToggle,
    handleCopyMessage,
    handleDeleteMessage,
    handleViewDetails,
    handleEditMessage,
    handleThumbUp,
    handleThumbDown,
    handleRegenerate,
    handleShare,
  } = useMessageActions({
    setChatHistory,
    userId,
    conversationId: conversationId,
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    createQuantumParticle(e.clientX, e.clientY);
  };

  return (
    <div
      className="min-h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 relative overflow-hidden font-['Rajdhani',sans-serif] text-white flex"
      style={{ backgroundAttachment: "fixed" }}
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chatRooms={chatRooms}
        handleNewChat={handleNewChat}
        handleProfile={handleProfile}
        handleLogout={handleLogout}
        handleChatClick={handleChatClick}
      />

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col z-10 transition-all duration-300 ${
          sidebarOpen ? "ml-80" : "ml-16"
        }`}
      >
        {/* Futuristic Header */}
        <ChatHeader />
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
            <MessageList
              chatHistory={chatHistory}
              dropdownOpen={dropdownOpen}
              handleDropdownToggle={(idx) =>
                handleDropdownToggle(idx, dropdownOpen, setDropdownOpen)
              }
              handleDeleteMessage={handleDeleteMessage}
              handleViewDetails={handleViewDetails}
              handleEditMessage={handleEditMessage}
              handleThumbUp={handleThumbUp}
              handleThumbDown={handleThumbDown}
              handleCopyMessage={handleCopyMessage}
              handleRegenerate={handleRegenerate}
              handleShare={handleShare}
              isTyping={isTyping}
              streamedReply={streamedReply}
              messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
            />
          </div>
        </div>

        {/* Synthwave Input Bar */}
        <MessageInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onKeyPress={handleKeyPress}
          sendMessage={sendMessage}
          isTyping={isTyping}
          sidebarOpen={sidebarOpen}
          systemDropdownOpen={systemDropdownOpen}
          setSystemDropdownOpen={setSystemDropdownOpen}
          systemRole={systemRole}
          roles={roles}
          handleSystemRoleChange={handleSystemRoleChange}
          handleToneChange={handleToneChange}
        />
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
