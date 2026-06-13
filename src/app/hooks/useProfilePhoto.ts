import { useState } from "react";

const STORAGE_KEY = "portfolio_profile_photo";

export function useProfilePhoto() {
  const [customPhoto, setCustomPhoto] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomPhoto(dataUrl);
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch {
        alert("Image is too large to store. Please use a smaller or more compressed image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const remove = () => {
    setCustomPhoto(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { customPhoto, upload, remove };
}
