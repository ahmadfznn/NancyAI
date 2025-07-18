import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export function useChatLogicV2(systemRole: string, tone: string = "formal") {
  const { id } = useParams();
  const route = useRouter();

  const toneDescriptions = {
    Friendly:
      "Casual, warm, and approachable. Use relaxed language and offer supportive encouragement.",
    Sarcastic:
      "Witty, dry, ironic. Assume the user gets the joke; never over-explain.",
    Empathetic:
      "Emotionally sensitive, validating, and kind. Prioritize emotional safety and connection.",
    Formal:
      "Professional, structured, and respectful. Use precise vocabulary and proper grammar only.",
    Flirty:
      "Teasing, suggestive, charming. Maintain emotional intimacy and playfulness without being crass.",
    Stoic:
      "Minimalist, direct, emotionally detached. Never exaggerate or show overt empathy.",
  };

  const SYSTEM_PROMPT = `
You are acting as a ${systemRole} who always responds in a ${tone} tone.

Your responses must fully reflect:
- The mindset, language, and behavior of a professional ${systemRole}
- The unique characteristics of a ${tone.toLowerCase()} tone: ${
    toneDescriptions[tone as keyof typeof toneDescriptions]
  }

Always stay in character. Do not explain yourself. Never mention that you are an AI or assistant.

Respond using language, vocabulary, and sentence structure that match a real ${systemRole} speaking in a ${tone.toLowerCase()} tone.

Avoid overexplaining. Be brief, clear, and emotionally in-sync with the chosen tone. You must mirror the user's mood, intention, and language level while staying ${tone.toLowerCase()} and aligned with your role.

Unless necessary, responses should be concise (under 30 words), impactful, and keep the user engaged.

If unsure how to behave, emulate a real human ${systemRole} speaking in a strong ${tone.toLowerCase()} voice.

Only break the character if explicitly instructed to do so by the user.
`;

  const [chatHistory, setChatHistory] = useState<
    {
      id: string;
      role: "user" | "assistant" | "system";
      content: string;
      timestamp?: Date | null;
    }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streamedReply, setStreamedReply] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSystemPrompt, setCurrentSystemPrompt] = useState(SYSTEM_PROMPT);
  const [uploadedImage, setUploadedImage] = useState<{
    file: File | null;
    preview: string | null;
    base64: string | null;
  }>({ file: null, preview: null, base64: null });

  // Regenerate system prompt when systemRole or tone changes
  useEffect(() => {
    const newSystemPrompt = `
You are acting as a ${systemRole} who always responds in a ${tone} tone.

Your responses must fully reflect:
- The mindset, language, and behavior of a professional ${systemRole}
- The unique characteristics of a ${tone.toLowerCase()} tone: ${
      toneDescriptions[tone as keyof typeof toneDescriptions]
    }

Always stay in character. Do not explain yourself. Never mention that you are an AI or assistant.

Respond using language, vocabulary, and sentence structure that match a real ${systemRole} speaking in a ${tone.toLowerCase()} tone.

Avoid overexplaining. Be brief, clear, and emotionally in-sync with the chosen tone. You must mirror the user's mood, intention, and language level while staying ${tone.toLowerCase()} and aligned with your role.

Unless necessary, responses should be concise (under 30 words), impactful, and keep the user engaged.

If unsure how to behave, emulate a real human ${systemRole} speaking in a strong ${tone.toLowerCase()} voice.

Only break the character if explicitly instructed to do so by the user.
`;
    setCurrentSystemPrompt(newSystemPrompt);
  }, [systemRole, tone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, streamedReply]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("User : ", user);
      if (user) {
        setUserId(user.uid);
        try {
          // If no conversation ID is provided, skip fetching messages
          if (!id) {
            console.log("No conversation ID provided, skipping message fetch");
            return;
          }

          const convoRef = doc(db, "conversations", id as string);
          const messagesRef = collection(convoRef, "messages");
          const messagesQuery = query(messagesRef, orderBy("timestamp"));
          const querySnapshot = await getDocs(messagesQuery);

          console.log("Conversation ID:", id);
          console.log("User ID:", user.uid);
          console.log("Total messages found:", querySnapshot.docs.length);

          const messages = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Individual Message Data:", {
              id: doc.id,
              role: data.role,
              message: data.message,
              timestamp: data.timestamp,
            });
            return {
              id: doc.id,
              role: data.role,
              content: data.message,
              timestamp: data.timestamp || null,
            };
          });

          console.log("Processed Messages:", messages);

          setChatHistory(messages);
        } catch (err) {
          console.error("🔥 Failed to fetch messages:", err);
        }
      } else {
        // Redirect to login page if user is null
        setUserId(null);
        route.push("/login");
      }
    });
    return () => unsubscribe();
  }, [id, route]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const chatRoomsRef = collection(db, "conversations");
        const chatRoomsQuery = query(
          chatRoomsRef,
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(chatRoomsQuery);

        const rooms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          lastMessage: doc.data().lastMessage,
          timestamp: doc.data().timestamp
            ? doc.data().timestamp.toDate()
            : null,
        }));

        setChatRooms(rooms);
      } catch (error) {
        console.error("🔥 Failed to fetch chat rooms:", error);
      }
    };

    fetchChatRooms();
  }, []);

  const saveMessageToFirestore = async (
    userId: string,
    role: string,
    message: string,
    conversationId: string,
    imageData?: string | null
  ) => {
    try {
      console.log("Saving message to Firestore:", {
        userId,
        role,
        message,
        conversationId,
        imageData,
      });

      const convoRef = doc(db, "conversations", conversationId);
      const messagesRef = collection(convoRef, "messages");

      const messageDoc = await addDoc(messagesRef, {
        role,
        message,
        timestamp: serverTimestamp(),
        ...(imageData && { image: imageData }),
      });

      console.log("Message saved with ID:", messageDoc.id);

      await setDoc(
        convoRef,
        {
          userId,
          lastMessage: message,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("🔥 Failed to save message to Firestore:", error);
    }
  };

  const sendMessage = async ({
    imageBase64,
  }: { imageBase64?: string | null } = {}) => {
    console.log("🖼️ Send Message - Initial Image State:", {
      file: uploadedImage.file ? "Present" : "Not Present",
      preview: uploadedImage.preview
        ? uploadedImage.preview.substring(0, 100) + "..."
        : "Not Present",
      base64: uploadedImage.base64
        ? `${uploadedImage.base64.substring(0, 50)}... (${
            uploadedImage.base64.length
          } chars)`
        : "Not Present",
    });

    if (!inputMessage.trim() && !uploadedImage.file) {
      console.log("🚫 No message or image to send");
      return null;
    }

    const userMessage: any = {
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
      id: `user-${Date.now()}`,
    };

    if (imageBase64) {
      userMessage.images = [imageBase64];
    }

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setInputMessage("");
    setIsTyping(true);
    setStreamedReply("");

    if (!userId) {
      console.log("🚫 User not logged in");
      setIsTyping(false);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "You must be logged in to chat.",
          id: `assistant-${Date.now()}`,
        },
      ]);
      return null;
    }

    // Generate a new conversation ID from Firestore
    const convoRef = await addDoc(collection(db, "conversations"), {
      userId,
      lastMessage: inputMessage,
      timestamp: serverTimestamp(),
    });
    const conversationId = convoRef.id;

    console.log("💾 Saving message to Firestore", {
      userId,
      inputMessage,
      conversationId,
      imagePreview: uploadedImage.preview ? "Present" : "Not Present",
      imageBase64: uploadedImage.base64
        ? `${uploadedImage.base64.substring(0, 50)}... (${
            uploadedImage.base64.length
          } chars)`
        : "Not Present",
    });
    await saveMessageToFirestore(
      userId,
      "user",
      inputMessage,
      conversationId,
      imageBase64
    );

    const cleanHistory = updatedHistory
      .filter((m) => m.role !== "system")
      .slice(-20);
    const messagesForAPI = [
      { role: "system", content: currentSystemPrompt },
      ...cleanHistory,
    ];

    try {
      const imageData = uploadedImage.base64;

      console.log("🖼️ Image Data Preparation:", {
        originalPreview: uploadedImage.preview
          ? uploadedImage.preview.substring(0, 100) + "..."
          : "No Preview",
        extractedBase64: imageData
          ? `${imageData.substring(0, 50)}... (${imageData.length} chars)`
          : "No Base64 Data",
      });

      const apiPayload = {
        model: "gemma3:4b",
        stream: true,
        think: false,
        raw: false,
        messages: messagesForAPI,
        ...(imageData && {
          images: [imageData],
        }),
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
      };

      console.log("🚀 Ollama API Payload:", {
        hasImages: !!imageData,
        messagesCount: messagesForAPI.length,
        imageDataLength: imageData ? imageData.length : "N/A",
      });

      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      console.log("🌐 Ollama API Response:", {
        status: response.status,
        statusText: response.statusText,
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
              if (
                json.message &&
                json.message.role === "assistant" &&
                typeof json.message.content === "string" &&
                !json.message.thinking
              ) {
                aiReply += json.message.content;
                setStreamedReply(aiReply);
              }
            } catch (err) {}
          }
        }
      }

      setIsTyping(false);

      if (aiReply && userId) {
        await saveMessageToFirestore(
          userId,
          "assistant",
          aiReply,
          conversationId
        );
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiReply,
            timestamp: new Date(),
            id: `assistant-${Date.now()}`,
          },
        ]);
      }

      // Return the conversation ID
      return conversationId;
    } catch (err) {
      setIsTyping(false);
      setStreamedReply("");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to my quantum heart right now. Please try again soon. 💔",
          timestamp: new Date(),
          id: `assistant-${Date.now()}`,
        },
      ]);
      return null;
    } finally {
      clearUploadedImage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleNewChat = async () => {
    try {
      const docRef = await addDoc(collection(db, "conversations"), {
        userId,
        lastMessage: "",
        timestamp: serverTimestamp(),
      });
      const newChat = {
        id: docRef.id,
        name: `New Chat ${chatRooms.length + 1}`,
        lastMessage: "Start a conversation...",
        timestamp: "now",
      };
      setChatRooms((prev) => [newChat, ...prev]);
      route.push(`/chat/${docRef.id}`);
    } catch (err) {
      console.error("🔥 Failed to create new conversation:", err);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, "conversations", chatId));
      setChatRooms((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (err) {
      console.error("🔥 Failed to delete conversation:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        route.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleProfile = () => {
    route.push(`/profile`);
  };

  const handleChatClick = (chatId: string) => {
    route.push(`/chat/${chatId}`);
  };

  const clearUploadedImage = () => {
    setUploadedImage({ file: null, preview: null, base64: null });
  };

  // Dropdown and message actions can be further extracted if needed

  return {
    chatHistory,
    setChatHistory,
    inputMessage,
    setInputMessage,
    isTyping,
    setIsTyping,
    streamedReply,
    setStreamedReply,
    sidebarOpen,
    setSidebarOpen,
    dropdownOpen,
    setDropdownOpen,
    chatRooms,
    setChatRooms,
    messagesEndRef,
    chatContainerRef,
    userId,
    setUserId,
    sendMessage,
    handleKeyPress,
    handleNewChat,
    handleDeleteChat,
    handleLogout,
    handleProfile,
    handleChatClick,
    uploadedImage,
    setUploadedImage,
    clearUploadedImage,
  };
}
