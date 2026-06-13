import { useEffect, useState, useCallback } from "react";
import { X, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { MediaItem } from "../hooks/useSectionMedia";

interface Props {
  item: MediaItem | null;
  onClose: () => void;
}

export function MediaPreviewModal({ item, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Build a blob URL for PDFs so iframes can render them reliably
  useEffect(() => {
    if (!item || item.type !== "pdf") {
      setBlobUrl(null);
      return;
    }
    let revoke: string | null = null;
    fetch(item.dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        revoke = url;
        setBlobUrl(url);
      });
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [item]);

  const handleDownload = useCallback(() => {
    if (!item) return;
    const link = document.createElement("a");
    link.href = item.dataUrl;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [item]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="media-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={onClose}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors text-sm"
              title="Download file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
              title="Close preview (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filename */}
          <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <p className="text-white text-sm font-medium truncate max-w-xs">{item.filename}</p>
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === "image" ? (
              <img
                src={item.dataUrl}
                alt={item.filename}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            ) : blobUrl ? (
              <iframe
                src={blobUrl}
                title={item.filename}
                className="w-full h-[85vh] rounded-xl shadow-2xl bg-white"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-white">
                <FileText className="w-16 h-16 opacity-50" />
                <p className="text-sm opacity-70">Loading PDF…</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
