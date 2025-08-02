import { useCallback } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useMessageActions({
  setChatHistory,
  userId,
  conversationId,
}: {
  setChatHistory: any;
  userId?: string | null;
  conversationId?: string;
}) {
  const handleDropdownToggle = useCallback(
    (
      index: number,
      dropdownOpen: { [key: number]: boolean },
      setDropdownOpen: (cb: any) => void
    ) => {
      setDropdownOpen((prev: { [key: number]: boolean }) => ({
        ...prev,
        [index]: !prev[index],
      }));
    },
    []
  );

  const handleCopyMessage = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleDeleteMessage = useCallback(
    (message: any) => {
      // Firestore delete logic (implement as needed)
      setChatHistory((prev: any[]) =>
        prev.filter((msg) => msg.id !== message.id)
      );
    },
    [setChatHistory]
  );

  const handleViewDetails = useCallback((message: any) => {
    // Modal with timestamp, id, etc (implement as needed)
    alert(
      `Message ID: ${message.id}\nRole: ${message.role}\nContent: ${message.content}`
    );
  }, []);

  const handleEditMessage = useCallback(() => {
    alert("Edit message feature coming soon!");
  }, []);

  const handleReaction = useCallback(
    async (message: any, reactionType: "like" | "dislike") => {
      console.log("Reaction attempt:", {
        userId,
        conversationId,
        reactionType,
        message,
      });

      if (!userId || !conversationId) {
        console.error("Reaction failed: Missing userId or conversationId", {
          userId,
          conversationId,
        });
        alert("Must be logged in to react");
        return;
      }

      try {
        // Reference to the specific message document
        const messageRef = doc(
          db,
          "conversations",
          conversationId,
          "messages",
          message.id
        );

        // Update the message with reaction
        await updateDoc(messageRef, {
          [`${reactionType}d`]: true,
          [`${reactionType === "like" ? "disliked" : "liked"}`]: false,
        });

        // Optimistically update local state
        setChatHistory((prev: any[]) =>
          prev.map((msg) =>
            msg.id === message.id
              ? {
                  ...msg,
                  liked: reactionType === "like",
                  disliked: reactionType === "dislike",
                }
              : msg
          )
        );
      } catch (error) {
        console.error("Failed to update reaction:", error);
        alert("Failed to update reaction");
      }
    },
    [userId, conversationId, setChatHistory]
  );

  const handleThumbUp = useCallback(
    (message: any) => {
      handleReaction(message, "like");
    },
    [handleReaction]
  );

  const handleThumbDown = useCallback(
    (message: any) => {
      handleReaction(message, "dislike");
    },
    [handleReaction]
  );

  const handleRegenerate = useCallback((message: any) => {
    // Trigger resend of previous user message (implement as needed)
    alert("Regenerate feature coming soon!");
  }, []);

  const handleShare = useCallback(() => {
    alert("Share feature coming soon!");
  }, []);

  return {
    handleDropdownToggle,
    handleCopyMessage,
    handleDeleteMessage,
    handleViewDetails,
    handleEditMessage,
    handleThumbUp,
    handleThumbDown,
    handleRegenerate,
    handleShare,
  };
}
