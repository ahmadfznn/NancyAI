import React, { RefObject } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: any;
  images?: string[];
}

interface MessageListProps {
  chatHistory: Message[];
  dropdownOpen: { [key: number]: boolean };
  handleDropdownToggle: (index: number) => void;
  handleDeleteMessage: (message: Message) => void;
  handleViewDetails: (message: Message) => void;
  handleEditMessage: (message: Message) => void;
  handleThumbUp: (message: Message) => void;
  handleThumbDown: (message: Message) => void;
  handleCopyMessage: (text: string) => void;
  handleRegenerate: (message: Message) => void;
  handleShare: (message: Message) => void;
  isTyping: boolean;
  streamedReply: string;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  chatHistory,
  dropdownOpen,
  handleDropdownToggle,
  handleDeleteMessage,
  handleViewDetails,
  handleEditMessage,
  handleThumbUp,
  handleThumbDown,
  handleCopyMessage,
  handleRegenerate,
  handleShare,
  isTyping,
  streamedReply,
  messagesEndRef,
}) => {
  return (
    <>
      {chatHistory
        .filter((m) => m.role !== "system" || m.content !== "")
        .map((message, idx) => (
          <MessageBubble
            key={message.id}
            message={message}
            idx={idx}
            dropdownOpen={dropdownOpen}
            handleDropdownToggle={handleDropdownToggle}
            handleDeleteMessage={handleDeleteMessage}
            handleViewDetails={handleViewDetails}
            handleEditMessage={handleEditMessage}
            handleThumbUp={handleThumbUp}
            handleThumbDown={handleThumbDown}
            handleCopyMessage={handleCopyMessage}
            handleRegenerate={handleRegenerate}
            handleShare={handleShare}
          />
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
      <div className="h-24"></div>
    </>
  );
};

export default MessageList;
