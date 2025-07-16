import { useState, useCallback, useEffect } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check browser support
    if (!("webkitSpeechRecognition" in window)) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    // Create recognition instance once
    const recognitionInstance = new (window as any).webkitSpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
    };

    recognitionInstance.onerror = (event: any) => {
      let errorMessage = "Speech recognition error";
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech was detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage =
            "No microphone was found. Ensure microphone is connected.";
          break;
        case "not-allowed":
          errorMessage =
            "Speech recognition permission was denied. Please check browser settings.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    // Cleanup function
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!recognition) {
      setError("Speech recognition not initialized");
      return;
    }

    try {
      // Check microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start speech recognition
      recognition.start();
    } catch (err: any) {
      console.error("Microphone access error:", err);

      // Detailed error handling
      if (err.name === "NotAllowedError") {
        setError(
          "Microphone access blocked. Please allow microphone permissions in your browser settings."
        );
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError(`Microphone access error: ${err.message}`);
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  const clearTranscription = useCallback(() => {
    setTranscription("");
    setError(null);
  }, []);

  return {
    transcription,
    isListening,
    error,
    startListening,
    stopListening,
    clearTranscription,
  };
}
