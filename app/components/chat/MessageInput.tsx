import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  ChevronDown,
  Mic,
  Image as ImageIcon,
  RefreshCw,
  Wand2,
  Type,
  Smile,
  Zap,
  Globe,
  Code,
  X,
} from "lucide-react";
import { useImageUpload } from "../../../lib/hooks/useImageUpload";
import { useSpeechRecognition } from "../../../lib/hooks/useSpeechRecognition";
import Image from "next/image";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessage: (options?: { imageBase64?: string }) => void;
  isTyping: boolean;
  sidebarOpen: boolean;
  systemDropdownOpen: boolean;
  setSystemDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  systemRole: string;
  roles: string[];
  handleSystemRoleChange: (role: string) => void;
  handleToneChange: (tone: string) => void;
  handleRegenerateMessage?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputMessage,
  setInputMessage,
  onKeyPress,
  sendMessage,
  isTyping,
  sidebarOpen,
  systemDropdownOpen,
  setSystemDropdownOpen,
  systemRole,
  roles,
  handleSystemRoleChange,
  handleToneChange,
  handleRegenerateMessage,
}) => {
  // Image Upload Hook
  const { uploadedImage, handleImageUpload, clearUploadedImage } =
    useImageUpload();

  // Speech Recognition Hook
  const { transcription, isListening, error, startListening, stopListening } =
    useSpeechRecognition();

  // State for additional dropdowns and features
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false);
  const [promptTemplateDropdownOpen, setPromptTemplateDropdownOpen] =
    useState(false);
  const [selectedTone, setSelectedTone] = useState<string>("Friendly");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Predefined lists
  const tones = ["Friendly", "Sarcastic", "Empathetic", "Formal"];
  const promptTemplates = [
    { label: "Summarize", icon: <Type size={16} /> },
    { label: "Translate", icon: <Globe size={16} /> },
    { label: "Convert to Code", icon: <Code size={16} /> },
    { label: "Brainstorm", icon: <Wand2 size={16} /> },
  ];

  // Update input message when speech transcription changes
  useEffect(() => {
    if (transcription) {
      setInputMessage(transcription);
    }
  }, [transcription, setInputMessage]);

  // Tone selection
  const handleToneSelect = (tone: string) => {
    setSelectedTone(tone);
    handleToneChange(tone);
    setToneDropdownOpen(false);
  };

  // Prompt template selection
  const handlePromptTemplateSelect = (template: string) => {
    setInputMessage(template);
    setPromptTemplateDropdownOpen(false);
  };

  // Speech recognition handler
  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div
      className={`fixed z-20 bottom-4 ml-4 bg-gradient-to-r from-black/20 via-pink-500/5 to-black/20 rounded-3xl p-4 border border-pink-500/30 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ${
        sidebarOpen ? "w-[calc(100%-350px)]" : "w-[calc(100%-90px)]"
      } flex flex-col`}
    >
      {/* Image Preview */}
      {uploadedImage.preview && (
        <div className="mb-2 relative">
          <Image
            src={`data:image/jpeg;base64,${uploadedImage.base64}`}
            alt="Upload preview"
            className="max-h-24 w-auto rounded-lg shadow-lg border-2 border-pink-500/30"
          />
          <button
            onClick={clearUploadedImage}
            className="absolute top-1 right-1 bg-red-500/50 rounded-full p-1 hover:bg-red-500/70 transition-all"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
      )}

      {/* Speech Recognition Error */}
      {error && (
        <div className="text-red-500 text-xs mb-2 animate-pulse">{error}</div>
      )}

      {/* Top Row: Dropdowns and Utilities */}
      <div className="flex items-center space-x-2 mb-2">
        {/* System Role Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-gradient-to-r from-pink-500/20 to-pink-300/10 border border-pink-500/30 text-white font-semibold shadow hover:from-pink-500/40 hover:to-pink-300/20 transition-all duration-200 backdrop-blur-md"
            onClick={() => setSystemDropdownOpen((prev) => !prev)}
          >
            <Smile size={16} className="mr-1" />
            <span>{systemRole}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {systemDropdownOpen && (
            <div className="absolute left-0 -top-[10rem] w-44 bg-black/90 border border-pink-500/30 rounded-xl shadow-lg z-50">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleSystemRoleChange(role)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-pink-500/20 transition-colors rounded-xl"
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tone Selector */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-cyan-300/10 border border-cyan-500/30 text-white font-semibold shadow hover:from-cyan-500/40 hover:to-cyan-300/20 transition-all duration-200 backdrop-blur-md"
            onClick={() => setToneDropdownOpen((prev) => !prev)}
          >
            <Zap size={16} className="mr-1" />
            <span>{selectedTone}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {toneDropdownOpen && (
            <div className="absolute left-0 -top-[10rem] w-44 bg-black/90 border border-cyan-500/30 rounded-xl shadow-lg z-50">
              {tones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleToneSelect(tone)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-cyan-500/20 transition-colors rounded-xl"
                >
                  {tone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Template Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-gradient-to-r from-purple-500/20 to-purple-300/10 border border-purple-500/30 text-white font-semibold shadow hover:from-purple-500/40 hover:to-purple-300/20 transition-all duration-200 backdrop-blur-md"
            onClick={() => setPromptTemplateDropdownOpen((prev) => !prev)}
          >
            <Wand2 size={16} className="mr-1" />
            <span>Templates</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {promptTemplateDropdownOpen && (
            <div className="absolute left-0 -top-[10rem] w-44 bg-black/90 border border-purple-500/30 rounded-xl shadow-lg z-50">
              {promptTemplates.map((template) => (
                <button
                  key={template.label}
                  onClick={() => handlePromptTemplateSelect(template.label)}
                  className="w-full text-left px-4 py-2 text-white hover:bg-purple-500/20 transition-colors rounded-xl flex items-center"
                >
                  {template.icon}
                  <span className="ml-2">{template.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input and Action Buttons Row */}
      <div className="flex items-center gap-4 relative z-10">
        {/* Mic and Image Upload Buttons */}
        <div className="flex items-center space-x-2">
          {/* Speech-to-Text Button */}
          <button
            onClick={handleSpeechInput}
            className={`w-10 h-10 rounded-full text-white cursor-pointer flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500/20 border border-red-500/30 animate-pulse"
                : "bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 border border-cyan-500/30"
            }`}
            title={isListening ? "Stop Listening" : "Speech-to-Text"}
          >
            <Mic
              className={`w-5 h-5 ${
                isListening ? "text-red-500" : "text-cyan-300"
              }`}
            />
          </button>

          {/* Image Upload Button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className={`w-10 h-10 rounded-full text-white cursor-pointer flex items-center justify-center transition-all ${
              uploadedImage.preview
                ? "bg-green-500/20 border border-green-500/30"
                : "bg-gradient-to-br from-purple-500/20 to-purple-400/10 border border-purple-500/30"
            }`}
            title="Upload Image"
          >
            <ImageIcon
              className={`w-5 h-5 ${
                uploadedImage.preview ? "text-green-500" : "text-purple-300"
              }`}
            />
          </button>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
        </div>

        {/* Main Input */}
        <div className="flex-1 flex items-center gap-4 relative">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={onKeyPress}
            className="flex-1 bg-transparent border-none text-white text-base font-['Rajdhani',sans-serif] outline-none py-2 placeholder-white/80 placeholder:italic"
            placeholder="Transmit your thoughts to Fancy AI..."
            disabled={isTyping}
          />

          {/* Regenerate Button (when AI is typing) */}
          {isTyping && handleRegenerateMessage && (
            <button
              onClick={handleRegenerateMessage}
              className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 rounded-full text-yellow-300 cursor-pointer flex items-center justify-center hover:bg-yellow-500/40 transition-all"
              title="Regenerate Response"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={() => {
              sendMessage({ imageBase64: uploadedImage.base64! });
            }}
            className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-400 rounded-full text-white cursor-pointer flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(255,20,147,0.8)] active:scale-95 shadow-[0_0_20px_rgba(255,20,147,0.4)]"
            disabled={
              isTyping || (!inputMessage.trim() && !uploadedImage.preview)
            }
            title="Send Message"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ animation: "holoSpin 2s linear infinite" }}
            />
            <Send className="w-5 h-5 relative z-10" />
          </button>
        </div>
      </div>

      {/* Thinking Status */}
      {isTyping && (
        <div className="text-xs text-white/70 mt-2 flex items-center">
          <span className="animate-pulse mr-2">💭</span>
          Fancy AI is thinking...
        </div>
      )}
    </div>
  );
};

export default MessageInput;
