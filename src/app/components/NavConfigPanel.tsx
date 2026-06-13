import { useState } from "react";
import { X, Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import type { NavItem } from "../hooks/useNavConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  onSave: (items: NavItem[]) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<NavItem>) => void;
}

// All section IDs available for scrolling to
const SECTION_TARGETS = [
  { value: "",         label: "Top of page (Home)" },
  { value: "projects", label: "Projects section" },
  { value: "contact",  label: "Contact section" },
  { value: "about",    label: "About section" },
  { value: "skills",   label: "Skills section" },
  { value: "stats",    label: "Stats section" },
];

function DraggableNavRow({
  item,
  onRemove,
  onUpdate,
}: {
  item: NavItem;
  onRemove: () => void;
  onUpdate: (patch: Partial<NavItem>) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item value={item} as="div" dragListener={false} dragControls={controls} className="flex flex-col gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-neutral-400 flex-shrink-0"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Label */}
        <input
          type="text"
          value={item.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Link label"
          className="flex-1 px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:border-blue-500 min-w-0"
        />

        {/* External toggle */}
        <button
          onClick={() => onUpdate({ isExternal: !item.isExternal })}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${item.isExternal ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-600 text-neutral-500"}`}
          title="Toggle external link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Target */}
      {item.isExternal ? (
        <input
          type="url"
          value={item.href || ""}
          onChange={(e) => onUpdate({ href: e.target.value })}
          placeholder="https://..."
          className="w-full px-2 py-1.5 text-xs border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:border-blue-500 ml-6"
        />
      ) : (
        <select
          value={item.targetId}
          onChange={(e) => onUpdate({ targetId: e.target.value })}
          className="w-full px-2 py-1.5 text-xs border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:border-blue-500 ml-6"
        >
          {SECTION_TARGETS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
          <option value="__custom__">Custom section ID…</option>
        </select>
      )}
    </Reorder.Item>
  );
}

export function NavConfigPanel({ isOpen, onClose, items, onSave, onAdd, onRemove, onUpdate }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="nc-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div
            key="nc-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h2 className="text-xl font-bold">Navigation</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Add, remove and reorder nav links</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Drag to reorder · Click <ExternalLink className="w-3 h-3 inline" /> to switch between scroll-to and external URL.
              </p>
              <Reorder.Group axis="y" values={items} onReorder={onSave} as="div" className="space-y-3">
                {items.map((item) => (
                  <DraggableNavRow
                    key={item.id}
                    item={item}
                    onRemove={() => onRemove(item.id)}
                    onUpdate={(patch) => onUpdate(item.id, patch)}
                  />
                ))}
              </Reorder.Group>

              <button
                onClick={onAdd}
                className="w-full mt-4 py-3 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Nav Link
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Changes apply instantly to the header
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
