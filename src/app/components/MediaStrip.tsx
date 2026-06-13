import { Eye, Trash2, FileText } from "lucide-react";
import { motion } from "motion/react";
import type { MediaItem } from "../hooks/useSectionMedia";

interface Props {
  items: MediaItem[];
  isEditing: boolean;
  onRemove: (id: string) => void;
  onPreview: (item: MediaItem) => void;
}

export function MediaStrip({ items, isEditing, onRemove, onPreview }: Props) {
  if (items.length === 0 && !isEditing) return null;
  if (items.length === 0) return null;

  return (
    <div className="px-6 md:px-12 pb-8 bg-inherit">
      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
          Attachments
        </p>
        <div className="flex flex-wrap gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group"
            >
              {/* Thumbnail */}
              <div
                className="w-28 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer flex items-center justify-center"
                onClick={() => onPreview(item)}
              >
                {item.type === "image" ? (
                  <img
                    src={item.dataUrl}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-neutral-500 dark:text-neutral-400 px-2 text-center">
                    <FileText className="w-7 h-7 text-red-500" />
                    <span className="text-xs font-medium truncate w-full text-center leading-tight">PDF</span>
                  </div>
                )}

                {/* Eye overlay — always visible on hover, always present on mobile */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 px-2 py-1 rounded-lg">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">Preview</span>
                  </div>
                </div>

                {/* Always-visible eye icon for touch/mobile */}
                <div className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-md sm:hidden">
                  <Eye className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Filename */}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 w-28 truncate text-center">
                {item.filename}
              </p>

              {/* Remove button — edit mode only */}
              {isEditing && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                  aria-label="Remove attachment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
