import { useState, useCallback } from "react";

export interface MediaItem {
  id: string;
  filename: string;
  mimeType: string;
  dataUrl: string;
  type: "image" | "pdf";
}

function storageKey(sectionId: string) {
  return `portfolio_media_${sectionId}`;
}

export function useSectionMedia(sectionId: string) {
  const [items, setItems] = useState<MediaItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey(sectionId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback(
    (next: MediaItem[]) => {
      setItems(next);
      try {
        localStorage.setItem(storageKey(sectionId), JSON.stringify(next));
      } catch {
        alert("Storage limit reached. Try removing unused images or use smaller files.");
      }
    },
    [sectionId]
  );

  const addMedia = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const item: MediaItem = {
          id: `media_${Date.now()}`,
          filename: file.name,
          mimeType: file.type,
          dataUrl: reader.result as string,
          type: file.type === "application/pdf" ? "pdf" : "image",
        };
        persist([...items, item]);
      };
      reader.readAsDataURL(file);
    },
    [items, persist]
  );

  const removeMedia = useCallback(
    (id: string) => persist(items.filter((i) => i.id !== id)),
    [items, persist]
  );

  return { items, addMedia, removeMedia };
}
