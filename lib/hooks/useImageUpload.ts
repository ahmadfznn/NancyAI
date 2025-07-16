import { useState, useCallback } from "react";

export function useImageUpload() {
  const [uploadedImage, setUploadedImage] = useState<{
    file: File | null;
    preview: string | null;
    base64: string | null;
    fullBase64?: string | null;
    type?: string | null;
  }>({
    file: null,
    preview: null,
    base64: null,
    fullBase64: null,
    type: null,
  });

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          alert("Invalid file type. Please upload JPEG, PNG, or GIF.");
          return;
        }

        if (file.size > maxSize) {
          alert("File is too large. Maximum size is 5MB.");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Pure = result.includes(",") ? result.split(",")[1] : null;

          setUploadedImage({
            file,
            preview: result,
            base64: base64Pure,
            fullBase64: result,
            type: file.type,
          });

          console.log("🖼️ Image Upload Debug:", {
            fileType: file.type,
            fileSize: file.size,
            base64Length: result.length,
            base64Prefix: result.substring(0, 50) + "...",
            extractedBase64Length: base64Pure?.length || 0,
          });
        };

        reader.readAsDataURL(file);
      }
    },
    []
  );

  const clearUploadedImage = useCallback(() => {
    setUploadedImage({
      file: null,
      preview: null,
      base64: null,
      fullBase64: null,
      type: null,
    });
  }, []);

  return {
    uploadedImage,
    handleImageUpload,
    clearUploadedImage,
  };
}
