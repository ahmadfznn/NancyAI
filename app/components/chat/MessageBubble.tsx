import React from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: any;
  images?: string[];
}

interface MessageBubbleProps {
  message: Message;
  idx: number;
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
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  idx,
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
}) => {
  return (
    <div
      className={`flex items-end gap-4 mb-8 animate-fade-in ${
        message.role === "user" ? "flex-row-reverse justify-start" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 relative bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-[0_0_20px_rgba(255,20,147,0.6)]`}
      >
        <div
          className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-transparent via-pink-500/30 to-transparent animate-spin"
          style={{ animation: "avatarSpin 8s linear infinite" }}
        />
        <span className="relative z-10">
          {message.role === "user" ? "U" : "F"}
        </span>
      </div>
      {/* Message Bubble */}
      <div
        className={`max-w-[70%] min-w-[8%] pl-3 pr-6 pt-3 pb-7 text-justify relative backdrop-blur-md text-sm lg:text-base leading-relaxed ${
          message.role === "user"
            ? "bg-gradient-to-br from-pink-500/20 to-pink-500/10 border border-pink-500/40 text-white shadow-[0_8px_32px_rgba(255,20,147,0.2)] rounded-t-3xl rounded-bl-3xl"
            : "bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-white/10 text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-t-3xl rounded-br-3xl"
        } before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-r before:from-transparent before:via-pink-500/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`}
      >
        <div className="relative z-10 whitespace-pre-wrap">
          {/* Image Display */}
          {message.images &&
            message.images.map((imageData, index) => (
              <div
                key={index}
                className="mb-2 rounded-lg overflow-hidden border-2 border-pink-500/30"
              >
                <Image
                  src={`data:image/jpeg;base64,${imageData}`}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-auto max-h-64 object-cover"
                />
              </div>
            ))}

          {/* Rest of the existing code remains the same */}
          <div className="absolute -top-1 -right-5 z-20">
            <button
              onClick={() => handleDropdownToggle(idx)}
              className="text-white/40 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {dropdownOpen[idx] && (
              <div className="absolute right-0 mt-2 w-40 bg-black/80 border border-pink-500/20 rounded-lg shadow-lg text-sm backdrop-blur-md z-10">
                <button
                  onClick={() => handleDeleteMessage(message)}
                  className="w-full px-4 py-2 hover:bg-pink-500/10 text-left"
                >
                  🗑 Delete
                </button>
                <button
                  onClick={() => handleViewDetails(message)}
                  className="w-full px-4 py-2 hover:bg-pink-500/10 text-left"
                >
                  ℹ️ Details
                </button>
                {message.role === "user" && (
                  <button
                    onClick={() => handleEditMessage(message)}
                    className="w-full px-4 py-2 hover:bg-pink-500/10 text-left"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {message.content}

          {message.role === "assistant" && (
            <div className="absolute -bottom-5 right-0 flex gap-2 text-white/40 text-xs">
              <button onClick={() => handleThumbUp(message)} title="Like">
                👍
              </button>
              <button onClick={() => handleThumbDown(message)} title="Dislike">
                👎
              </button>
              <button
                onClick={() => handleCopyMessage(message.content)}
                title="Copy"
              >
                📋
              </button>
              <button
                onClick={() => handleRegenerate(message)}
                title="Regenerate"
              >
                ♻️
              </button>
              <button onClick={() => handleShare(message)} title="Share">
                🔗
              </button>
            </div>
          )}

          <div
            className={`absolute ${
              message.role === "user"
                ? "-bottom-7 -right-5"
                : "-bottom-7 -left-1"
            } text-[11px] text-white/50 font-mono`}
          >
            {new Date(
              message.timestamp?.toDate?.() || Date.now()
            ).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
