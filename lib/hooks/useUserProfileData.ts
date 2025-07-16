"use client";

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  location: string;
  status: string;
  aiPersona: string;
  relationshipLevel: number;
  chatStyle: string;
  interests: string[];
  voicePreference: string;
  language: string;
  activityStats: {
    messagesSent: number;
    chatHours: number;
    firstChatDate: Date | null;
    topTopic: string;
  };
}

export function useUserProfileData() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create a default user profile if not found
        const defaultProfile: UserProfile = {
          uid,
          displayName: "Quantum User",
          username: `@quantum_${uid.slice(0, 8)}`,
          location: "Cyber Realm",
          status: "Exploring digital consciousness",
          aiPersona: "AI Companion",
          relationshipLevel: 50,
          chatStyle: "Poetic & Introspective",
          interests: ["Technology", "Philosophy"],
          voicePreference: "Soft & Melodic",
          language: "English",
          activityStats: {
            messagesSent: 0,
            chatHours: 0,
            firstChatDate: new Date(),
            topTopic: "Getting Started",
          },
        };

        // Save the default profile
        await setDoc(userDocRef, defaultProfile);

        setProfile(defaultProfile);
        setLoading(false);
        return defaultProfile;
      }

      const userData = userDoc.data() as UserProfile;
      setProfile(userData);
      setLoading(false);
      return userData;
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        if (!userId) {
          throw new Error("Not authenticated");
        }

        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });

        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        return true;
      } catch (err: any) {
        console.error("Profile update error:", err);
        setError(err.message);
        return false;
      }
    },
    [userId]
  );

  const clearChatHistory = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Delete all messages in user's conversations
      const conversationsRef = collection(db, "conversations");
      const userConversationsQuery = query(
        conversationsRef,
        where("userId", "==", userId)
      );
      const conversationSnapshot = await getDocs(userConversationsQuery);

      const deletePromises = conversationSnapshot.docs.map(async (convoDoc) => {
        const messagesRef = collection(convoDoc.ref, "messages");
        const messagesSnapshot = await getDocs(messagesRef);

        // Delete all messages
        const messageDeletePromises = messagesSnapshot.docs.map((messageDoc) =>
          deleteDoc(messageDoc.ref)
        );

        await Promise.all(messageDeletePromises);

        // Delete conversation document
        await deleteDoc(convoDoc.ref);
      });

      await Promise.all(deletePromises);

      // Reset relationship level
      await updateProfile({
        relationshipLevel: 10,
        activityStats: {
          messagesSent: 0,
          chatHours: 0,
          firstChatDate: null,
          topTopic: "",
        },
      });

      return true;
    } catch (err: any) {
      console.error("Clear history error:", err);
      setError(err.message);
      return false;
    }
  }, [updateProfile, userId]);

  const downloadChatHistory = useCallback(async () => {
    try {
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const conversationsRef = collection(db, "conversations");
      const userConversationsQuery = query(
        conversationsRef,
        where("userId", "==", userId)
      );
      const conversationSnapshot = await getDocs(userConversationsQuery);

      const allMessages: any[] = [];

      for (const convoDoc of conversationSnapshot.docs) {
        const messagesRef = collection(convoDoc.ref, "messages");
        const messagesSnapshot = await getDocs(messagesRef);

        const conversationMessages = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          conversationId: convoDoc.id,
        }));

        allMessages.push(...conversationMessages);
      }

      // Sort messages chronologically
      allMessages.sort(
        (a, b) =>
          (a.timestamp?.toDate() || new Date()) -
          (b.timestamp?.toDate() || new Date())
      );

      // Create downloadable JSON file
      const jsonContent = JSON.stringify(allMessages, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `chat_history_${userId}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (err: any) {
      console.error("Download history error:", err);
      setError(err.message);
      return false;
    }
  }, [userId]);

  const submitSupportTicket = useCallback(
    async (issueText: string) => {
      try {
        if (!userId) {
          throw new Error("Not authenticated");
        }

        const supportTicketsRef = collection(db, "supportTickets");
        await addDoc(supportTicketsRef, {
          userId,
          issueText,
          createdAt: serverTimestamp(),
          status: "open",
        });

        return true;
      } catch (err: any) {
        console.error("Support ticket error:", err);
        setError(err.message);
        return false;
      }
    },
    [userId]
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserProfile(user.uid);
      } else {
        setUserId(null);
        setProfile(null);
        setLoading(false);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile, router]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    clearChatHistory,
    downloadChatHistory,
    submitSupportTicket,
    fetchUserProfile,
  };
}
