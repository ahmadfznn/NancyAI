"use client";

import React from "react";
import { Menu, X, Plus, MessageSquare, User, LogOut } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  chatRooms: Array<{
    id: string;
    name: string;
    lastMessage: string;
    timestamp: any;
  }>;
  handleNewChat: () => void;
  handleProfile: () => void;
  handleLogout: () => void;
  handleChatClick: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  chatRooms,
  handleNewChat,
  handleProfile,
  handleLogout,
  handleChatClick,
}) => {
  return (
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
                  onClick={() => handleChatClick(room.id)}
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
                        {room.lastMessage.length > 40
                          ? `${room.lastMessage.substring(0, 40)}...`
                          : room.lastMessage}
                      </p>
                      <span className="text-xs text-pink-500/80 mt-1">
                        {room.timestamp
                          ? new Date(room.timestamp).toLocaleString()
                          : ""}
                      </span>
                    </div>
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
  );
};

export default Sidebar;
