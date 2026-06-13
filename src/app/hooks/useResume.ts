import { useState } from "react";

export interface ResumeData {
  filename: string;
  mimeType: string;
  dataUrl: string; // base64 data URL
}

const STORAGE_KEY = "portfolio_resume";

export function useResume() {
  const [resume, setResume] = useState<ResumeData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data: ResumeData = {
        filename: file.name,
        mimeType: file.type,
        dataUrl: reader.result as string,
      };
      setResume(data);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Storage quota exceeded — file too large
        alert("File is too large to store locally. Please use a smaller file (under ~4 MB).");
      }
    };
    reader.readAsDataURL(file);
  };

  const remove = () => {
    setResume(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const download = () => {
    if (!resume) return;
    const link = document.createElement("a");
    link.href = resume.dataUrl;
    link.download = resume.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { resume, upload, remove, download };
}
