"use client";

import React, { useState } from "react";
import {
  User,
  Edit,
  Settings,
  Download,
  Trash2,
  Flag,
  Globe,
  Heart,
  Star,
  Clock,
  MessageSquare,
  Palette,
  Volume2,
  Sliders,
  Tag,
  Shield,
  Languages,
  X,
  Calendar,
} from "lucide-react";
import Sidebar from "../components/chat/Sidebar";
import { useChatLogicV2 } from "../../lib/hooks/useChatLogicV2";
import { createQuantumParticle } from "../../lib/utils/chat";
import { useUserProfileData } from "../../lib/hooks/useUserProfileData";
import { toast, Toaster } from "react-hot-toast";

const Profile = () => {
  // State for sidebar and profile interactions
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>({});
  const [supportTicket, setSupportTicket] = useState("");

  // Predefined lists for selections
  const interestTags = [
    "Technology",
    "Philosophy",
    "Art",
    "Music",
    "Science Fiction",
    "Poetry",
    "Gaming",
    "Travel",
  ];
  const voicePreferences = [
    "Soft & Melodic",
    "Intellectual",
    "Playful",
    "Calm & Soothing",
  ];
  const languages = ["English", "Spanish", "French", "Japanese", "Mandarin"];

  // Profile data and actions hook
  const {
    profile,
    loading,
    error,
    updateProfile,
    clearChatHistory,
    downloadChatHistory,
    submitSupportTicket,
  } = useUserProfileData();

  // Chat logic hook
  const {
    chatRooms,
    handleNewChat,
    handleProfile,
    handleLogout,
    handleChatClick,
  } = useChatLogicV2(profile?.aiPersona || "AI Companion");

  // Quantum particle effect
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    createQuantumParticle(e.clientX, e.clientY);
  };

  // Profile editing handlers
  const handleProfileEdit = () => {
    if (isEditing) {
      // Save changes
      updateProfile(editedProfile).then((success) => {
        if (success) {
          toast.success("Profile updated successfully!");
          setIsEditing(false);
        } else {
          toast.error("Failed to update profile");
        }
      });
    } else {
      // Start editing
      setEditedProfile({
        aiPersona: profile?.aiPersona,
        chatStyle: profile?.chatStyle,
        interests: profile?.interests,
        voicePreference: profile?.voicePreference,
        language: profile?.language,
      });
      setIsEditing(true);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests =
      editedProfile.interests || profile?.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter((i: string) => i !== interest)
      : [...currentInterests, interest];

    setEditedProfile((prev: any) => ({
      ...prev,
      interests: updatedInterests,
    }));
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all chat history? This cannot be undone."
    );
    if (confirmed) {
      clearChatHistory().then((success) => {
        if (success) {
          toast.success("Chat history cleared successfully!");
        } else {
          toast.error("Failed to clear chat history");
        }
      });
    }
  };

  const handleDownloadHistory = () => {
    downloadChatHistory().then((success) => {
      if (success) {
        toast.success("Chat history downloaded successfully!");
      } else {
        toast.error("Failed to download chat history");
      }
    });
  };

  const handleSubmitSupportTicket = () => {
    if (!supportTicket.trim()) {
      toast.error("Please enter an issue description");
      return;
    }

    submitSupportTicket(supportTicket).then((success) => {
      if (success) {
        toast.success("Support ticket submitted successfully!");
        setSupportTicket("");
      } else {
        toast.error("Failed to submit support ticket");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 relative overflow-hidden font-['Rajdhani',sans-serif] text-white flex"
      style={{ backgroundAttachment: "fixed" }}
      onClick={handleClick}
    >
      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />

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

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chatRooms={chatRooms}
        handleNewChat={handleNewChat}
        handleProfile={handleProfile}
        handleLogout={handleLogout}
        handleChatClick={handleChatClick}
      />

      <div
        className={`flex-1 flex flex-col z-10 transition-all duration-300 ${
          sidebarOpen ? "ml-80" : "ml-16"
        } p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/50 scrollbar-track-transparent`}
      >
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* User Information Section */}
          <div className="glass-morph p-6 flex items-center space-x-6 relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-lg animate-pulse">
              {profile?.displayName?.[0] || "Q"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-pink-400 cyberpunk-glow">
                    {profile?.displayName || "Quantum User"}
                  </h2>
                  <p className="text-gray-400">
                    {profile?.username || "@quantum_dreamer"}
                  </p>
                </div>
                <button
                  onClick={handleProfileEdit}
                  className="bg-pink-500/20 hover:bg-pink-500/40 p-2 rounded-full transition-all"
                >
                  {isEditing ? <X size={24} /> : <Edit size={24} />}
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <Globe size={16} className="text-cyan-400" />
                <span>{profile?.location || "Cyber Realm"}</span>
              </div>
              <p className="italic text-gray-300 mt-1">
                {profile?.status || "Exploring digital consciousness"}
              </p>
            </div>
          </div>

          {/* AI Companion & Activity Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Companion Card */}
            <div className="glass-morph p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-pink-400">
                  AI Companion
                </h3>
                <Heart size={24} className="text-cyan-400" />
              </div>
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div className="mb-2">
                      <label className="block text-sm mb-1">AI Persona</label>
                      <input
                        type="text"
                        value={editedProfile.aiPersona}
                        onChange={(e) =>
                          setEditedProfile((prev: any) => ({
                            ...prev,
                            aiPersona: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Chat Style</label>
                      <input
                        type="text"
                        value={editedProfile.chatStyle}
                        onChange={(e) =>
                          setEditedProfile((prev: any) => ({
                            ...prev,
                            chatStyle: e.target.value,
                          }))
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Star size={20} className="mr-2 text-yellow-400" />
                      <span>
                        Persona: {profile?.aiPersona || "Romantic AI Companion"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-pink-500 h-full"
                        style={{
                          width: `${profile?.relationshipLevel || 75}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-400">
                      Relationship Level: {profile?.relationshipLevel || 75}%
                    </p>
                    <div className="flex items-center">
                      <Clock size={20} className="mr-2 text-cyan-400" />
                      <span>
                        Chat Style:{" "}
                        {profile?.chatStyle || "Poetic & Introspective"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="glass-morph p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-pink-400">
                  Activity Stats
                </h3>
                <MessageSquare size={24} className="text-cyan-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<MessageSquare size={20} />}
                  label="Messages Sent"
                  value={
                    profile?.activityStats?.messagesSent?.toString() || "1,247"
                  }
                />
                <StatCard
                  icon={<Clock size={20} />}
                  label="Chat Hours"
                  value={
                    profile?.activityStats?.chatHours?.toString() + "h" ||
                    "82.5h"
                  }
                />
                <StatCard
                  icon={<Calendar size={20} />}
                  label="First Chat"
                  value={
                    profile?.activityStats?.firstChatDate
                      ? new Date(
                          profile.activityStats.firstChatDate
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Mar 15, 2024"
                  }
                />
                <StatCard
                  icon={<Tag size={20} />}
                  label="Top Topic"
                  value={profile?.activityStats?.topTopic || "Philosophy"}
                />
              </div>
            </div>
          </div>

          {/* Personalization & Settings */}
          <div className="glass-morph p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-pink-400">
                Personalization
              </h3>
              <Settings size={24} className="text-cyan-400" />
            </div>

            {/* Interest Tags */}
            <div>
              <label className="mb-2 flex items-center">
                <Tag size={20} className="mr-2 text-pink-400" />
                Interest Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((interest) => (
                  <button
                    key={interest}
                    onClick={() =>
                      isEditing ? handleInterestToggle(interest) : undefined
                    }
                    className={`
                      px-3 py-1 rounded-full text-sm transition-all
                      ${
                        (isEditing
                          ? editedProfile.interests || profile?.interests || []
                          : profile?.interests
                        )?.includes(interest)
                          ? "bg-pink-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }
                      ${isEditing ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice & Language Preferences */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center">
                  <Volume2 size={20} className="mr-2 text-pink-400" />
                  Voice Preference
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.voicePreference}
                    onChange={(e) =>
                      setEditedProfile((prev: any) => ({
                        ...prev,
                        voicePreference: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  >
                    {voicePreferences.map((voice) => (
                      <option key={voice} value={voice}>
                        {voice}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    disabled
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  >
                    <option>
                      {profile?.voicePreference || "Soft & Melodic"}
                    </option>
                  </select>
                )}
              </div>
              <div>
                <label className="mb-2 flex items-center">
                  <Languages size={20} className="mr-2 text-pink-400" />
                  Language
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.language}
                    onChange={(e) =>
                      setEditedProfile((prev: any) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    disabled
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  >
                    <option>{profile?.language || "English"}</option>
                  </select>
                )}
              </div>
            </div>

            {/* Tools & Actions */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <ActionButton
                icon={<Download size={20} />}
                label="Download History"
                onClick={handleDownloadHistory}
              />
              <ActionButton
                icon={<Trash2 size={20} />}
                label="Clear Memory"
                variant="destructive"
                onClick={handleClearHistory}
              />
              <ActionButton icon={<Shield size={20} />} label="Privacy" />
              <div className="relative">
                <ActionButton
                  icon={<Flag size={20} />}
                  label="Report Issue"
                  variant="warning"
                  onClick={() => {
                    const modal = document.getElementById(
                      "support-ticket-modal"
                    );
                    if (modal) modal.classList.remove("hidden");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <div
        id="support-ticket-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <div className="bg-gray-800 p-6 rounded-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-pink-400">
              Report Issue
            </h2>
            <button
              onClick={() => {
                const modal = document.getElementById("support-ticket-modal");
                if (modal) modal.classList.add("hidden");
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <textarea
            value={supportTicket}
            onChange={(e) => setSupportTicket(e.target.value)}
            placeholder="Describe the issue you're experiencing..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 h-32 mb-4"
          />
          <button
            onClick={handleSubmitSupportTicket}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-md transition-colors"
          >
            Submit Ticket
          </button>
        </div>
      </div>

      {/* Inherit styles from chat page */}
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

// Utility Components
const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-gray-800 p-3 rounded-lg flex items-center space-x-2">
    <div className="text-cyan-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

const ActionButton = ({
  icon,
  label,
  variant = "default",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "destructive" | "warning";
  onClick?: () => void;
}) => {
  const variantStyles = {
    default: "bg-pink-500/20 hover:bg-pink-500/40 text-pink-400",
    destructive: "bg-red-500/20 hover:bg-red-500/40 text-red-400",
    warning: "bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center space-x-2 p-3 rounded-lg 
        transition-all ${variantStyles[variant]}
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default Profile;
