import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const SYSTEM_PROMPT = "You are a romantic and elegant AI girlfriend...";

export const useChatLogic = () => {
  const { id } = useParams();
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamedReply, setStreamedReply] = useState("");
  const [chatRooms, setChatRooms] = useState([...]); // dummy data
  const messagesEndRef = useRef(null);
  const [userId, setUserId] = useState<string | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping, streamedReply]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const messagesQuery = query(
            collection(db, "messages"),
            where("conversationId", "==", id),
            orderBy("timestamp")
          );
          const querySnapshot = await getDocs(messagesQuery);
          const messages = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              if (!["user", "assistant", "system"].includes(data.role)) return null;
              return {
                role: data.role,
                content: data.message,
              };
            })
            .filter(Boolean);
          if (!messages.find((msg) => msg.role === "system")) {
            messages.unshift({ role: "system", content: SYSTEM_PROMPT });
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

  const saveMessageToFirestore = async (role: string, message: string) => {
    if (!userId) return;
    await addDoc(collection(db, "messages"), {
      userId,
      role,
      message,
      conversationId: id,
      timestamp: serverTimestamp(),
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = { role: "user", content: inputMessage };
    const messagesToSend = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.filter((msg) => msg.role !== "system"),
      userMessage,
    ].slice(-20);

    setChatHistory((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setStreamedReply("");
    await saveMessageToFirestore("user", inputMessage);

    try {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "qwen3:4b", messages: messagesToSend }),
      });
      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      let aiReply = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              aiReply += json.message.content;
              setStreamedReply(aiReply);
            }
          } catch (err) {}
        }
      }
      setIsTyping(false);
      setStreamedReply("");
      setChatHistory((prev) => [...prev, { role: "assistant", content: aiReply }]);
      await saveMessageToFirestore("assistant", aiReply);
    } catch (err) {
      setIsTyping(false);
      setStreamedReply("");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to my quantum heart right now 💔",
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const createQuantumParticle = (x, y) => {
    const particle = document.createElement("div");
    particle.className =
      "fixed w-1 h-1 bg-pink-500 rounded-full shadow-[0_0_10px_#FF1493] pointer-events-none z-50 animate-pulse";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.animation = "quantumFade 2s ease-out forwards";
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 2000);
  };

  const handleClick = (e) => {
    createQuantumParticle(e.clientX, e.clientY);
  };

  const handleNewChat = () => { /* same */ };
  const handleDeleteChat = (id) => { /* same */ };
  const handleLogout = () => { auth.signOut(); };
  const handleProfile = () => { console.log("Go to profile"); };

  return {
    chatHistory,
    inputMessage,
    setInputMessage,
    isTyping,
    streamedReply,
    sendMessage,
    handleKeyPress,
    handleClick,
    messagesEndRef,
    chatRooms,
    handleNewChat,
    handleDeleteChat,
    handleLogout,
    handleProfile,
  };
};
